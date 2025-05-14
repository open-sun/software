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

app = Flask(__name__)
CORS(app)

# 数据库配置
HOSTNAME = "127.0.0.1"
PORT = "3306"
DATABASE = "flask"
USERNAME = "root"
PASSWORD = "123456"# 注意更改
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
# 假设你的数据文件目录是 backend/data/水质数据/
DATA_DIR = os.path.join(os.path.dirname(__file__), 'data', '水质数据')

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
BASE_DIR = os.path.join(os.path.dirname(__file__), 'data', '水质数据', 'water_quality_by_name')

@app.route('/api/waterdata_by_name', methods=['GET'])
def get_water_data_by_name():
    province = request.args.get('province')
    basin = request.args.get('basin')
    site = request.args.get('site')

    if not province or not basin or not site:
        return jsonify({"error": "Missing query parameters. Required: province, basin, site"}), 400

    # 构造 CSV 文件路径
    file_path = os.path.join(BASE_DIR, province, basin, site, '2021-04', f'{site}.csv')

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
    users = User.query.all()
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


if __name__ == '__main__':
    app.run()