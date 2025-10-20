from fastapi import FastAPI

from app.apis import device_router

app = FastAPI()

app.include_router(device_router, tags=["Devices"])

@app.get("/")
async def root():
    return {"message": "Hello World"}

