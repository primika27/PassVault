class user:
    def __init__(self, user_id : str, name : str, email : str, password_hash : str, is_verified : bool = False):
        self.user_id = user_id
        self.name = name
        self.email = email
        self.password_hash = password_hash
        self.is_verified = is_verified

    def __str__(self):
        return f"user(userId={self.user_id}, name={self.name}, email={self.email}, password_hash={self.password_hash}, is_verified={self.is_verified})"