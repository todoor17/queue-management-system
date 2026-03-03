from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import router
from app.events import start_measure_consumer_thread, start_device_consumer_thread, start_simulator_thread

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://frontend.localhost",
        "http://frontend.localhost:80",
        "https://frontend.localhost",
        "http://localhost:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router, prefix="/monitoring", tags=["Monitoring"])

@app.get("/")
def read_root():
    return {"message": "Hello World"}


start_measure_consumer_thread()
start_device_consumer_thread()
start_simulator_thread()
