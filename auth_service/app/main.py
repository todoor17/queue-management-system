from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import router
from app.events import start_consumer_thread

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

app.include_router(router, prefix="/auth", tags=["Auth"])

@app.get("/")
def read_root():
    return {"message": "Hello World"}


start_consumer_thread()
