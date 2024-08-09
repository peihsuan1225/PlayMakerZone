from model.model import TacticRequest, TacticContentRequest
import mysql.connector
from config import connection_pool
import json
from datetime import datetime, timezone, timedelta

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
    try:
        conn = connection_pool.get_connection()
        cursor = conn.cursor(dictionary=True)
        player_A = json.dumps(tacticContent_input.player_A)
        player_B = json.dumps(tacticContent_input.player_B)
        ball = json.dumps(tacticContent_input.ball)


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

        insert_query = '''
        INSERT INTO tactics_info (update_time) VALUES (%s)
        '''
        cursor.execute(insert_query, (current_time,))
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