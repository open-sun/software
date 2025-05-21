from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import text
from werkzeug.security import generate_password_hash, check_password_hash  # 添加 check_password_hash
from flask_cors import CORS
from models import db, User

from flask import Flask, jsonify, request,send_from_directory
from flask_cors import CORS
import os
import json
import csv
import socket
import random
import requests

from SmartAI import chat,recognize_image_with_zhipu,process_uploaded_file
from dotenv import load_dotenv
import os
from werkzeug.utils import secure_filename




load_dotenv()




app = Flask(__name__)
CORS(app)

# 数据库配置
HOSTNAME = "127.0.0.1"
PORT = "3306"
DATABASE = "flask"
USERNAME = "root"
PASSWORD = os.getenv("DB_PASSWORD")
app.config['SQLALCHEMY_DATABASE_URI'] = f"mysql+pymysql://{USERNAME}:{PASSWORD}@{HOSTNAME}:{PORT}/{DATABASE}"
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False


db.init_app(app)

with app.app_context():
    # 1. 删除所有表（注意：此操作会清除所有数据！）
    db.drop_all()
    # 2. 根据模型重新创建所有表
    db.create_all()
@app.route('/data/<path:filename>')
def serve_data(filename):
    return send_from_directory('data', filename)
# 假设你的数据文件目录是 backend/data/WaterQualitybyDate/
DATA_DIR = os.path.join(os.path.dirname(__file__), 'data', 'WaterQualitybyDate')

@app.route('/api/TimeWaterData', methods=['GET'])
def get_time_water_data():
    # 通过查询参数指定日期，如 ?date=2021-01-01
    date = request.args.get('date')
    if not date:
        return jsonify({"error": "Missing 'date' query parameter"}), 400

    # 组装文件路径
    date_parts = date.split("-")
    if len(date_parts) != 3:
        return jsonify({"error": "Invalid date format. Use YYYY-MM-DD"}), 400

    folder_name = f"{date_parts[0]}-{date_parts[1]}"
    file_name = f"{date}.json"
    file_path = os.path.join(DATA_DIR, folder_name, file_name)

    if not os.path.exists(file_path):
        return jsonify({"error": f"Data file for {date} not found"}), 404

    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        return jsonify(data)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# CSV 文件目录
BASE_DIR = os.path.join(os.path.dirname(__file__), 'data', 'WaterQualitybyDate', 'water_quality_by_name')

