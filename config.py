# import mysql.connector.pooling
from dotenv import load_dotenv
import os
import aiomysql

load_dotenv()

DATABASE = {
    'host': os.getenv('DB_HOST'),
    'port':3306,
    'user': os.getenv('DB_USER'),
    'password': os.getenv('DB_PASSWORD'),
    'db': os.getenv('DB_NAME'),
}

async def get_db_connection():
    return await aiomysql.connect(
        host=DATABASE['host'],
        port=DATABASE['port'],
        user=DATABASE['user'],
        password=DATABASE['password'],
        db=DATABASE['db'],
        charset='utf8mb4',
        autocommit=True
    )