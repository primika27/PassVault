from hashlib import new
from sqlite3 import Date

from sqlalchemy import false

import app.db.db as db
from app.domain.user.User import user
import smtplib
from email.message import EmailMessage
from argon2 import PasswordHasher
from argon2.exceptions import VerifyMismatchError
import secrets
hasher= PasswordHasher()

#creating account
def register(userId : str, name : str, email : str, password : str):
    password_hash = hasher.hash(password)
    new_user = user(userId, name, email, password_hash, false)
    try:
       verify_email(email) 
    except Exception as e:
        print(f"Failed to send verification email: {e}")
    db.database.add_user(new_user)
    return new_user

def verify_password(stored_hash: str, password: str) -> bool:
    try:
        hasher.verify(stored_hash, password)
        return True
    except VerifyMismatchError:
        return False

def login(email : str, hash: str):
    user = db.database.get_user_by_email(email)
    if user is None:
        raise ValueError("Invalid credentials")
    if not verify_password(user.hash, hash):
        raise ValueError("Invalid credentials")
    return user

def verify_email(email : str):
    subject = "Verify your email"
    content = f"Please verify your email by clicking the following link: http://localhost:5173/verify?email={email}"
    send_email(content, subject, email)

def send_email(content: str, subject: str, to_email: str):
    smtp = smtplib.SMTP('localhost')
    sender_email = "PassVault@passvault.com"
    message = EmailMessage()
    message["Subject"] = subject
    message["From"] = sender_email
    message["To"] = to_email
    message.set_content(content)
    smtp.send_message(message)

def mfauthenticate(userId : str, authHash: str):
    user = db.database.get_user_by_id(userId)
    if user is None:
        raise ValueError("User not found")
    try:
        hasher.verify(user.authHash, authHash)
    except Exception as e:
        raise ValueError("Invalid credentials") from e
    

    mf_code = secrets.token_urlsafe(6)
    now = Date.now()
    expiration_time = (now + 5 * 60 * 1000)  # 5 minutes from now
    db.database.add_secret(userId, mf_code, "mfa_code", expiration_time, 1)
    subject = "MFA Authentication"
    content = f"Here is your MFA code: {mf_code}Please use this code to complete your authentication."
    send_email(content, subject, user.email)
    return user

#email verification upon acc creation
def get_status(userId : str):
    return db.database.get_user_verification_status(userId)

def get_salt(userId : str):
    user = db.database.get_user_by_id(userId)
    if user is None:
        raise ValueError("User not found")
    return user.kdfSalt




