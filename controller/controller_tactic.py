from fastapi import Query, UploadFile
from model.model import TacticRequest, TacticContentRequest
from config import get_db_connection
import aiomysql
import json
from datetime import datetime, timezone, timedelta
from typing import List, Optional, Dict, Any, Tuple
import boto3
import os
from dotenv import load_dotenv
from urllib.parse import urlparse, unquote
import uuid
import io

load_dotenv()

s3_client = boto3.client(
    's3',
    aws_access_key_id=os.getenv('AWS_ACCESS_KEY_ID'),
    aws_secret_access_key=os.getenv('AWS_SECRET_ACCESS_KEY'),
    region_name='us-west-1'
)
bucket_name = 'playmakerzone'

async def get_searched_tactics(
    page: int,
    keyword: Optional[str] = None,
    playerCounts: Optional[str] = None,
    dateStart: Optional[str] = None,
    dateEnd: Optional[str] = None,
    modes: Optional[List[str]] = None,
    difficulties: Optional[List[str]] = None
) -> Tuple[Dict[str, Any], int]:
    tactics_per_page = 12
    offset = page * tactics_per_page

    try:
       conn = await get_db_connection()
       async with conn.cursor(aiomysql.DictCursor) as cursor:

        base_query = '''
        SELECT ti.*, m.username, ts.image_url as thumbnail_url
        FROM tactics_info ti
        JOIN member m ON ti.member_id = m.id
        LEFT JOIN tactic_screenshots ts ON ti.id = ts.tactic_id AND ti.thumbnail = ts.step
        WHERE ti.status = "公開" AND ti.finished = "1"
        '''

        count_query='''
        SELECT COUNT(*) AS total 
        FROM tactics_info ti
        JOIN member m ON ti.member_id = m.id
        LEFT JOIN tactic_screenshots ts ON ti.id = ts.tactic_id AND ti.thumbnail = ts.step
        WHERE ti.status = "公開" AND ti.finished = "1"
        '''

        conditions =[]

        params = []

        if keyword:
            conditions.append("(ti.name LIKE %s)")
            params.append(f"%{keyword}%")

        if playerCounts:
            conditions.append("ti.player = %s")
            params.extend(playerCounts)

        if modes:
            mode_conditions = []
            for mode_set in modes:
                tags = mode_set.split(",")
                for tag in tags:
                    mode_conditions.append("JSON_CONTAINS(ti.tags, %s, '$')")
                    params.append(json.dumps([tag]))
            conditions.append(" AND ".join(mode_conditions))

        if dateStart:
            conditions.append("ti.update_time >= %s")
            params.append(dateStart)

        if dateEnd:
            conditions.append("ti.update_time <= %s")
            params.append(dateEnd)    

        if difficulties:
            difficulty_conditions = []
            for difficulty_set in difficulties:
                difficulty_values = difficulty_set.split(",")
                difficulty_conditions.append("(" + " OR ".join(["(ti.level = %s)"] * len(difficulty_values)) + ")")
                params.extend(difficulty for difficulty in difficulty_values)
            conditions.append(" AND ".join(difficulty_conditions))

        if conditions:
            base_query += " AND " + " AND ".join(conditions)
            count_query += " AND " + " AND ".join(conditions)

        # print(base_query)
        # print(params)
        base_query += " ORDER BY ti.update_time DESC LIMIT %s OFFSET %s"
        params.extend([tactics_per_page, offset])

        # 計算總筆數，params的最後兩個參數忽略(計算筆數不需要分頁)
        await cursor.execute(count_query, params[:-2])
        countResult = await cursor.fetchone()
        total_items = countResult["total"]

        # 抓取(所有or有條件)景點資料，12筆為一頁
        await cursor.execute(base_query, params)
        tactics = await cursor.fetchall()
        # print(tactics)

        await conn.ensure_closed()

        # 在所有顯示過的筆數還沒到總筆數時，下一頁=當前頁數+1，否則為None
        next_page = page + 1 if offset + tactics_per_page < total_items else None

        if tactics:
            result = {
                "nextPage":next_page,
                "data":[
                    {
                        "id": tactic["id"],
                        "name": tactic["name"],
                        "player": tactic["player"],
                        "tags": tactic["tags"],
                        "level": tactic["level"],
                        "username": tactic["username"],
                        "member_id": tactic["member_id"],
                        "update_time":tactic["update_time"].isoformat(),
                        "thumbnail_url": tactic["thumbnail_url"]
                    }
                    for tactic in tactics
                ]
            }
        else:
            result = {"nodata":True}

        return result, 200

    except Exception as e:
        error_message = str(e)
        return {"error": True, "message": error_message}, 500
    

