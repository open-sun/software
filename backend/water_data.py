from flask import Blueprint, request, jsonify,send_from_directory
import os, json, csv
import pymysql
water_bp = Blueprint("water", __name__)
DATA_DIR = os.path.join(os.path.dirname(__file__), 'data', 'WaterQualitybyDate')
BASE_DIR = os.path.join(DATA_DIR, 'water_quality_by_name')
@water_bp.route('/data/<path:filename>')
def serve_data(filename):
    return send_from_directory('data', filename)




import config 

# 数据库连接配置 (请替换为您的实际数据库信息)
DB_CONFIG = {
    'host': config.HOSTNAME,
    'user': config.USERNAME,
    'password': config.PASSWORD,
    'db': config.DATABASE,
    'charset': 'utf8mb4',
    'cursorclass': pymysql.cursors.DictCursor
}

@water_bp.route('/api/waterdata_by_name', methods=['GET'])
def get_water_data_by_name():
    province = request.args.get('province')
    basin = request.args.get('basin')
    site = request.args.get('site')

    if not province:
        return jsonify({"error": "Missing query parameter: province"}), 400

    conn = None
    try:
        conn = pymysql.connect(**DB_CONFIG)
        cursor = conn.cursor()

        # 定义数据库列名到前端期望的中文键的映射
        # 这是为了确保 tbody 内部的字典键名是中文，与前端 CSV DictReader 的输出一致
        column_map = {
            "province": "省份",
            "river_basin": "流域",
            "section_name": "断面名称",
            "monitoring_time": "监测时间",
            "water_quality_category": "水质类别",
            "temperature": "水温(℃)",
            "ph": "pH(无量纲)",
            "dissolved_oxygen": "溶解氧(mg/L)",
            "conductivity": "电导率(μS/cm)",
            "turbidity": "浊度(NTU)",
            "permanganate_index": "高锰酸盐指数(mg/L)",
            "ammonia_nitrogen": "氨氮(mg/L)",
            "total_phosphorus": "总磷(mg/L)",
            "total_nitrogen": "总氮(mg/L)",
            "chlorophyll_a": "叶绿素α(mg/L)",
            "algae_density": "藻密度(cells/L)",
            "site_status": "站点情况"
        }
        
        # 原始 CSV 文件中的表头顺序（前端 thead 期望的顺序）
        # 这是一个手动定义的列表，确保 thead 顺序与原始 CSV 一致
        csv_header_order = [
            "省份", "流域", "断面名称", "监测时间", "水质类别", "水温(℃)", "pH(无量纲)",
            "溶解氧(mg/L)", "电导率(μS/cm)", "浊度(NTU)", "高锰酸盐指数(mg/L)",
            "氨氮(mg/L)", "总磷(mg/L)", "总氮(mg/L)", "叶绿素α(mg/L)",
            "藻密度(cells/L)", "站点情况"
        ]


        if not basin or not site:
            # 场景1: 只提供了 province，返回该省份下所有相关数据（模拟遍历所有文件）
            sql = """
            SELECT
                province, river_basin, section_name, monitoring_time, water_quality_category,
                temperature, ph, dissolved_oxygen, conductivity, turbidity,
                permanganate_index, ammonia_nitrogen, total_phosphorus, total_nitrogen,
                chlorophyll_a, algae_density, site_status
            FROM water_quality_data
            WHERE province = %s
            """
            cursor.execute(sql, (province,))
            results = cursor.fetchall() # 此时 results 是字典列表，键是数据库列名

            if not results:
                return jsonify({"error": f"No data found for province {province}"}), 404

            # 模拟原始文件的返回结构，聚合数据
            # 聚合时，将数据库的英文列名转换为前端期望的中文列名
            aggregated_data = {}
            for row in results:
                # 构造一个唯一的键来代表一个“文件”或“站点+流域”的组合
                key = (row['river_basin'], row['section_name'])
                
                # 将数据库列名转换为中文键名
                transformed_row = {column_map[k]: v for k, v in row.items()}

                if key not in aggregated_data:
                    aggregated_data[key] = {
                        "file": f"{row['section_name']}.csv", # 模拟文件名
                        "path": f"/{province}/{row['river_basin']}/{row['section_name']}/", # 模拟路径
                        "total": 0,
                        "thead": csv_header_order, # 使用手动定义的 CSV 表头顺序
                        "tbody": []
                    }
                aggregated_data[key]["tbody"].append(transformed_row)
                aggregated_data[key]["total"] += 1

            # 核心修改：直接返回包含 "result" 和 "files" 的字典，而不是包裹在列表中
            return jsonify({
                "result": 1,
                "files": list(aggregated_data.values())
            }), 200

        else:
            # 场景2: 提供了 province, basin, 和 site，返回特定站点的数据
            sql = """
            SELECT
                province, river_basin, section_name, monitoring_time, water_quality_category,
                temperature, ph, dissolved_oxygen, conductivity, turbidity,
                permanganate_index, ammonia_nitrogen, total_phosphorus, total_nitrogen,
                chlorophyll_a, algae_density, site_status
            FROM water_quality_data
            WHERE province = %s AND river_basin = %s AND section_name = %s
            """
            cursor.execute(sql, (province, basin, site))
            results = cursor.fetchall()

            if not results:
                return jsonify({"error": f"No data found for {province}, {basin}, {site}"}), 404
            
            # 将数据库列名转换为前端期望的中文键名
            transformed_results = []
            for row in results:
                transformed_results.append({column_map[k]: v for k, v in row.items()})

            # 返回 JSON 格式的数据
            return jsonify({
                "result": 1,
                "total": len(transformed_results),
                "thead": csv_header_order, # 使用手动定义的 CSV 表头顺序
                "tbody": transformed_results
            }), 200

    except pymysql.Error as e:
        print(f"数据库查询错误: {e}")
        return jsonify({"error": "Database query failed", "details": str(e)}), 500
    except Exception as e:
        print(f"发生未知错误: {e}")
        return jsonify({"error": "An unexpected error occurred", "details": str(e)}), 500
    finally:
        if conn:
            conn.close()









@water_bp.route('/api/old_waterdata_by_name', methods=['GET'])
def old_get_water_data_by_name():
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
