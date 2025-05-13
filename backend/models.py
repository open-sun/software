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



