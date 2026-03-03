import os, pika, threading, json, time
from dotenv import load_dotenv

load_dotenv()

AMPQ_URL = os.getenv("RABBITMQ_URL")
QUEUE_NAME = "device_queue"
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
    from app.repository import DeviceRepository, UserDevicesRepository
    from app.service import UserDevicesService
    from app.utils import get_db

    db = next(get_db())
    device_repo = DeviceRepository(db)
    user_devices_repo = UserDevicesRepository(db)
    service = UserDevicesService(user_devices_repo, device_repo)

    if event_name == "user_deleted":
        user_id = data.get("user_id")
        service.delete_links_by_user_id(user_id)
        print(f"Links deleted for user: {user_id}")


def start_consumer_thread():
    thread = threading.Thread(target=start_consumer, daemon=True)
    thread.start()