async def get_member_tactics(page: int, userName: str = Query(None), userID: int = Query(None)):
    tactics_per_page = 12
    offset = page * tactics_per_page

    try:
        conn = await get_db_connection()
        async with conn.cursor(aiomysql.DictCursor) as cursor:

            base_query = '''
            SELECT ti.*, m.username, ts.image_url as thumbnail_url
            FROM tactics_info ti
            JOIN member m ON ti.member_id = m.id
            LEFT JOIN tactic_screenshots ts ON ti.id = ts.tactic_id AND ti.thumbnail = ts.step
            WHERE
            '''

            count_query='''
            SELECT COUNT(*) AS total
            FROM tactics_info ti
            JOIN member m ON ti.member_id = m.id
            LEFT JOIN tactic_screenshots ts ON ti.id = ts.tactic_id AND ti.thumbnail = ts.step
            WHERE
            '''

            conditions =[]

            params = []

            # 非本人>用username去撈，顯示ststus=公開 且 finished=1
            if userName:
                conditions.append("m.username = %s")
                params.append(userName)
                conditions.append("ti.status = 公開")
                conditions.append("ti.finished = 1")

            # 本人>用member_id去撈，不用作狀態篩選，全部資料都撈
            if userID:
                member_id = userID
                conditions.append("ti.member_id = %s")
                params.append(member_id)

            if conditions:
                base_query += " AND ".join(conditions)
                count_query += " AND ".join(conditions)

            # print(base_query)
            # print(params)
            base_query += " ORDER BY ti.update_time DESC LIMIT %s OFFSET %s"
            params.extend([tactics_per_page, offset])

            # 計算總筆數，params的最後兩個參數忽略(計算筆數不需要分頁)
            await cursor.execute(count_query, params[:-2])
            countResult = await cursor.fetchone()
            total_items = countResult["total"]

            # 抓取(所有or有條件)景點資料，12筆為一頁
            await cursor.execute(base_query, params)
            tactics = await cursor.fetchall()
            # print(tactics)

            await conn.ensure_closed()
            # 在所有顯示過的筆數還沒到總筆數時，下一頁=當前頁數+1，否則為None
            next_page = page + 1 if offset + tactics_per_page < total_items else None

            if tactics:
                result = {
                    "nextPage":next_page,
                    "data":[
                        {
                            "id": tactic["id"],
                            "name": tactic["name"],
                            "player": tactic["player"],
                            "tags": tactic["tags"],
                            "level": tactic["level"],
                            "username": tactic["username"],
                            "member_id": tactic["member_id"],
                            "update_time":tactic["update_time"].isoformat(),
                            "finished":tactic["finished"],
                            "status": tactic["status"],
                            "thumbnail_url": tactic["thumbnail_url"]
                        }
                        for tactic in tactics
                    ]
                }
            else:
                result = {"nodata":True}
        
        return result, 200
        
    except Exception as e:
        return {"error": True, "message": str(e)}, 500
    finally:
        conn.close()

        
def convert_level_to_int(level: str) -> int:
    if level == "新手":
        return 1
    elif level == "中等":
        return 2
    elif level == "專業":
        return 3
    else:
        raise ValueError("Invalid level provided")
    
async def create_tactic_info(tactic_input: TacticRequest):
    try:
        conn = await get_db_connection()
        async with conn.cursor() as cursor:
        
            tags_json = json.dumps(tactic_input.tags)
            level_value = convert_level_to_int(tactic_input.level)
            tz = timezone(timedelta(hours=+8))
            current_time = datetime.now(tz)

            # print(tactic_input.name, 
            #     tactic_input.player, 
            #     tags_json, 
            #     level_value, 
            #     tactic_input.member_id, 
            #     tactic_input.status, 
            #     current_time, 
            #     current_time)
            
            insert_query = '''
            INSERT INTO tactics_info (name, player, tags, level, member_id, status, update_time, create_time) VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
            '''
            await cursor.execute(insert_query, (
                tactic_input.name, 
                tactic_input.player, 
                tags_json, 
                level_value, 
                tactic_input.member_id, 
                tactic_input.status, 
                current_time, 
                current_time
            ))
            await conn.ensure_closed()
            return {"ok": True}, 200

    except Exception as e:
        # print(f"Error:{str(e)}")
        return {"error": True, "message": str(e)}, 500


