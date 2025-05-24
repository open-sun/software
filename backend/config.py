import os
from dotenv import load_dotenv
load_dotenv()

HOSTNAME = "127.0.0.1"
PORT = "3306"
DATABASE = "flask"
USERNAME = "root"
PASSWORD = os.getenv("DB_PASSWORD")

SQLALCHEMY_DATABASE_URI = f"mysql+pymysql://{USERNAME}:{PASSWORD}@{HOSTNAME}:{PORT}/{DATABASE}"
SQLALCHEMY_TRACK_MODIFICATIONS = False
