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

app = Flask(__name__)
app.config.from_object(config)
CORS(app)

db.init_app(app)
with app.app_context():
    db.drop_all()
    db.create_all()

# 注册蓝图
app.register_blueprint(auth_bp)
app.register_blueprint(water_bp)
app.register_blueprint(fish_bp)
app.register_blueprint(weather_bp)
app.register_blueprint(video_bp)
app.register_blueprint(market_bp)
app.register_blueprint(ai_bp)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