async def get_tactic(tactic_id=None, user=None):
    # print(f"Received tactic_id: {tactic_id}")  
    # print(f"Received user: {user}")  
    try:
        conn = await get_db_connection()
        async with conn.cursor(aiomysql.DictCursor) as cursor:
            if tactic_id:
                # 根據 tactic_id 查詢戰術內容
                query = '''
                SELECT * FROM tactics_info
                WHERE id = %s
                '''
                await cursor.execute(query, (tactic_id,))
            elif user:
                # 根據 user 查詢最新戰術內容
                query = '''
                SELECT * FROM tactics_info
                WHERE member_id = %s
                ORDER BY create_time DESC
                LIMIT 1
                '''
                await cursor.execute(query, (user["id"],))
            else:
                return {"error": True, "message": "No valid parameters provided"}, 400

            tactic_info = await cursor.fetchone()
            await conn.ensure_closed()
            
            if tactic_info:
                return {"data": tactic_info, "error": False}, 200
            else:
                return {"error": True, "message": "Tactic not found"}, 404
        
    except Exception as e:
        return {"error": True, "message": str(e)}, 500
    

async def save_tactic_content(tacticContent_input: TacticContentRequest):
    # print(tacticContent_input)
    try:
       conn = await get_db_connection()
       async with conn.cursor() as cursor:
            player_A = json.dumps(tacticContent_input.player_A)
            player_B = json.dumps(tacticContent_input.player_B)
            ball = json.dumps(tacticContent_input.ball)

            check_query ='''
            SELECT * FROM tactic_details
            WHERE tactic_id = %s AND step = %s
            '''
            await cursor.execute(check_query, (tacticContent_input.tactic_id, tacticContent_input.step))
            result = await cursor.fetchone()
            
            if result:
                update_query = '''
                UPDATE tactic_details
                SET player_A = %s, player_B = %s, ball = %s, description = %s
                WHERE tactic_id = %s AND step = %s
                '''
                await cursor.execute(update_query, (
                    player_A, 
                    player_B, 
                    ball, 
                    tacticContent_input.description,
                    tacticContent_input.tactic_id,
                    tacticContent_input.step
                ))
            else:
                insert_query = '''
                INSERT INTO tactic_details (tactic_id, step, player_A, player_B, ball, description) VALUES (%s, %s, %s, %s, %s, %s)
                '''
                await cursor.execute(insert_query, (
                    tacticContent_input.tactic_id,
                    tacticContent_input.step, 
                    player_A, 
                    player_B, 
                    ball, 
                    tacticContent_input.description
                ))

            tz = timezone(timedelta(hours=+8))
            current_time = datetime.now(tz)

            update_query = '''
            UPDATE tactics_info
            SET update_time = %s ,finished = "1"
            wHERE id = %s
            '''
            await cursor.execute(update_query, (current_time ,tacticContent_input.tactic_id))
            await conn.ensure_closed()

            return {"ok": True}, 200

    except Exception as e:
        # print(f"Error:{str(e)}")
        return {"error": True, "message": str(e)}, 500

async def fetch_tactic_content_from_db(tactic_id):
    try:
        conn = await get_db_connection()
        async with conn.cursor(aiomysql.DictCursor) as cursor:
            query = '''
            SELECT td.*, ti.* FROM tactic_details td
            JOIN tactics_info ti ON td.tactic_id = ti.id 
            WHERE td.tactic_id = %s
            '''

            await cursor.execute(query, tactic_id)
            step_contents = await cursor.fetchall()

            tags = json.loads(step_contents[0]["tags"])
            player_number = step_contents[0]["player"]
            tactic_name = step_contents[0]["name"]
            member_id = step_contents[0]["member_id"]
            status = step_contents[0]["status"]

            # print(step_contents) 

            if step_contents:
                result = {
                    "tacticName": tactic_name,
                    "memberID": member_id,
                    "status": status,
                    "court": tags[0],
                    "player": player_number,
                    "data":[
                        {
                            "step": step_content["step"],
                            "player_A": step_content["player_A"],
                            "player_B": step_content["player_B"],
                            "ball": step_content["ball"],
                            "description": step_content["description"],          
                        }
                        for step_content in step_contents
                    ]
                }
            else:
                result = {"nodata":True}
            
            return result, 200
        
    except Exception as e:
        return {"error": True, "message": str(e)}, 500
    finally:
        conn.close()

