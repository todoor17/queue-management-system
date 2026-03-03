import time, os, threading, pika, json

from dotenv import load_dotenv

load_dotenv()

AMPQ_URL = os.getenv("RABBITMQ_URL")
QUEUE_NAME = "monitoring_queue"
EXCHANGE_NAME = "sync_exchange"


def start_device_consumer():
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
    from app.repository import MonitoringRepository
    from app.service import MonitoringService
    from app.utils import get_db

    db = next(get_db())
    monitoring_repo = MonitoringRepository(db)
    monitoring_service = MonitoringService(monitoring_repo)

    if event_name == "device_created":
        device_id = data["device_id"]
        max_consumption_value = data["max_consumption_value"]
        monitoring_service.add_device_details(device_id, max_consumption_value)

    elif event_name == "device_updated":
        device_id = data["device_id"]
        max_consumption_value = data["max_consumption_value"]
        monitoring_service.update_device_details(device_id, max_consumption_value)

    elif event_name == "device_deleted":
        device_id = data["device_id"]
        monitoring_service.delete_logs_by_device_id(device_id)
        monitoring_service.delete_device_details(device_id)


def start_device_consumer_thread():
    thread = threading.Thread(target=start_device_consumer, daemon=True)
    thread.start()
