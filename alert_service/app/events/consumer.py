import asyncio
import json
import os
import time
import threading
import pika
from datetime import datetime
from dotenv import load_dotenv

from app.service import alert_manager

load_dotenv()

AMQP_URL = os.getenv("RABBITMQ_URL")
QUEUE_NAME = "alert_queue"
EXCHANGE_NAME = "alert_exchange"


def start_consumer():
    params = pika.URLParameters(AMQP_URL)

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

            print(f"Consumer connected to {QUEUE_NAME}. Waiting for messages...")

            def callback(ch, method, properties, body):
                try:
                    event = json.loads(body)
                    handle_event(event.get("event"), event.get("data", {}))
                    ch.basic_ack(delivery_tag=method.delivery_tag)
                except Exception as e:
                    print(f"Error processing message: {e}")

            channel.basic_consume(
                queue=QUEUE_NAME,
                on_message_callback=callback,
                auto_ack=False
            )
            channel.start_consuming()

        except Exception as e:
            print(f"Consumer connection lost: {e}")
            print("Reconnecting in 3 seconds...")
            time.sleep(3)


def handle_event(event_name: str, data: dict):
    if event_name == "alert_created":
        data["timestamp"] = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        print(f"RabbitMQ received: {data}")

        if alert_manager.loop:
            asyncio.run_coroutine_threadsafe(
                alert_manager.broadcast(data),
                alert_manager.loop
            )
        else:
            print("Error: Main loop not initialized in AlertManager")


def start_consumer_thread():
    thread = threading.Thread(target=start_consumer, daemon=True)
    thread.start()