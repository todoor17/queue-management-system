from datetime import datetime
from typing import Dict, List

from fastapi import WebSocket


class ChatManager:
    def __init__(self):
        self.active_connections: Dict[int, List[WebSocket]] = {}

    async def connect(self, user_id: int, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.setdefault(user_id, []).append(websocket)

    async def disconnect(self, user_id: int, websocket: WebSocket):
        conns = self.active_connections.get(user_id)
        if not conns:
            return

        if websocket in conns:
            conns.remove(websocket)

        if not conns:
            del self.active_connections[user_id]

    async def safe_send_json(self, ws: WebSocket, payload: dict) -> bool:
        try:
            await ws.send_json(payload)
            return True
        except Exception:
            return False

    async def send_message(self, sender_id: int, receiver_id: int, message: str):
        payload = {
            "sender_id": sender_id,
            "receiver_id": receiver_id,
            "message": message,
            "timestamp": datetime.now().isoformat(),
        }

        for uid in (sender_id, receiver_id):
            conns = self.active_connections.get(uid, [])
            if not conns:
                continue

            alive: List[WebSocket] = []
            for ws in conns:
                ok = await self.safe_send_json(ws, payload)
                if ok:
                    alive.append(ws)

            if alive:
                self.active_connections[uid] = alive
            else:
                self.active_connections.pop(uid, None)


chat_manager = ChatManager()
