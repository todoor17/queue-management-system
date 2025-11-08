from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.domain import UserModel


class UserRepository:
    def __init__(self, db: Session):
        self.db = db


    def check_uniqueness(self, user: UserModel) -> bool:
        if (self.db.query(UserModel)
                .filter(or_(UserModel.username == user.username, UserModel.email == user.email)).count() > 0):
            return False

        return True


    def create_user(self, user: UserModel) -> UserModel:
        self.db.add(user)
        self.db.commit()
        self.db.refresh(user)
        return user


    def get_all_users(self):
        return self.db.query(UserModel).all()


    def get_user_by_id(self, user_id):
        return self.db.query(UserModel).filter(UserModel.user_id == user_id).first()


    def check_username_uniqueness(self, username, current_id):
        return (self.db.query(UserModel)
                .filter(UserModel.username == username, UserModel.user_id != current_id).count() > 0)

    def check_email_uniqueness(self, email, current_id):
        return (self.db.query(UserModel)
                .filter(UserModel.email == email, UserModel.user_id != current_id).count() > 0)


    def update_user(self, updated_user: UserModel):
        self.db.commit()
        self.db.refresh(updated_user)

        return updated_user


    def delete_user(self, user: UserModel):
        self.db.delete(user)
        self.db.commit()



