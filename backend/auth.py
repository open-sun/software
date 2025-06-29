from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from models import db, User
import os
import csv
import tempfile
from flask import Response, jsonify, send_file
from models import User  # 假设你有 User 模型
from io import StringIO
import shutil
from models import WaterQualityData
from models import FishData
temp_dir = './temp'
if not os.path.exists(temp_dir):
    os.makedirs(temp_dir)
auth_bp = Blueprint("auth", __name__)

@auth_bp.route("/api/register", methods=["POST"])
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


@auth_bp.route("/api/login", methods=["POST"])
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


@auth_bp.route("/api/getusers", methods=["GET"])
def getusers():
    users = User.query.filter_by(role="user").all()  # Filter users by role 'user'
    user_list = [{"id": user.id, "username": user.username, "role": user.role} for user in users]
    return jsonify(user_list), 200

@auth_bp.route("/api/updateuserrole/<int:user_id>", methods=["PUT"])
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

@auth_bp.route("/api/deleteuser/<int:user_id>", methods=["DELETE"])
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


@auth_bp.route("/api/changepassword", methods=["POST"])
def change_password():
    data = request.get_json()
    username = data.get('username')
    old_password = data.get('old_password')
    new_password = data.get('new_password')

    user = User.query.filter_by(username=username).first()
    if not user:
        return jsonify({"ok": False, "message": "用户不存在"}), 404

    if not check_password_hash(user.password, old_password):
        return jsonify({"ok": False, "message": "旧密码错误"}), 201

    user.password = generate_password_hash(new_password)
    db.session.commit()

    return jsonify({"ok": True, "message": "密码修改成功"}), 200


import csv
from io import StringIO

from time import sleep
@auth_bp.route("/api/exportusers", methods=["GET"])
def export_users():
    try:
        # 从数据库获取所有用户
        users = User.query.all()
        
        # 创建 CSV 内容并存储在临时文件中
        temp_file_path = './temp/users.csv'
        with open(temp_file_path, 'w', newline='', encoding='utf-8') as output:
            writer = csv.writer(output)
            writer.writerow(['ID', '用户名', '角色'])  # 写入表头
            for user in users:
                writer.writerow([user.id, user.username, user.role])  # 写入用户数据

        # 返回生成的 CSV 文件
        return send_file(
            temp_file_path,
            as_attachment=True,
            download_name="users.csv",
            mimetype="text/csv"
        )

    except Exception as e:
        print(f"Error occurred while exporting users: {e}")
        return jsonify({"ok": False, "message": str(e)}), 500

    finally:
        # 等待下载完成后删除文件
        try:
            # 等待 1 秒，确保文件已被下载
            sleep(20)
            if os.path.exists(temp_file_path):
                os.remove(temp_file_path)
        except PermissionError:
            print(f"PermissionError: Could not delete the file {temp_file_path}")






@auth_bp.route("/api/addwaterqualitydata", methods=["POST"])
def add_water_quality_data():
    data = request.get_json()
    try:
        new_data = WaterQualityData(
            province=data.get("province"),
            river_basin=data.get("river_basin"),
            section_name=data.get("section_name"),
            monitoring_time=data.get("monitoring_time"),
            water_quality_category=data.get("water_quality_category"),
            temperature=data.get("temperature"),
            ph=data.get("ph"),
            dissolved_oxygen=data.get("dissolved_oxygen"),
            conductivity=data.get("conductivity"),
            turbidity=data.get("turbidity"),
            permanganate_index=data.get("permanganate_index"),
            ammonia_nitrogen=data.get("ammonia_nitrogen"),
            total_phosphorus=data.get("total_phosphorus"),
            total_nitrogen=data.get("total_nitrogen"),
            chlorophyll_a=data.get("chlorophyll_a"),
            algae_density=data.get("algae_density"),
            site_status=data.get("site_status")
        )
        db.session.add(new_data)
        db.session.commit()
        return jsonify({"ok": True, "message": "水质数据已添加"}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"ok": False, "message": str(e)}), 500


@auth_bp.route("/api/getwaterqualitydata", methods=["GET"])
def get_water_quality_data():
    try:
        # 获取分页参数，默认为第1页，每页20条数据
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)

        # 确保分页参数有效
        if page < 1 or per_page < 1:
            raise ValueError("页码和每页数据条数必须大于0")

        # 查询并分页
        data = WaterQualityData.query.paginate(page=page, per_page=per_page, error_out=False)
        
        # 数据转换
        data_list = [{
            "id": item.id,
            "province": item.province,
            "river_basin": item.river_basin,
            "section_name": item.section_name,
            "monitoring_time": item.monitoring_time,
            "water_quality_category": item.water_quality_category,
            "temperature": item.temperature,
            "ph": item.ph,
            "dissolved_oxygen": item.dissolved_oxygen,
            "conductivity": item.conductivity,
            "turbidity": item.turbidity,
            "permanganate_index": item.permanganate_index,
            "ammonia_nitrogen": item.ammonia_nitrogen,
            "total_phosphorus": item.total_phosphorus,
            "total_nitrogen": item.total_nitrogen,
            "chlorophyll_a": item.chlorophyll_a,
            "algae_density": item.algae_density,
            "site_status": item.site_status
        } for item in data.items]

        # 返回分页数据及总条数
        return jsonify({
            "data": data_list,
            "totalCount": data.total
        }), 200

    except Exception as e:
        # 打印具体错误信息用于调试
        print(f"Error: {str(e)}")
        return jsonify({"ok": False, "message": f"服务器错误: {str(e)}"}), 500





