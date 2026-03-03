
class Password:

    def __init__(self, length: int, strength: int, is_secure: bool):
        self.length = length
        self.strength = strength
        self.is_secure = is_secure

    def __str__(self):
        return f"Password(length={self.length}, strength={self.strength}, is_secure={self.is_secure})"
    