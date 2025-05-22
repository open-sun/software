from flask import Blueprint, request, jsonify,send_from_directory
import os, json, csv

water_bp = Blueprint("water", __name__)
DATA_DIR = os.path.join(os.path.dirname(__file__), 'data', 'WaterQualitybyDate')
BASE_DIR = os.path.join(DATA_DIR, 'water_quality_by_name')
@water_bp.route('/data/<path:filename>')
def serve_data(filename):
    return send_from_directory('data', filename)

@water_bp.route('/api/TimeWaterData')
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

BASE_DIR = os.path.join(os.path.dirname(__file__), 'data', 'WaterQualitybyDate', 'water_quality_by_name')

@water_bp.route('/api/waterdata_by_name', methods=['GET'])
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
