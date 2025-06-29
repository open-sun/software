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