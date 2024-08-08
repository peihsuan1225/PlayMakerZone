from model.model import TacticRequest
import mysql.connector
from config import connection_pool
from datetime import datetime, timezone, timedelta

async def create_tactic_info(tactic_input: TacticRequest):
    try:
        conn = connection_pool.get_connection()
        cursor = conn.cursor(dictionary=True)
        
        tz = timezone(timedelta(hours=+8))
        current_time = datetime.now(tz)

        insert_query = '''
        INSERT INTO tactics_info (name, player, tags, level, member_id, status, update_time, create_time) VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
        '''
        cursor.execute(insert_query, (tactic_input.name, tactic_input.player, tactic_input.tags, tactic_input.level, tactic_input.member_id, tactic_input.status, current_time, current_time))
        conn.commit()
        return {"ok": True}, 200

    except mysql.connector.Error as e:
        return {"error": True, "message": str(e)}, 500

    finally:
        if "cursor" in locals():
            cursor.close()
        if "conn" in locals():
            conn.close()