@app.route('/api/waterdata_by_name', methods=['GET'])
def get_water_data_by_name():
    province = request.args.get('province')
    basin = request.args.get('basin')
    site = request.args.get('site')

    if not province:
        return jsonify({"error": "Missing query parameter: province"}), 400

    # 构造基础目录路径
    base_path = os.path.join(BASE_DIR, province)

    # 如果 basin 或 site 为空，遍历目录
    if not basin or not site:
        try:
            results = []
            # 遍历指定目录下的所有 CSV 文件
            for root, _, files in os.walk(base_path):
                for file in files:
                    if file.endswith('.csv'):
                        file_path = os.path.join(root, file)
                        with open(file_path, 'r', encoding='utf-8') as csvfile:
                            reader = csv.DictReader(csvfile)
                            rows = list(reader)
                            results.append({
                                "file": file,
                                "path": file_path,
                                "total": len(rows),
                                "thead": reader.fieldnames,
                                "tbody": rows
                            })
            return jsonify({"result": 1, "files": results}), 200
        except Exception as e:
            return jsonify({"error": str(e)}), 500

    # 如果 basin 和 site 都不为空，构造具体文件路径
    file_path = os.path.join(base_path, basin, site, '2021-04', f'{site}.csv')

    if not os.path.exists(file_path):
        return jsonify({"error": "Data file not found"}), 404

    try:
        with open(file_path, 'r', encoding='utf-8') as csvfile:
            reader = csv.DictReader(csvfile)
            rows = list(reader)
        return jsonify({
            "result": 1,
            "total": len(rows),
            "thead": reader.fieldnames,
            "tbody": rows
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500    

# videos文件目录
VIDEO_DIR = os.path.join(os.path.dirname(__file__), 'data', 'videos')

@app.route('/api/videos', methods=['GET'])
def get_videos():
    date = request.args.get('date')
    video_list = []

    try:
        if date:
            folder_path = os.path.join(VIDEO_DIR, date)
            if os.path.exists(folder_path):
                video_list = [
                    {
                        "filename": file,
                        "url": f"http://localhost:5000/data/videos/{date}/{file}"
                    }
                    for file in os.listdir(folder_path) if file.endswith('.mp4')
                ]
        
        # 调试输出
        print(f"Video List for {date}: {video_list}")
        
        return jsonify({"videos": video_list}), 200

    except Exception as e:
        print(f"Error fetching videos: {e}")
        return jsonify({"error": "获取视频列表失败"}), 500


from flask import send_from_directory, abort 
@app.route('/data/videos/<date>/<filename>')
def serve_video(date, filename):
    """
    根据日期和文件名提供视频文件
    """
    folder_path = os.path.join(VIDEO_DIR, date)
    file_path = os.path.join(folder_path, filename)

    # 确保路径合法且文件存在
    if not os.path.exists(file_path):
        abort(404)

    # 设置 Content-Type
    return send_from_directory(folder_path, filename, mimetype='video/mp4')





@app.route("/api/register", methods=["POST"])
def register():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    role = data.get('role')  # 默认为普通用户

    # 检查用户名是否已存在
    existing_user = User.query.filter_by(username=username).first()
    if existing_user:
            return jsonify({"ok": False, "message": "用户名已存在"}), 201

    try:
            # 密码哈希
            hashed_password = generate_password_hash(password)
            print(hashed_password)
           
            # 创建新用户
            new_user = User(
                username=username,
                password=hashed_password,
                role=role
            )
           
            db.session.add(new_user)
            db.session.commit()

            return jsonify({"ok": True, "message": "注册成功"}), 201

    except Exception as e:
            db.session.rollback()
            return jsonify({"ok": False, "message": "服务器内部错误"}), 500


@app.route("/api/login", methods=["POST"])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    

    # 检查用户名是否存在
    user = User.query.filter_by(username=username).first()
    if not user:
        return jsonify({"ok": False, "message": "用户名不存在"}), 201

    # 检查密码是否匹配
    if not check_password_hash(user.password, password):   # 修复这行
        return jsonify({"ok": False, "message": "密码错误"}), 201

    # 登录成功
    return jsonify({"ok": True, "message": "登录成功", "role": user.role}), 200



@app.route("/api/getusers", methods=["GET"])
def getusers():
    users = User.query.filter_by(role="user").all()  # Filter users by role 'user'
    user_list = [{"id": user.id, "username": user.username, "role": user.role} for user in users]
    return jsonify(user_list), 200



@app.route("/api/updateuserrole/<int:user_id>", methods=["PUT"])
def update_user_role(user_id):
    try:
        # 获取请求数据
        data = request.get_json()
        new_role = data.get('role')

        # 这里添加你的业务逻辑（示例）
        # 例如更新数据库中的用户角色
        user = User.query.get(user_id)
        user.role = new_role
        db.session.commit()

        return jsonify({
            "success": True,
            "message": f"用户 {user_id} 角色已更新为 {new_role}"
        }), 200

    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500
    
@app.route("/api/deleteuser/<int:user_id>", methods=["DELETE"])
def delete_user(user_id):
    try:
        user = User.query.get(user_id)
        if user:
            db.session.delete(user)
            db.session.commit()
            return jsonify({
                "success": True,
                "message": f"用户 {user_id} 已删除"
            }), 200
        else:
            return jsonify({
                "success": False,
                "message": f"用户 {user_id} 不存在"
            }), 404
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500



# # 获取日期排布水质数据
# @app.route('/api/waterquality', methods=['GET'])
# def get_water_quality():
#     """
#     根据月份和指标获取数据
#     - month: 2020-05
#     - indicator: 水温, pH, 溶解氧, 电导率, 浊度等
#     """
#     month = request.args.get('month')
#     indicator = request.args.get('indicator')

#     if not month or not indicator:
#         return jsonify({"error": "Missing 'month' or 'indicator' parameter"}), 400

#     # 数据路径：/data/水质数据/2020-05/
#     folder_path = os.path.join(DATA_DIR, month)

#     if not os.path.exists(folder_path):
#         return jsonify({"error": f"Data folder for {month} not found"}), 404

#     # 初始化返回数据
#     xAxisData = []
#     seriesData = []

#     # 遍历该月份下的所有 JSON 文件
#     for day in range(1, 32):
#         day_str = f"{day:02d}"
#         filename = f"{month}-{day_str}.json"
#         file_path = os.path.join(folder_path, filename)

#         if not os.path.exists(file_path):
#             # 文件不存在则跳过
#             xAxisData.append(day_str)
#             seriesData.append(None)
#             continue

#         try:
#             with open(file_path, 'r', encoding='utf-8') as file:
#                 data = json.load(file)
#                 if "thead" not in data or "tbody" not in data:
#                     continue

#                 # 找到指标列索引
#                 try:
#                     indicator_index = data["thead"].index(indicator)
#                 except ValueError:
#                     indicator_index = -1

#                 if indicator_index == -1:
#                     xAxisData.append(day_str)
#                     seriesData.append(None)
#                     continue

#                 # 遍历 tbody 获取当天数据
#                 daily_values = []
#                 for row in data["tbody"]:
#                     value = row[indicator_index]
#                     value = float(value) if value not in ["--", "*", None] else None
#                     daily_values.append(value)

#                 # 取当天平均值作为展示数据
#                 valid_values = [v for v in daily_values if v is not None]
#                 avg_value = sum(valid_values) / len(valid_values) if valid_values else None

#                 xAxisData.append(day_str)
#                 seriesData.append(avg_value)

#         except Exception as e:
#             print(f"Error reading {filename}: {e}")
#             xAxisData.append(day_str)
#             seriesData.append(None)

#     # 构建响应
#     response_data = {
#         "xAxisData": xAxisData,
#         "seriesData": seriesData
#     }
#     return jsonify(response_data), 200





@app.route('/api/fishdata', methods=['GET'])
def get_fish_data():
    fish_file_path = os.path.join(os.path.dirname(__file__), 'data', 'Fish.csv')

    if not os.path.exists(fish_file_path):
        return jsonify({"error": "Fish.csv 文件不存在"}), 404

    try:
        with open(fish_file_path, 'r', encoding='utf-8') as csvfile:
            reader = csv.DictReader(csvfile)
            rows = list(reader)

        return jsonify({
            "result": 1,
            "total": len(rows),
            "thead": reader.fieldnames,
            "tbody": rows
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/weather/current', methods=['GET'])
def get_weather():
    try:
        latitude = request.args.get('latitude', type=float)
        longitude = request.args.get('longitude', type=float)
        
        if not latitude or not longitude:
            return jsonify({'error': 'Latitude and longitude are required'}), 400
            
        # 使用OpenMeteo免费开放API
        url = 'https://api.open-meteo.com/v1/forecast'
        params = {
            'latitude': latitude,
            'longitude': longitude,
            'current': 'temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m',
            'daily': 'precipitation_sum',
            'forecast_days': 5,
            'timezone': 'auto'
        }
        
        print(f"Requesting OpenMeteo weather data: {params}")
        
        response = requests.get(url, params=params)
        
        if response.status_code == 200:
            data = response.json()
            print(f"Weather data received successfully")
            
            # 确保返回数据的结构一致
            if 'current' not in data:
                data['current'] = {
                    'temperature_2m': 0,
                    'wind_speed_10m': 0,
                    'relative_humidity_2m': 0,
                    'precipitation': 0,
                    'time': ''
                }
            
            # 如果没有降水量数据，设为0
            if 'precipitation' not in data['current']:
                data['current']['precipitation'] = 0
                
            # 确保daily数据存在
            if 'daily' not in data:
                data['daily'] = {
                    'time': [],
                    'precipitation_sum': []
                }
                
            return jsonify(data)
        else:
            error_msg = f"Failed to fetch weather data: {response.status_code}, {response.text}"
            print(error_msg)
            return jsonify({'error': error_msg}), response.status_code
            
    except Exception as e:
        error_msg = f"Error in weather API: {str(e)}"
        print(error_msg)
        return jsonify({'error': error_msg}), 500

@app.route('/api/market/prices', methods=['POST'])
def get_market_prices():
    try:
        # 从请求中获取日期参数，如果没有提供则使用前一天日期
        data = request.get_json()
        start_date = data.get('startDate')
        end_date = data.get('endDate')
        product_name = data.get('productName', '')
        
        if not start_date:
            # 默认使用前一天作为查询日期，而不是当前日期
            from datetime import datetime, timedelta
            yesterday = datetime.now() - timedelta(days=1)
            start_date = yesterday.strftime("%Y/%m/%d")
            print(f"未提供日期，使用前一天日期: {start_date}")
        
        # 创建会话对象
        session = requests.Session()
        
        # 首先GET一次主页，获取防爬Cookie
        init_url = "http://www.xinfadi.com.cn/marketanalysis.html"
        init_response = session.get(
            init_url,
            headers={
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
                "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
                "Accept-Language": "zh-CN,zh;q=0.9"
            }
        )
        
        print(f"初始请求状态码: {init_response.status_code}")
        print(f"获取到的Cookies: {session.cookies.get_dict()}")
        
        # 2. 准备接口URL、表单数据和请求头
        url = 'http://www.xinfadi.com.cn/getPriceData.html'
        
        # 使用固定的参数，严格按照示例
        payload = {
            "limit": "100",          # 增加到100条
            "current": "1",
            "pubDateStartTime": start_date,
            "pubDateEndTime": end_date if end_date else "", # 如果提供了结束日期则使用
            "prodPcatid": "1190",    # 这里是水产类别
            "prodCatid": "",         # 这里传空串，不要用"0"
            "prodName": product_name # 支持按产品名称筛选
        }
        
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
            "Accept": "application/json, text/javascript, */*; q=0.01",
            "Accept-Language": "zh-CN,zh;q=0.9",
            "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
            "Origin": "http://www.xinfadi.com.cn",
            "Referer": init_url,
            "X-Requested-With": "XMLHttpRequest",
        }
        
        # 3. 使用同一个会话发送POST请求
        response = session.post(url, data=payload, headers=headers)
        
        print(f"API请求状态码: {response.status_code}")
        print(f"查询参数: {payload}")
        print(f"最终Cookies状态: {session.cookies.get_dict()}")
        
        if response.status_code == 200:
            try:
                result = response.json()
                items_count = len(result.get('list', []))
                print(f"成功获取市场数据: {items_count}条")
                return jsonify(result)
            except ValueError as e:
                error_msg = f"解析JSON响应失败: {str(e)}"
                print(error_msg)
                print(f"原始响应内容: {response.text[:200]}")
                return jsonify({'error': error_msg}), 500
        else:
            error_msg = f"获取市场数据失败: {response.status_code}, {response.text}"
            print(error_msg)
            return jsonify({'error': error_msg}), response.status_code
            
    except Exception as e:
        error_msg = f"市场API错误: {str(e)}"
        print(error_msg)
        return jsonify({'error': error_msg}), 500

# 添加一个新接口，用于获取历史价格趋势
@app.route('/api/market/trends', methods=['POST'])
def get_market_trends():
    try:
        data = request.get_json()
        product_name = data.get('productName')
        spec_info = data.get('specInfo', '')  # 规格信息
        days = int(data.get('days', 7))  # 获取天数，默认7天
        
        if not product_name:
            return jsonify({'error': '产品名称不能为空'}), 400
            
        # 计算日期范围
        from datetime import datetime, timedelta
        today = datetime.now()
        
        # 同比数据：去年同期
        last_year = datetime(today.year-1, today.month, today.day)
        last_year_date = last_year.strftime("%Y/%m/%d")
        
        # 最近几天数据
        dates = []
        results = []
        
        for i in range(days):
            date = today - timedelta(days=i)
            formatted_date = date.strftime("%Y/%m/%d")
            dates.append(formatted_date)
            
            # 创建会话并获取某一天的数据
            session = requests.Session()
            init_url = "http://www.xinfadi.com.cn/marketanalysis.html"
            session.get(
                init_url,
                headers={
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
                    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
                    "Accept-Language": "zh-CN,zh;q=0.9"
                }
            )
            
            # 查询特定日期的数据
            url = 'http://www.xinfadi.com.cn/getPriceData.html'
            payload = {
                "limit": "100",
                "current": "1",
                "pubDateStartTime": formatted_date,
                "pubDateEndTime": formatted_date,
                "prodPcatid": "1190",
                "prodCatid": "",
                "prodName": product_name
            }
            
            headers = {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
                "Accept": "application/json, text/javascript, */*; q=0.01",
                "Accept-Language": "zh-CN,zh;q=0.9",
                "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
                "Origin": "http://www.xinfadi.com.cn",
                "Referer": init_url,
                "X-Requested-With": "XMLHttpRequest",
            }
            
            response = session.post(url, data=payload, headers=headers)
            
            if response.status_code == 200:
                try:
                    day_result = response.json()
                    # 过滤符合规格的数据
                    filtered_list = day_result.get('list', [])
                    if spec_info:
                        filtered_list = [item for item in filtered_list if item.get('specInfo') == spec_info]
                    
                    # 添加日期和数据到结果
                    daily_data = {
                        'date': formatted_date,
                        'items': filtered_list
                    }
                    results.append(daily_data)
                except Exception as e:
                    print(f"处理{formatted_date}数据出错: {str(e)}")
            
            # 休眠一小段时间，避免频繁请求
            import time
            time.sleep(0.5)
        
        # 获取去年同期数据
        try:
            session = requests.Session()
            session.get(init_url, headers=headers)
            
            last_year_payload = {
                "limit": "100",
                "current": "1",
                "pubDateStartTime": last_year_date,
                "pubDateEndTime": last_year_date,
                "prodPcatid": "1190",
                "prodCatid": "",
                "prodName": product_name
            }
            
            response = session.post(url, data=last_year_payload, headers=headers)
            
            last_year_data = None
            if response.status_code == 200:
                try:
                    last_year_result = response.json()
                    filtered_list = last_year_result.get('list', [])
                    if spec_info:
                        filtered_list = [item for item in filtered_list if item.get('specInfo') == spec_info]
                    
                    last_year_data = {
                        'date': last_year_date,
                        'items': filtered_list
                    }
                except Exception as e:
                    print(f"处理去年同期数据出错: {str(e)}")
        except Exception as e:
            print(f"获取去年同期数据出错: {str(e)}")
            last_year_data = None
        
        # 返回所有结果
        return jsonify({
            'product': product_name,
            'specInfo': spec_info,
            'current': results,
            'lastYear': last_year_data
        })
            
    except Exception as e:
        error_msg = f"获取价格趋势失败: {str(e)}"
        print(error_msg)
        return jsonify({'error': error_msg}), 500
    



@app.route("/chat", methods=["POST"])
def chat_route():
    data = request.get_json()
    user_input = data.get("input")

    if not user_input:
        return jsonify({"error": "Missing input field"}), 400

    try:
        response = chat(user_input)
        return jsonify({"response": response})
    except Exception as e:
        import traceback
        traceback.print_exc()  # 打印完整的错误栈
        return jsonify({"error": str(e)}), 500
    



@app.route("/recognizeIMG", methods=["POST"])
def recognize_image():
    if "file" not in request.files:
        return jsonify({"error": "Missing file field"}), 400

    file = request.files["file"]
    if file.filename == "":
        return jsonify({"error": "No selected file"}), 400

    try:
        image_bytes = file.read()

        # ✅ 调用封装的函数
        result_text = recognize_image_with_zhipu(image_bytes)

        return jsonify({"result": result_text})

    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500




@app.route("/recognizeFile", methods=["POST"])
def recognize_file():
    if "file" not in request.files:
        return jsonify({"error": "Missing file field"}), 400

    file = request.files["file"]
    if file.filename == "":
        return jsonify({"error": "No selected file"}), 400

    try:
        result_text = process_uploaded_file(file)
        return jsonify({"result": result_text})
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500


if __name__ == '__main__':
    app.run(debug=True)