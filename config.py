# import mysql.connector.pooling
from dotenv import load_dotenv
import os
import aiomysql

load_dotenv()

# db_config = {
#     "user":os.getenv("user"),
#     "password":os.getenv("password"),
#     "host":os.getenv("host"),
#     "database":os.getenv("database")
# }

# connection_pool = mysql.connector.pooling.MySQLConnectionPool(
#     pool_name="PMZ_pool",
#     pool_size=5,
#     **db_config
# )

DATABASE = {
    'host': os.getenv('DB_HOST'),
    'port':3306,
    'user': os.getenv('DB_USER'),
    'password': os.getenv('DB_PASSWORD'),
    'db': os.getenv('DB_NAME'),
}

async def create_db_pool() -> aiomysql.Pool:
    pool = await aiomysql.create_pool(
        host=DATABASE['host'],
        port=DATABASE['port'],
        user=DATABASE['user'],
        password=DATABASE['password'],
        db=DATABASE['db'],
        charset='utf8mb4',
        maxsize=10  
    )
    return pool