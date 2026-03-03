from fastapi import WebSocket
import asyncio

class AlertManager:
    def __init__(self):
        self.active_connections: set[WebSocket] = set()
        self.loop = None

    def set_loop(self, loop):
        self.loop = loop

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.add(websocket)
        print(f"New alert listener added. Total: {len(self.active_connections)}")

    async def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
            print(f"Alert listener removed. Total: {len(self.active_connections)}")

    async def broadcast(self, data):
        if not self.active_connections:
            return

        tasks = [connection.send_json(data) for connection in list(self.active_connections)]
        await asyncio.gather(*tasks, return_exceptions=True)

alert_manager = AlertManager()