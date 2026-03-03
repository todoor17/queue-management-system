import time, os, threading, pika, json
from dotenv import load_dotenv

from app.domain import UpdateAccountRequestDTO

load_dotenv()

AMPQ_URL = os.getenv("RABBITMQ_URL")
QUEUE_NAME = "auth_queue"
EXCHANGE_NAME = "sync_exchange"

def start_consumer():
    params = pika.URLParameters(AMPQ_URL)

    while True:
        try:
            connection = pika.BlockingConnection(params)
            channel = connection.channel()

            channel.exchange_declare(
                exchange=EXCHANGE_NAME,
                exchange_type="fanout",
                durable=True
            )

            channel.queue_declare(queue=QUEUE_NAME, durable=True)
            channel.queue_bind(exchange=EXCHANGE_NAME, queue=QUEUE_NAME)

            print(f"Consumer on queue {QUEUE_NAME} connected. Waiting for messages...")

            def callback(ch, method, properties, body):
                event = json.loads(body)
                handle_event(event.get("event"), event.get("data", {}))
                ch.basic_ack(delivery_tag=method.delivery_tag)

            channel.basic_consume(
                queue=QUEUE_NAME,
                on_message_callback=callback,
                auto_ack=False
            )

            channel.start_consuming()

        except Exception as e:
            print("Consumer error:", e)
            print("Reconnecting in 3 seconds...")
            time.sleep(3)



def handle_event(event_name: str, data: dict):
    from app.repository.auth_repository import AuthRepository
    from app.service import AuthService
    from app.utils import get_db

    db = next(get_db())
    auth_repo = AuthRepository(db)
    auth_service = AuthService(auth_repo)

    if event_name == "user_updated":
        user_id = data.get("user_id")
        updated_user = UpdateAccountRequestDTO(**data.get("update_data"))
        auth_service.update_account_by_id(user_id=user_id, update_dto=updated_user)
        print("Account updated")

def start_consumer_thread():
    thread = threading.Thread(target=start_consumer, daemon=True)
    thread.start()
