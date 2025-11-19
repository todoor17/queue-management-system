from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import device_router

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

app.include_router(device_router, prefix="/devices", tags=["Devices"])

