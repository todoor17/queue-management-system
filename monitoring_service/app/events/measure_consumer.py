import time, os, threading, pika, json

from dotenv import load_dotenv
from app.domain import LogModel

load_dotenv()

AMPQ_URL = os.getenv("RABBITMQ_URL")
QUEUE_NAME = "data_queue"
EXCHANGE_NAME = "data_exchange"


def start_measure_consumer():
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

    if event_name == "device_measured":
        log = LogModel(**data)

        monitoring_service.save_log(log)
        monitoring_service.save_hourly(
            device_id=log.device_id,
            value=log.value,
            timestamp=log.timestamp,
        )


def start_measure_consumer_thread():
    thread = threading.Thread(target=start_measure_consumer, daemon=True)
    thread.start()