@auth_bp.route("/api/updatewaterqualitydata/<int:data_id>", methods=["PUT"])
def update_water_quality_data(data_id):
    data = request.get_json()
    try:
        water_data = WaterQualityData.query.get(data_id)
        if not water_data:
            return jsonify({"ok": False, "message": "数据不存在"}), 404

        water_data.province = data.get("province", water_data.province)
        water_data.river_basin = data.get("river_basin", water_data.river_basin)
        water_data.section_name = data.get("section_name", water_data.section_name)
        water_data.monitoring_time = data.get("monitoring_time", water_data.monitoring_time)
        water_data.water_quality_category = data.get("water_quality_category", water_data.water_quality_category)
        # Update other fields similarly...

        db.session.commit()
        return jsonify({"ok": True, "message": "水质数据已更新"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"ok": False, "message": str(e)}), 500


@auth_bp.route("/api/deletewaterqualitydata/<int:data_id>", methods=["DELETE"])
def delete_water_quality_data(data_id):
    try:
        water_data = WaterQualityData.query.get(data_id)
        if water_data:
            db.session.delete(water_data)
            db.session.commit()
            return jsonify({"ok": True, "message": "水质数据已删除"}), 200
        else:
            return jsonify({"ok": False, "message": "数据不存在"}), 404
    except Exception as e:
        db.session.rollback()
        return jsonify({"ok": False, "message": str(e)}), 500




# 添加鱼类数据
@auth_bp.route("/api/addfishdata", methods=["POST"])
def add_fish_data():
    data = request.get_json()
    try:
        new_data = FishData(
            species=data.get("species"),
            weight=data.get("weight"),
            length1=data.get("length1"),
            length2=data.get("length2"),
            length3=data.get("length3"),
            height=data.get("height"),
            width=data.get("width")
        )
        db.session.add(new_data)
        db.session.commit()
        return jsonify({"ok": True, "message": "鱼类数据已添加"}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"ok": False, "message": str(e)}), 500


# 获取鱼类数据（支持分页）
@auth_bp.route("/api/getfishdata", methods=["GET"])
def get_fish_data():
    try:
        # 获取分页参数，默认为第1页，每页20条数据
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)

        # 确保分页参数有效
        if page < 1 or per_page < 1:
            raise ValueError("页码和每页数据条数必须大于0")

        # 查询并分页
        data = FishData.query.paginate(page=page, per_page=per_page, error_out=False)
        
        # 数据转换
        data_list = [{
            "id": item.id,
            "species": item.species,
            "weight": item.weight,
            "length1": item.length1,
            "length2": item.length2,
            "length3": item.length3,
            "height": item.height,
            "width": item.width
        } for item in data.items]

        # 返回分页数据及总条数
        return jsonify({
            "data": data_list,
            "totalCount": data.total
        }), 200

    except Exception as e:
        # 打印具体错误信息用于调试
        print(f"Error: {str(e)}")
        return jsonify({"ok": False, "message": f"服务器错误: {str(e)}"}), 500


# 更新鱼类数据
@auth_bp.route("/api/updatefishdata/<int:data_id>", methods=["PUT"])
def update_fish_data(data_id):
    data = request.get_json()
    try:
        fish_data = FishData.query.get(data_id)
        if not fish_data:
            return jsonify({"ok": False, "message": "数据不存在"}), 404

        fish_data.species = data.get("species", fish_data.species)
        fish_data.weight = data.get("weight", fish_data.weight)
        fish_data.length1 = data.get("length1", fish_data.length1)
        fish_data.length2 = data.get("length2", fish_data.length2)
        fish_data.length3 = data.get("length3", fish_data.length3)
        fish_data.height = data.get("height", fish_data.height)
        fish_data.width = data.get("width", fish_data.width)

        db.session.commit()
        return jsonify({"ok": True, "message": "鱼类数据已更新"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"ok": False, "message": str(e)}), 500


# 删除鱼类数据
@auth_bp.route("/api/deletefishdata/<int:data_id>", methods=["DELETE"])
def delete_fish_data(data_id):
    try:
        fish_data = FishData.query.get(data_id)
        if fish_data:
            db.session.delete(fish_data)
            db.session.commit()
            return jsonify({"ok": True, "message": "鱼类数据已删除"}), 200
        else:
            return jsonify({"ok": False, "message": "数据不存在"}), 404
    except Exception as e:
        db.session.rollback()
        return jsonify({"ok": False, "message": str(e)}), 500
