from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Query

from app.service import alert_manager, chat_manager
from app.utils import match_rule, get_gemini_response, get_user_from_token

router = APIRouter()


@router.websocket("/ws/alerts")
async def send_alert(websocket: WebSocket, token: str = Query(None)):
    user = get_user_from_token(token)
    if not user:
        await websocket.close(code=1008)
        return

    await alert_manager.connect(websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        await alert_manager.disconnect(websocket)


@router.websocket("/ws/chat")
async def send_chat(
    websocket: WebSocket,
    sender_id: int = Query(...),
    receiver_id: int = Query(...),
    token: str = Query(None),
):
    user = get_user_from_token(token)
    if not user:
        await websocket.close(code=1008)
        return
    if user.get("user_id") != sender_id:
        await websocket.close(code=1008)
        return

    sender_role = str(user.get("role") or "CLIENT").upper()
    if sender_id == receiver_id:
        await websocket.close(code=1008)
        return

    await chat_manager.connect(sender_id, websocket)

    try:
        while True:
            data = await websocket.receive_json()
            message_text = (data.get("message") or "").strip()

            if not message_text:
                continue

            await chat_manager.send_message(
                sender_id=sender_id,
                receiver_id=receiver_id,
                message=message_text,
            )

            bot_response = match_rule(message_text)
            if bot_response and sender_role != "ADMIN":
                await chat_manager.send_message(
                    sender_id=0,
                    receiver_id=sender_id,
                    message=f"Bot: {bot_response}",
                )
            elif sender_role != "ADMIN":
                await chat_manager.send_message(
                    sender_id=0,
                    receiver_id=sender_id,
                    message=get_gemini_response(message_text),
                )

    except WebSocketDisconnect:
        await chat_manager.disconnect(sender_id, websocket)
