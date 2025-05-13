from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import text
from werkzeug.security import generate_password_hash, check_password_hash  # 添加 check_password_hash
from flask_cors import CORS
from models import db, User




app = Flask(__name__)
CORS(app)

# 数据库配置
HOSTNAME = "127.0.0.1"
PORT = "3306"
DATABASE = "flask"
USERNAME = "root"
PASSWORD = ""
app.config['SQLALCHEMY_DATABASE_URI'] = f"mysql+pymysql://{USERNAME}:{PASSWORD}@{HOSTNAME}:{PORT}/{DATABASE}"
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False


db.init_app(app)

with app.app_context():
    # 1. 删除所有表（注意：此操作会清除所有数据！）
    db.drop_all()
    # 2. 根据模型重新创建所有表
    db.create_all()


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


if __name__ == '__main__':
    app.run()