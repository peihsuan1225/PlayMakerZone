from fastapi import UploadFile
from passlib.hash import bcrypt
import jwt
import aiomysql
from datetime import datetime, timezone, timedelta
from config import get_db_connection
from utils import SECRET_KEY, ALGORITHM
import boto3
import uuid
from dotenv import load_dotenv
import os
from model.model import SignupRequest
from typing import Optional

load_dotenv()

s3_client = boto3.client(
    's3',
    aws_access_key_id=os.getenv('AWS_ACCESS_KEY_ID'),
    aws_secret_access_key=os.getenv('AWS_SECRET_ACCESS_KEY'),
    region_name='us-west-1'
)
bucket_name = 'playmakerzone-avatar'

async def check_email_exists(email: str) -> bool:
    conn = await get_db_connection()
    async with conn.cursor(aiomysql.DictCursor) as cursor:
        check_email_exist_query = '''
        SELECT * FROM member WHERE email = %s
        '''
        await cursor.execute(check_email_exist_query, (email,))
        result = await cursor.fetchall()
    await conn.ensure_closed()
    return bool(result)


async def check_username_exists(username: str) -> bool:
    conn = await get_db_connection()
    async with conn.cursor(aiomysql.DictCursor) as cursor:
        check_username_exist_query = '''
        SELECT * FROM member WHERE username = %s
        '''
        await cursor.execute(check_username_exist_query, (username,))
        result = await cursor.fetchall()
    await conn.ensure_closed()
    return bool(result)


async def sign_up_user(signup_input: SignupRequest):
    try:
        # 檢查 email 是否已存在
        if await check_email_exists(signup_input.email):
            return {"error": True, "message": "電子信箱已存在"}, 400

        # 檢查 username 是否已存在
        if await check_username_exists(signup_input.username):
            return {"error": True, "message": "使用者名稱已存在"}, 400

        # 創建新會員
        hashed_password = bcrypt.hash(signup_input.password)
        tz = timezone(timedelta(hours=+8))
        current_time = datetime.now(tz)

        conn = await get_db_connection()
        async with conn.cursor(aiomysql.DictCursor) as cursor:
            insert_query = '''
            INSERT INTO member (username, email, password, create_time) VALUES (%s, %s, %s, %s)
            '''
            await cursor.execute(insert_query, (signup_input.username, signup_input.email, hashed_password, current_time))
            await conn.commit()
        await conn.ensure_closed()

        return {"ok": True}, 200

    except Exception as e:
        return {"error": True, "message": str(e)}, 500


async def sign_in_user(signin_input):
    try:
        conn = await get_db_connection()
        async with conn.cursor(aiomysql.DictCursor) as cursor:
            search_member_query = '''
            SELECT * FROM member WHERE email = %s COLLATE utf8mb4_bin
            '''
            await cursor.execute(search_member_query, (signin_input.email,))
            result = await cursor.fetchone()
            await conn.ensure_closed()

            if result and bcrypt.verify(signin_input.password, result["password"]):
                expiration = datetime.utcnow() + timedelta(days=7)
                payload = {
                    "id": result["id"],
                    "username": result["username"],
                    "email": result["email"],
                    "avatar": result["avatar"],
                    "favorites": result["favorites"],
                    "fullname": result["fullname"],
                    "about_me": result["about_me"],
                    "exp": expiration.timestamp()
                }
                token = jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)
                return {"token": token}, 200
            else:
                return {"error": True, "message": "帳號或密碼錯誤"}, 400

    except Exception as e:
        return {"error": True, "message": str(e)}, 500


async def get_member_info(user):
    if user:
        return {
            "data": {
                "id": user["id"],
                "username": user["username"],
                "email": user["email"],
                "avatar": user["avatar"],
                "favorites": user["favorites"],
                "fullname": user["fullname"],
                "about_me": user["about_me"]
            }
        }
    return {"data": None}


async def validate_password(user_id:int, password: str) -> bool:
    conn = await get_db_connection()
    async with conn.cursor(aiomysql.DictCursor) as cursor:
        await cursor.execute("SELECT password FROM member WHERE id = %s", (user_id,))
        result = await cursor.fetchone()
        await conn.ensure_closed()
        if result and bcrypt.verify(password, result):
            return True
    return False

async def update_avatar(avatar: UploadFile = None, avatar_url: Optional[str] = None) -> str:
    if avatar:
        file_key = str(uuid.uuid4()) + '-' + avatar.filename
        s3_client.upload_fileobj(avatar.file, bucket_name, file_key)
        result = f"https://your-cloudfront-url/{file_key}"
    elif avatar_url:
        result = avatar_url
    else:
        result = {"error": True, "message": "No avatar provided"}, 400

    return result

async def update_user_profile(user_update, user):
    if not user:
        return {"error": True, "message": "Invalid or missing token"}, 401

    user_id = user.get('user_id')
    db_connection = await get_db_connection()

    if user_update.username:
        if await check_username_exists(user_update.username):
            return {"error": True, "message": "Username already exists"}, 400
    
    if user_update.email:
        if await check_email_exists(user_update.email):
            return {"error": True, "message": "Email already exists"}, 400
    
    if user_update.password:
        if not await validate_password(user_id, user_update.password, db_connection):
            return {"error": True, "message": "Incorrect password"}, 400
    
    update_query = "UPDATE member SET "
    params = []
    
    if user_update.username:
        update_query += "username = %s, "
        params.append(user_update.username)
    
    if user_update.email:
        update_query += "email = %s, "
        params.append(user_update.email)
    
    if user_update.about_me:
        update_query += "about_me = %s, "
        params.append(user_update.about_me)
    
    if user_update.fullname:
        update_query += "fullname = %s, "
        params.append(user_update.fullname)
    
    if user_update.avatar or user_update.avatar_url:
        image_url = await update_avatar(avatar=user_update.avatar, avatar_url=user_update.avatar_url)
        update_query += "avatar = %s, "
        params.append(image_url)
    
    if update_query.endswith(", "):
        update_query = update_query[:-2]  # Remove trailing comma
        update_query += " WHERE id = %s"
        params.append(user_id)
        
        async with db_connection.cursor() as cursor:
            await cursor.execute(update_query, tuple(params))
            await db_connection.commit()
    
    db_connection.close()
    return {"ok": True},200

