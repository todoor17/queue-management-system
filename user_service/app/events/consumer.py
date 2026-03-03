import os, pika, threading, json, time
from dotenv import load_dotenv

from app.domain import CreateUserRequestDTO

load_dotenv()

AMPQ_URL = os.getenv("RABBITMQ_URL")
QUEUE_NAME = "user_queue"
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
    from app.repository.user_repository import UserRepository
    from app.service import UserService
    from app.utils import get_db

    db = next(get_db())
    user_repo = UserRepository(db)
    user_service = UserService(user_repo)

    if event_name == "user_created":
        user_request = CreateUserRequestDTO(**data)
        user_service.create_user(user_request)
        print("User created")
    elif event_name == "user_deleted":
        user_service.delete_user(data.get("user_id"))
        print("User deleted")


def start_consumer_thread():
    thread = threading.Thread(target=start_consumer, daemon=True)
    thread.start()
