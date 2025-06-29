from flask import Flask,request,jsonify,render_template
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import text



db=SQLAlchemy()


class User(db.Model):
    __tablename__='user'
    id=db.Column(db.Integer,primary_key=True,autoincrement=True)
    username=db.Column(db.String(100),nullable=False)
    password=db.Column(db.String(2048),nullable=False)
    role=db.Column(db.String(100),nullable=False)



# Water Quality Data Model
class WaterQualityData(db.Model):
    __tablename__ = 'water_quality_data'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    province = db.Column(db.String(255))
    river_basin = db.Column(db.String(255))
    section_name = db.Column(db.String(255))
    monitoring_time = db.Column(db.String(255))
    water_quality_category = db.Column(db.String(255))
    temperature = db.Column(db.Numeric(10, 2))
    ph = db.Column(db.Numeric(10, 2))
    dissolved_oxygen = db.Column(db.Numeric(10, 2))
    conductivity = db.Column(db.Numeric(10, 2))
    turbidity = db.Column(db.Numeric(10, 2))
    permanganate_index = db.Column(db.Numeric(10, 2))
    ammonia_nitrogen = db.Column(db.Numeric(10, 3))
    total_phosphorus = db.Column(db.Numeric(10, 3))
    total_nitrogen = db.Column(db.Numeric(10, 2))
    chlorophyll_a = db.Column(db.Numeric(10, 3))
    algae_density = db.Column(db.BigInteger)
    site_status = db.Column(db.String(255))


class FishData(db.Model):
    __tablename__ = 'fish_data'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    species = db.Column(db.String(100), nullable=False)  # 物种
    weight = db.Column(db.Float, nullable=False)  # 重量，单位：克
    length1 = db.Column(db.Float, nullable=True)  # 长度1，单位：厘米
    length2 = db.Column(db.Float, nullable=True)  # 长度2，单位：厘米
    length3 = db.Column(db.Float, nullable=True)  # 长度3，单位：厘米
    height = db.Column(db.Float, nullable=True)  # 高度，单位：厘米
    width = db.Column(db.Float, nullable=True)  # 宽度，单位：厘米
    

    