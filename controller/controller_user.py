from fastapi import UploadFile
from passlib.hash import bcrypt
import jwt
import mysql.connector
from datetime import datetime, timezone, timedelta
from config import connection_pool
from utils import SECRET_KEY, ALGORITHM
import boto3
import uuid
from dotenv import load_dotenv
import os
from model.model import SignupRequest

load_dotenv()

s3_client = boto3.client(
    's3',
    aws_access_key_id=os.getenv('AWS_ACCESS_KEY_ID'),
    aws_secret_access_key=os.getenv('AWS_SECRET_ACCESS_KEY'),
    region_name='us-west-1'
)
bucket_name = 'playmakerzone-avatar'

async def sign_up_user(signup_input: SignupRequest):
    try:
        conn = connection_pool.get_connection()
        cursor = conn.cursor(dictionary=True)

        # 檢查 email 是否已存在
        check_email_exist_query = '''
        SELECT * FROM member WHERE email = %s
        '''
        cursor.execute(check_email_exist_query, (signup_input.email,))
        result = cursor.fetchall()

        if result:
            return {"error": True, "message": "電子信箱已存在"}, 400

        check_username_exist_query = '''
        SELECT * FROM member WHERE username = %s
        '''
        cursor.execute(check_username_exist_query, (signup_input.username,))
        result = cursor.fetchall()

        if result:
            return {"error": True, "message": "使用者名稱已存在"}, 400


        
        # 創建新會員
        hashed_password = bcrypt.hash(signup_input.password)
        tz = timezone(timedelta(hours=+8))
        current_time = datetime.now(tz)

        insert_query = '''
        INSERT INTO member (username, email, password, create_time) VALUES (%s, %s, %s, %s)
        '''
        cursor.execute(insert_query, (signup_input.username, signup_input.email, hashed_password, current_time))
        conn.commit()
        return {"ok": True}, 200

    except mysql.connector.Error as e:
        return {"error": True, "message": str(e)}, 500

    finally:
        if "cursor" in locals():
            cursor.close()
        if "conn" in locals():
            conn.close()

async def sign_in_user(signin_input):
    try:
        conn = connection_pool.get_connection()
        cursor = conn.cursor(dictionary=True)
        search_member_query = '''
        SELECT * FROM member WHERE email = %s COLLATE utf8mb4_bin
        '''
        cursor.execute(search_member_query, (signin_input.email,))
        result = cursor.fetchone()

        if result and bcrypt.verify(signin_input.password, result["password"]):
            expiration = datetime.utcnow() + timedelta(days=7)
            payload = {
                "id": result["id"],
                "username": result["username"],
                "email": result["email"],
                "avatar": result["avatar"],
                "exp": expiration.timestamp()
            }
            token = jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)
            return {"token": token}, 200
        else:
            return {"error": True, "message": "帳號或密碼錯誤"}, 400

    except mysql.connector.Error as e:
        return {"error": True, "message": str(e)}, 500

    finally:
        if "cursor" in locals():
            cursor.close()
        if "conn" in locals():
            conn.close()

async def get_member_info(user):
    if user:
        return {
            "data": {
                "id": user["id"],
                "username": user["username"],
                "email": user["email"],
                "avatar": user["avatar"]
            }
        }
    return {"data": None}



# update_member_info(avatar: UploadFile)

        # file_key = str(uuid.uuid4()) + '-' + avatar.filename
        
        # s3_client.upload_fileobj(avatar.file, bucket_name, file_key)
        
        # image_url = f"https://d3u0kqiunxz7fm.cloudfront.net/{file_key}"