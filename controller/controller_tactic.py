from model.model import TacticRequest, TacticContentRequest
from fastapi.responses import JSONResponse
import mysql.connector
from config import connection_pool
import json
from datetime import datetime, timezone, timedelta
from typing import List, Optional, Dict, Any, Tuple

async def get_searched_tactics(
    page: int,
    keyword: Optional[str] = None,
    tags: Optional[List[str]] = None
)-> Tuple[Dict[str, Any], int]:
    tactics_per_page = 12
    offset = page * tactics_per_page

    try:
        conn = connection_pool.get_connection()
        cursor = conn.cursor(dictionary=True)

        base_query = '''
        SELECT ti.*, m.username FROM tactics_info ti
        JOIN member m ON ti.member_id = m.id
        WHERE ti.status = "公開"
        '''

        count_query='''
        SELECT COUNT(*) AS total 
        FROM tactics_info ti
        JOIN member m ON ti.member_id = m.id
        WHERE ti.status = "公開"
        '''

        conditions =[]

        params = []

        if keyword:
            conditions.append("(ti.name LIKE %s)")
            params.append(f"%{keyword}%")

        if tags:
            for tag in tags:
                conditions.append('(JSON_CONTAINS(ti.tags, %s))')
                params.append(f'"{tag}"')

        if conditions:
            base_query += " AND " + " AND ".join(conditions)
            count_query += " AND " + " AND ".join(conditions)

        base_query += " LIMIT %s OFFSET %s"
        params.extend([tactics_per_page, offset])

        # 計算總筆數，params的最後兩個參數忽略(計算筆數不需要分頁)
        cursor.execute(count_query, params[:-2])
        total_items = cursor.fetchone()["total"]

		# 抓取(所有or有條件)景點資料，12筆為一頁
        cursor.execute(base_query, params)
        tactics = cursor.fetchall()
        
        # 在所有顯示過的筆數還沒到總筆數時，下一頁=當前頁數+1，否則為None
        next_page = page + 1 if offset + tactics_per_page < total_items else None

        if tactics:
            result ={
                "nextPage":next_page,
                "data":[
                    {
                        "id": tactic["id"],
                        "name": tactic["name"],
                        "player": tactic["player"],
                        "tags": tactic["tags"],
                        "username": tactic["username"],
                        "member_id": tactic["member_id"],
                        "update_time":tactic["update_time"].isoformat(),
                    }
                    for tactic in tactics
                ]
            }
        else:
            result = {
                "nextPage": next_page,
                "data": []
            }

        return result, 200

    except mysql.connector.Error as e:
        error_message = str(e)
        return {"error": True, "message": error_message}, 500

    finally:
        if "cursor" in locals():
            cursor.close()
        if "conn" in locals():
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
        conn = connection_pool.get_connection()
        cursor = conn.cursor(dictionary=True)
        
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
        cursor.execute(insert_query, (
            tactic_input.name, 
            tactic_input.player, 
            tags_json, 
            level_value, 
            tactic_input.member_id, 
            tactic_input.status, 
            current_time, 
            current_time
        ))
        conn.commit()
        return {"ok": True}, 200

    except mysql.connector.Error as e:
        # print(f"Error:{str(e)}")
        return {"error": True, "message": str(e)}, 500

    finally:
        if "cursor" in locals():
            cursor.close()
        if "conn" in locals():
            conn.close()

async def get_latest_tactic(user):
    try:
        conn = connection_pool.get_connection()
        cursor = conn.cursor(dictionary=True)
        query = '''
        SELECT * FROM tactics_info
        WHERE member_id = %s
        ORDER BY create_time DESC
        LIMIT 1
        '''
        cursor.execute(query, (user["id"],))
        tactic_info = cursor.fetchone()
        # print(tactic_info)

        if tactic_info:
            return {"data": tactic_info, "error": False}, 200
        else:
            return {"error": True, "message": "No tactic found"}, 404
        
    except mysql.connector.Error as e:
        # print(e)
        return {"error": True, "message": str(e)}, 500
    
    finally:
        if "cursor" in locals():
            cursor.close()
        if "conn" in locals():
            conn.close()

async def save_tactic_content(tacticContent_input: TacticContentRequest):
    # print(tacticContent_input)
    try:
        conn = connection_pool.get_connection()
        cursor = conn.cursor(dictionary=True)
        player_A = json.dumps(tacticContent_input.player_A)
        player_B = json.dumps(tacticContent_input.player_B)
        ball = json.dumps(tacticContent_input.ball)

        check_query ='''
        SELECT * FROM tactic_details
        WHERE tactic_id = %s AND step = %s
        '''
        cursor.execute(check_query, (tacticContent_input.tactic_id, tacticContent_input.step))
        result = cursor.fetchone()
        
        if result:
            update_query = '''
            UPDATE tactic_details
            SET player_A = %s, player_B = %s, ball = %s, description = %s
            WHERE tactic_id = %s AND step = %s
            '''
            cursor.execute(update_query, (
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
            cursor.execute(insert_query, (
                tacticContent_input.tactic_id,
                tacticContent_input.step, 
                player_A, 
                player_B, 
                ball, 
                tacticContent_input.description
            ))
        conn.commit()

        tz = timezone(timedelta(hours=+8))
        current_time = datetime.now(tz)

        update_query = '''
        UPDATE tactics_info
        SET update_time = %s
        wHERE id = %s
        '''
        cursor.execute(update_query, (current_time, tacticContent_input.tactic_id))
        conn.commit()

        return {"ok": True}, 200

    except mysql.connector.Error as e:
        print(f"Error:{str(e)}")
        return {"error": True, "message": str(e)}, 500

    finally:
        if "cursor" in locals():
            cursor.close()
        if "conn" in locals():
            conn.close()