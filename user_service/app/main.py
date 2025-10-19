from fastapi import FastAPI, Depends
from sqlalchemy import text

from utils.db_connector import get_db
app = FastAPI()

@app.get("/")
def read_root():
    return {"message": "Hello World"}

@app.get("/test")
async def test(db = Depends(get_db)):
    query = db.execute(text('SELECT * FROM user')).fetchall()
    print(query)
    return {"message": "Hello World"}