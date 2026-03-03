import asyncio
from contextlib import asynccontextmanager
from fastapi import FastAPI
from starlette.middleware.cors import CORSMiddleware

from app.service import alert_manager
from app.events.consumer import start_consumer_thread
from app.api.websocket_routes import router as websocket_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    loop = asyncio.get_running_loop()
    alert_manager.set_loop(loop)

    start_consumer_thread()
    yield


app = FastAPI(lifespan=lifespan)

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

app.include_router(websocket_router)


