from fastapi import FastAPI
from app.api.user_routes import router as user_router

app = FastAPI()

app.include_router(user_router, prefix="/users", tags=["Users"])

@app.get("/")
def read_root():
    return {"message": "Hello World"}