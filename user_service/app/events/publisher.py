import pika, os, json
from dotenv import load_dotenv

load_dotenv()

AMPQ_URL = os.getenv("RABBITMQ_URL")
EXCHANGE_NAME = "sync_exchange"


def publish_event(event_name: str, payload: dict):
    params = pika.URLParameters(AMPQ_URL)
    connection = pika.BlockingConnection(params)
    channel = connection.channel()

    channel.exchange_declare(
        exchange=EXCHANGE_NAME,
        exchange_type="fanout",
        durable=True
    )

    message = {
        "event": event_name,
        "data": payload
    }

    channel.basic_publish(
        exchange=EXCHANGE_NAME,
        routing_key="",  # ignored
        body=json.dumps(message),
        properties=pika.BasicProperties(
            delivery_mode=2,
            content_type="application/json"
        ),
    )

    connection.close()
