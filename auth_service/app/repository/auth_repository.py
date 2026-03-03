from app.domain import AuthModel


class AuthRepository:
    def __init__(self, db):
        self.db = db


    def username_exists(self, username: str) -> bool:
        return (
            self.db.query(AuthModel)
            .filter(AuthModel.username == username)
            .count() > 0
        )


    def email_exists(self, email: str) -> bool:
        return (
            self.db.query(AuthModel)
            .filter(AuthModel.email == email)
            .count() > 0
        )


    def create_account(self, user: AuthModel):
        self.db.add(user)
        self.db.commit()
        self.db.refresh(user)
        return user


    def get_user_by_email(self, email: str):
        return self.db.query(AuthModel).filter(AuthModel.email == email).first()


    def get_user_by_username(self, username: str):
        return self.db.query(AuthModel).filter(AuthModel.username == username).first()


    def get_user_by_id(self, user_id: int):
        return self.db.query(AuthModel).filter(AuthModel.user_id == user_id).first()


    def delete_account(self, account: AuthModel):
        self.db.delete(account)
        self.db.commit()


    def delete_user(self, account: AuthModel):
        self.delete_account(account)


    # def update_account(self, account: AuthModel):
    #     self.db.commit()
    #     self.db.refresh(account)
    #     return account
