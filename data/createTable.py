import mysql.connector
from dotenv import load_dotenv
import os

load_dotenv()

db_config = {
    "user":os.getenv("user"),
    "password":os.getenv("password"),
    "host":os.getenv("host"),
    "database":os.getenv("database")
}

# 檢查是否已有此table的fuction
def table_exists(cursor, table_name):
    cursor.execute(f"SHOW TABLES LIKE '{table_name}'")
    return cursor.fetchone() is not None

def create_table(table_name, query):
    conn =mysql.connector.connect(**db_config)
    cursor = conn.cursor()

    table_name = table_name

    if table_exists(cursor, table_name):
        print(f"Table '{table_name}' already exists. Skipping table creation.")
        cursor.close()
        conn.close()
        return
    
    
    cursor.execute(query)
    print(f"'{table_name}'table建立成功")

    cursor.close()
    conn.close()

create_member_table_query = '''
CREATE TABLE IF NOT EXISTS member(
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(255) NOT NULL UNIQUE,
    email VARCHAR(320) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL, 
    avatar VARCHAR(255), 
    favorites JSON,
    create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
'''
create_tactics_info_table_query = '''
CREATE TABLE IF NOT EXISTS tactics_info(
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(320) NOT NULL,
    player INT UNSIGNED NOT NULL,
    tags JSON NOT NUll,
    level INT UNSIGNED NOT NULL,
    member_id BIGINT NOT NULL,
    status VARCHAR(255) NOT NULL,
    update_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (member_id) REFERENCES member(id)
)
'''
create_tactics_details_table_query = '''
CREATE TABLE IF NOT EXISTS tactic_details (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    tactic_id BIGINT NOT NULL,
    step INT UNSIGNED NOT NULL,
    player_A JSON NOT NULL,
    player_B JSON NOT NULL,
    ball JSON NOT NULL,
    description VARCHAR(320) NOT NULL,
    FOREIGN KEY (tactic_id) REFERENCES tactics_info(id)
)
'''
create_tactics_screenshots_table_query = '''
CREATE TABLE IF NOT EXISTS tactic_screenshots (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    tactic_id BIGINT NOT NULL,
    step INT UNSIGNED NOT NULL,
    image_url VARCHAR(255) NOT NULL,
    FOREIGN KEY (tactic_id) REFERENCES tactics_info(id)
)
'''

create_table("member", create_member_table_query)
create_table("tactics_info", create_tactics_info_table_query)
create_table("tactic_details", create_tactics_details_table_query)
create_table("tactic_screenshots", create_tactics_screenshots_table_query)
