import os, random, pika, json, time, threading

from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

AMPQ_URL = os.getenv("RABBITMQ_URL")
EXCHANGE_NAME = "data_exchange"


def simulate_measurement():
    base = random.uniform(0.2, 0.6)
    fluct = random.uniform(-0.05, 0.05)
    return max(0, round(base + fluct, 3))  # kWh


def publish_measurement(device_id: int = 1):
    params = pika.URLParameters(AMPQ_URL)
    connection = pika.BlockingConnection(params)
    channel = connection.channel()

    channel.exchange_declare(
        exchange=EXCHANGE_NAME,
        exchange_type="fanout",
        durable=True
    )

    measurement = {
        "device_id": device_id,
        "value": simulate_measurement(),
        "timestamp": datetime.now().isoformat()
    }

    event_message = {
        "event": "device_measured",
        "data": measurement
    }

    channel.basic_publish(
        exchange=EXCHANGE_NAME,
        routing_key="",
        body=json.dumps(event_message),
        properties=pika.BasicProperties(delivery_mode=2)
    )

    print("Simulator sent:", measurement)
    connection.close()


def start_simulator():
    while True:
        publish_measurement(device_id=4)
        time.sleep(10)


def start_simulator_thread():
    thread = threading.Thread(target=start_simulator, daemon=True)
    thread.start()