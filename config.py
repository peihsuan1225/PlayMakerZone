import mysql.connector.pooling
from dotenv import load_dotenv
import os

load_dotenv()

db_config = {
    "user":os.getenv("user"),
    "password":os.getenv("password"),
    "host":os.getenv("host"),
    "database":os.getenv("database")
}

connection_pool = mysql.connector.pooling.MySQLConnectionPool(
    pool_name="PMZ_pool",
    pool_size=5,
    **db_config
)
