import mysql.connector
from dotenv import load_dotenv
import os

load_dotenv()

db_config = {
    "user": os.getenv("user"),
    "password": os.getenv("password"),
    "host": os.getenv("host"),
    "database": os.getenv("database")
}


def drop_table(drop_query):
    conn = mysql.connector.connect(**db_config)
    cursor = conn.cursor()

    cursor.execute(drop_query)
    print(f"Table  已刪除.")    

    cursor.close()
    conn.close()

drop_table_query = "DROP TABLE member, tactics_info, tactic_details, tactic_screenshots"

drop_table(drop_table_query)

