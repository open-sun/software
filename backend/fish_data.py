from flask import Blueprint, jsonify
import os, csv

fish_bp = Blueprint("fish", __name__)

@fish_bp.route('/api/fishdata', methods=['GET'])
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
