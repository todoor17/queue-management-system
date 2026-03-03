import jwt
import os
from datetime import datetime, timedelta

from dotenv import load_dotenv
from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer
from starlette import status

load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM")

bearer_scheme = HTTPBearer()


def get_current_user(token: str = Depends(bearer_scheme)):
    try:
        payload = jwt.decode(token.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        print(payload)
        return {
            "user_id": payload.get("sub"),
            "role": payload.get("role"),
        }
    except jwt.ExpiredSignatureError:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Token expired")
    except jwt.InvalidTokenError:
        print(token)
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid token")


def require_role(*roles):
    def wrapper(user = Depends(get_current_user)):
        if user["role"] not in roles:
            print(user["role"])
            raise HTTPException(status.HTTP_403_FORBIDDEN, "Forbidden")
        return user
    return wrapper


def build_service_headers(role: str = "ADMIN", subject: str = "user_service"):
    expire = datetime.utcnow() + timedelta(minutes=5)
    payload = {"sub": subject, "role": role, "exp": expire}
    token = jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)
    return {"Authorization": f"Bearer {token}"}
