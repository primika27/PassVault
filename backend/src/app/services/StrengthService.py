from zxcvbn import zxcvbn


def calculate_strength(password : str):
    strength = zxcvbn(password)
    return strength['score']
