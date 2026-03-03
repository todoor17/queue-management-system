import os

import jwt
from dotenv import load_dotenv

load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM")


def get_user_from_token(token: str | None):
    if not token:
        return None

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        raw_user_id = payload.get("sub")
        role = payload.get("role")
        if raw_user_id is None:
            return None
        try:
            user_id = int(raw_user_id)
        except (TypeError, ValueError):
            return None
        return {"user_id": user_id, "role": role}
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None