async def delete_tactic(tactic_id, user):
    conn = await get_db_connection()
    try:
        async with conn.cursor(aiomysql.DictCursor) as cursor:
            query = '''
            SELECT member_id
            FROM tactics_info
            WHERE ID = %s
            '''
            await cursor.execute(query, (tactic_id,))
            creator = await cursor.fetchone()

            if creator and creator["member_id"] == user["id"]:
                query = '''
                SELECT finished
                FROM tactics_info
                WHERE ID = %s
                '''
                await cursor.execute(query, (tactic_id,))
                finished = await cursor.fetchone()

                if finished and finished["finished"] == 1:
                    query = '''
                    DELETE FROM tactic_details
                    WHERE tactic_id = %s
                    '''
                    await cursor.execute(query, (tactic_id,))
                
                query = '''
                DELETE FROM tactics_info
                WHERE id = %s
                '''
                await cursor.execute(query, (tactic_id,))

                result = {"response": f"tactic deleted id = {tactic_id}"}
                return result, 200

            else:
                result = {"error": True, "message": "Tactic owner verification failed."}
                return result, 403
            
    except Exception as e:
        return {"error": True, "message": str(e)}, 500
    
    finally:
        await conn.ensure_closed()

async def update_thumbnail(tactic_id: int, step: int, file: UploadFile):
    try:
        file_obj = io.BytesIO(await file.read())

        conn = await get_db_connection()
        async with conn.cursor() as cursor:

            get_oldurl_query='''
            SELECT ti.id AS tactic_id, ti.thumbnail, ts.image_url
            FROM tactics_info ti
            JOIN tactic_screenshots ts
            ON ti.id = ts.tactic_id
            AND ti.thumbnail = ts.step
            WHERE ti.id = %s
            '''

            await cursor.execute(get_oldurl_query, (tactic_id,))
            result = await cursor.fetchone()

            if result:
                old_image_url = result['image_url']

                if old_image_url and old_image_url.startswith("https://"):
                    parsed_url  = urlparse(old_image_url)
                    path = parsed_url.path
                    filename = unquote(path.split("/")[-1])

                    s3_client.delete_object(
                        Bucket=bucket_name,
                        Key=f"thumbnail/{filename}"
                    )

            # 設定上傳到 S3 的檔案路徑
            file_key = f"thumbnail/{str(uuid.uuid4())}-{file.filename}"

            # 上傳檔案到 S3
            s3_client.upload_fileobj(file_obj, bucket_name, file_key)

            # 關閉檔案物件
            file_obj.close()

            new_url = f"https://d3u0kqiunxz7fm.cloudfront.net/{file_key}"

            updateThumbnailStep_query = '''
            UPDATE tactics_info 
            SET thumbnail = %s
            WHERE id = %s
            '''
            await cursor.execute(updateThumbnailStep_query, (step, tactic_id))
            
            # 先確認是否有 tactic_id 和 step 的紀錄
            check_query = '''
            SELECT COUNT(*) AS count
            FROM tactic_screenshots
            WHERE tactic_id = %s AND step = %s
            '''

            await cursor.execute(check_query, (tactic_id, step))
            result = await cursor.fetchone()
            # print("檢查結果")
            # print(result)

            if result[0] == 0:
                # 沒有紀錄，則執行 INSERT
                insert_query = '''
                INSERT INTO tactic_screenshots (tactic_id, step, image_url)
                VALUES (%s, %s, %s)
                '''
                await cursor.execute(insert_query, (tactic_id, step, new_url))
                # print("新增")
                # print(insert_query)
                # print(tactic_id)
                # print(step)
                # print(new_url)
            else:
                # 有紀錄，則執行 UPDATE
                update_query = '''
                UPDATE tactic_screenshots
                SET image_url = %s
                WHERE tactic_id = %s AND step = %s
                '''
                await cursor.execute(update_query, (new_url, tactic_id, step))
                # print("更新")
                # print(update_query)
                # print(tactic_id)
                # print(step)
                # print(new_url)

        await conn.ensure_closed()

        return {"success": True}, 200
    
    except Exception as e:
        return {"error": True, "message": str(e)}, 500
    