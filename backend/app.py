from flask import Flask
from flask_cors import CORS
from models import db
import config
from auth import auth_bp
from water_data import water_bp
from fish_data import fish_bp
from weather_data import weather_bp
from video_data import video_bp
from market import market_bp
from ai_tools import ai_bp
import os
import csv
import pymysql
from import_data import import_csv_to_mysql
from dotenv import load_dotenv
import pandas as pd
load_dotenv()

from models import FishData  # 假设你的 FishData 类在 models.py 中

def import_fish_data_from_csv(csv_file):
    try:
        # 使用 pandas 读取 CSV 文件
        df = pd.read_csv(csv_file)

        # 打印列名以检查是否有问题
        print("CSV 列名:", df.columns)

        # 去除列名中的空格和单位
        df.columns = df.columns.str.replace(r'\(.*\)', '', regex=True).str.strip()

        # 打印清理后的列名，确认修改效果
        print("清理后的列名:", df.columns)

        # 遍历每一行数据，并创建 FishData 实例
        fish_data_list = []
        for index, row in df.iterrows():
            fish_data = FishData(
                species=row['Species'],
                weight=row['Weight'],
                length1=row['Length1'],
                length2=row['Length2'],
                length3=row['Length3'],
                height=row['Height'],
                width=row['Width']
            )
            fish_data_list.append(fish_data)

        # 将所有数据一次性添加到数据库中
        db.session.bulk_save_objects(fish_data_list)  # 使用 bulk_save_objects 提高效率
        db.session.commit()

        print("鱼类数据已成功导入数据库！")

    except Exception as e:
        db.session.rollback()
        print(f"导入数据时发生错误: {e}")





# 创建Flask应用
app = Flask(__name__)
app.config.from_object(config)
CORS(app)

# 初始化数据库
db.init_app(app)
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# 创建一个初始化数据库并导入数据的函数
# 创建一个初始化数据库并导入数据的函数
def init_db_and_import_data():
    with app.app_context():
        # 确保数据库表已经创建
        print("正在初始化数据库表...")
        db.drop_all()  # 这会删除所有现有的表
        db.create_all()  # 重新创建所有表

        print("开始导入CSV数据...")
        # 使用 f-string 格式化路径，确保正确解析 BASE_DIR
        CSV_ROOT_DIRECTORY = f'{BASE_DIR}/data/WaterQualitybyDate'  # 替换为你实际的路径
        DB_CONFIG = {
            'host': 'localhost',
            'user': 'root',
            'password': os.getenv("DB_PASSWORD"),  # 替换为你自己的密码
            'db': 'flask',  # 替换为你的数据库名
            'charset': 'utf8mb4'
        }

        # 调用导入CSV数据的函数
        import_csv_to_mysql(CSV_ROOT_DIRECTORY, DB_CONFIG)
        import_fish_data_from_csv(f'{BASE_DIR}/data/Fish.csv')  # 使用 f-string 格式化路径

# 注册蓝图
app.register_blueprint(auth_bp)
app.register_blueprint(water_bp)
app.register_blueprint(fish_bp)
app.register_blueprint(weather_bp)
app.register_blueprint(video_bp)
app.register_blueprint(market_bp)
app.register_blueprint(ai_bp)

# 在启动Flask应用之前初始化数据库并导入数据
if __name__ == '__main__':
    # 初始化数据库并导入数据
    init_db_and_import_data()

    # 启动Flask应用
    app.run(host='0.0.0.0', port=5000, debug=True)
