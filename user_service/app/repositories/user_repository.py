from sqlalchemy.orm import Session

from app.domain.models.user_model import User


class UserRepository:
    def __init__(self, db: Session):
        self.db = db

    def create_user(self, user):
        self.db.add(user)
        self.db.commit()
        self.db.refresh(user)
        return user

    def get_all_users(self):
        return self.db.query(User).all()




