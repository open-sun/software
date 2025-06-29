from flask import Blueprint, jsonify, request, send_file
import os, csv, json
from datetime import datetime
import tempfile

fish_bp = Blueprint("fish", __name__)

# 全局缓存变量，用于存储上传的数据
fish_data_cache = None
cache_timestamp = None

@fish_bp.route('/api/fishdata', methods=['GET'])
def get_fish_data():
    global fish_data_cache, cache_timestamp
    
    # 如果缓存存在且有效，则使用缓存数据
    if fish_data_cache is not None:
        return jsonify({
            "result": 1,
            "total": len(fish_data_cache["tbody"]),
            "thead": fish_data_cache["thead"],
            "tbody": fish_data_cache["tbody"],
            "cache_timestamp": cache_timestamp,
            "from_cache": True
        }), 200
    
    # 否则从文件读取
    fish_file_path = os.path.join(os.path.dirname(__file__), 'data', 'Fish.csv')

    if not os.path.exists(fish_file_path):
        return jsonify({"error": "Fish.csv 文件不存在"}), 404

    try:
        with open(fish_file_path, 'r', encoding='utf-8') as csvfile:
            reader = csv.DictReader(csvfile)
            rows = list(reader)

        # 更新缓存
        fish_data_cache = {
            "thead": reader.fieldnames,
            "tbody": rows
        }
        cache_timestamp = datetime.now().isoformat()
        
        return jsonify({
            "result": 1,
            "total": len(rows),
            "thead": reader.fieldnames,
            "tbody": rows,
            "from_cache": False
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@fish_bp.route('/api/fishdata/upload', methods=['POST'])
def upload_fish_data():
    global fish_data_cache, cache_timestamp
    
    try:
        # 检查是否有文件上传
        if 'file' not in request.files:
            return jsonify({"error": "没有上传文件"}), 400
        
        file = request.files['file']
        
        # 检查文件名
        if file.filename == '':
            return jsonify({"error": "未选择文件"}), 400
        
        # 检查文件类型
        if not file.filename.endswith('.csv'):
            return jsonify({"error": "只支持CSV文件格式"}), 400
        
        # 读取上传的CSV文件
        content = file.read().decode('utf-8')
        csv_reader = csv.DictReader(content.splitlines())
        rows = list(csv_reader)
        
        # 验证数据格式
        required_fields = ["Species", "Weight(g)", "Length1(cm)", "Length2(cm)", "Length3(cm)", "Height(cm)", "Width(cm)"]
        for field in required_fields:
            if field not in csv_reader.fieldnames:
                return jsonify({"error": f"CSV文件缺少必要字段: {field}"}), 400
        
        # 更新缓存
        fish_data_cache = {
            "thead": csv_reader.fieldnames,
            "tbody": rows
        }
        cache_timestamp = datetime.now().isoformat()
        
        return jsonify({
            "result": 1,
            "message": "数据上传成功",
            "total": len(rows),
            "cache_timestamp": cache_timestamp
        }), 200
        
    except Exception as e:
        return jsonify({"error": f"上传处理错误: {str(e)}"}), 500

@fish_bp.route('/api/fishdata/download', methods=['GET'])
def download_fish_data():
    global fish_data_cache
    
    try:
        # 确定下载源：缓存或原始文件
        use_cache = request.args.get('use_cache', 'true').lower() == 'true'
        
        if use_cache and fish_data_cache is not None:
            # 从缓存创建临时CSV文件
            fd, temp_path = tempfile.mkstemp(suffix='.csv')
            with os.fdopen(fd, 'w', newline='') as temp_file:
                writer = csv.DictWriter(temp_file, fieldnames=fish_data_cache["thead"])
                writer.writeheader()
                writer.writerows(fish_data_cache["tbody"])
            
            filename = f"fish_data_cache_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
            
        else:
            # 使用原始文件
            fish_file_path = os.path.join(os.path.dirname(__file__), 'data', 'Fish.csv')
            if not os.path.exists(fish_file_path):
                return jsonify({"error": "Fish.csv 文件不存在"}), 404
            
            temp_path = fish_file_path
            filename = "Fish.csv"
        
        # 发送文件
        return send_file(
            temp_path,
            as_attachment=True,
            download_name=filename,
            mimetype='text/csv'
        )
        
    except Exception as e:
        return jsonify({"error": f"下载处理错误: {str(e)}"}), 500

@fish_bp.route('/api/fishdata/cache/status', methods=['GET'])
def get_cache_status():
    global fish_data_cache, cache_timestamp
    
    return jsonify({
        "has_cache": fish_data_cache is not None,
        "cache_timestamp": cache_timestamp,
        "rows_count": len(fish_data_cache["tbody"]) if fish_data_cache else 0
    }), 200

@fish_bp.route('/api/fishdata/cache/clear', methods=['POST'])
def clear_cache():
    global fish_data_cache, cache_timestamp
    
    fish_data_cache = None
    cache_timestamp = None
    
    return jsonify({
        "result": 1,
        "message": "缓存已清除"
    }), 200
