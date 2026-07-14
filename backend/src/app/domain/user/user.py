class user:
    def __init__(self, userId : str, name : str, email : str, password : str, is_verified : bool = False):
        self.userId = userId
        self.name = name
        self.email = email
        self.password = password
        self.is_verified = is_verified

    def __str__(self):
        return f"user(userId={self.userId}, name={self.name}, email={self.email}, password={self.password}, dob={self.dob}, is_verified={self.is_verified})"
    