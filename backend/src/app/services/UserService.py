import datetime
from hashlib import new
import app.db.db as db
from app.domain.user.User import user
import smtplib
from email.message import EmailMessage
from argon2 import PasswordHasher
from argon2.exceptions import VerifyMismatchError
import secrets as pysecrets
from datetime import datetime, timedelta, timezone

from backend.src.app.db.models import purpose

hasher= PasswordHasher()

MFA_CODE_TTL = timedelta(minutes=5)
MFA_MAX_ATTEMPTS = 5
SESSION_TTL = timedelta(days=7)

#creating account
def register(userId : str, name : str, email : str, password : str):
    password_hash = hasher.hash(password)
    new_user = user(userId, name, email, password_hash, False)
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

def login(email : str, password: str):
    user = db.database.get_user_by_email(email)

    if user is None or not verify_password(user.authHash, password):
        raise ValueError("Invalid credentials")

    code = f"{pysecrets.randbelow(1_000_000):06d}"  # random 6-digit code, zero-padded
    code_hash = hasher.hash(code)
    challenge_id = pysecrets.token_urlsafe(32)

    db.database.add_secret(
        user_id=user.id,
        challenge_id=challenge_id,
        secretHash=code_hash,
        purpose=purpose.MFA_CODE,
        expiration=datetime.now(timezone.utc) + MFA_CODE_TTL,
        attempts=0,
    )

    send_email(
        content=f"Your PassVault verification code is: {code}",
        subject="Your login code",
        to_email=user.email,
    )
    
    return challenge_id

def verify_email(email : str):
    token = pysecrets.token_urlsafe(32)
    db.database.add_secret(
        user_id=db.database.get_user_by_email(email).id,
        challenge_id=token,
        secretHash=token,
        purpose=purpose.EMAIL_VERIFY,
        expiration=datetime.now(timezone.utc) + timedelta(hours=24),  # 24 hours from now
        attempts=0,
    )
    subject = "Verify your email"
    content = f"Verify your email: http://localhost:5173/verify?token={token}"
    send_email(content, subject, email)


def verify(token: str):
    record = db.database.get_secret_by_challenge(token)
    if record is None or record.purpose != purpose.EMAIL_VERIFY:
        raise ValueError("Invalid or expired verification link")
    if datetime.now(timezone.utc) > record.expiration:
        db.database.delete_secret(record.id)
        raise ValueError("Invalid or expired verification link")

    db.database.set_verification_status(record.user_id, "verified")
    db.database.delete_secret(record.id)
    return record.user_id

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
    

    mf_code = pysecrets.token_urlsafe(6)
    now = datetime.now(timezone.utc)
    expiration_time = (now + timedelta(minutes=5))  # 5 minutes from now
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




