import datetime
import os
import app.db.db as db
import smtplib
from email.message import EmailMessage
from dotenv import load_dotenv
from argon2 import PasswordHasher
from argon2.exceptions import VerifyMismatchError
import secrets as pysecrets
from datetime import datetime, timedelta, timezone

from app.db.models import purpose
from app.services.NotificationService import notify_user_verified

load_dotenv()


class EmailNotVerifiedError(Exception):
    """Raised when a user attempts to log in but their email is not verified."""


hasher= PasswordHasher()

SMTP_EMAIL = os.getenv("SMTP_EMAIL")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD")


MFA_CODE_TTL = timedelta(minutes=5)
MFA_MAX_ATTEMPTS = 5
SESSION_TTL = timedelta(days=7)


def _as_utc_datetime(value: datetime) -> datetime:
    if value.tzinfo is None:
        return value.replace(tzinfo=timezone.utc)
    return value.astimezone(timezone.utc)

#creating account
def register(user_id: str, name : str, email : str, auth_salt : str, auth_hash : str):

    pass_hash = hasher.hash(auth_hash)
    new_user = db.database.add_user(user_id, name, email, auth_salt, pass_hash, False)
    try:
        # send verification email and leave account unverified until user clicks link
        verify_email(email)
    except Exception as e:
        print(f"Failed to send verification email: {e}")
        # Rollback user creation if email fails
        try:
            db.database.delete_user(new_user.user_id if hasattr(new_user, 'user_id') else new_user)
        except Exception:
            pass
        raise

    return new_user

def verify_password(auth_hash: str, auth_hash_client: str) -> bool:
    try:
        hasher.verify(auth_hash, auth_hash_client)
        return True
    except VerifyMismatchError:
        return False




def login(email : str, auth_hash: str):
    user = db.database.get_user_by_email(email)

    if user is None or not verify_password(user.auth_hash, auth_hash):
        raise ValueError("Invalid credentials")

    verified = db.database.get_user_verification_status(user.user_id)
    if str(verified).lower() not in ("true", "1", "verified") and verified is not True:
        raise EmailNotVerifiedError("Email not verified")

    code = f"{pysecrets.randbelow(1_000_000):06d}"  # random 6-digit code, zero-padded
    code_hash = hasher.hash(code)
    challenge_id = pysecrets.token_urlsafe(32)


    db.database.add_secret(
        user_id=user.user_id,
        challenge_id=challenge_id,
        secretHash=code_hash,
        purpose=purpose.MFA_CODE,
        expiration=datetime.now(timezone.utc) + MFA_CODE_TTL,
        attempts=0,
    )
    try:
        send_email(
            content=f"Your PassVault verification code is: {code}",
            subject="Your login code",
            to_email=user.email,
        )
    except Exception as e:
        print(f"Failed to send MFA email: {e}")
        db.database.delete_secret(challenge_id)
        raise ValueError("Failed to send MFA code. Please try again later.")
    
    return challenge_id

def verify_email(email : str):
    token = pysecrets.token_urlsafe(32)
    db.database.add_secret(
        user_id=db.database.get_user_by_email(email).user_id,
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
    if datetime.now(timezone.utc) > _as_utc_datetime(record.expiration):
        db.database.delete_secret(record.id)
        raise ValueError("Invalid or expired verification link")

    db.database.set_verification_status(record.user_id, True)
    db.database.delete_secret(record.id)
    try:
        notify_user_verified(record.user_id)
    except Exception:
        pass
    return record.user_id

def send_email(content: str, subject: str, to_email: str):

    if not SMTP_EMAIL or not SMTP_PASSWORD:
        raise ValueError("SMTP credentials missing from environment variables!")

    message = EmailMessage()
    message["Subject"] = subject
    message["From"] = f"PassVault <{SMTP_EMAIL}>"  # Recommended to match your authenticated Gmail address
    message["To"] = to_email
    message.set_content(content)

    with smtplib.SMTP("smtp.gmail.com", 587) as smtp:
        smtp.starttls()  
        smtp.login(SMTP_EMAIL, SMTP_PASSWORD)
        smtp.send_message(message)
        print(f"Email sent to {to_email} with subject '{subject}'")



def mfa(challenge_id: str, otp: str) -> str:
    secret_record = db.database.get_secret_by_challenge(challenge_id)
    if not secret_record or secret_record.purpose != purpose.MFA_CODE:
        raise ValueError("Invalid or expired MFA session.")

    if datetime.now(timezone.utc) > _as_utc_datetime(secret_record.expiration):
        db.database.delete_secret(secret_record.id)
        raise ValueError("MFA code has expired. Please log in again.")

    if secret_record.attempts >= MFA_MAX_ATTEMPTS:
        db.database.delete_secret(secret_record.id)
        raise ValueError("Too many failed attempts. Please log in again.")

    if not verify_password(stored_hash=secret_record.secretHash, password=otp):
        db.database.increment_secret_attempts(secret_record.id)
        raise ValueError("Invalid verification code.")

    user_id = secret_record.user_id
    db.database.delete_secret(secret_record.id)

    session_id = pysecrets.token_urlsafe(32)
    db.database.add_session(
        session_id=session_id,
        user_id=user_id,
        created_at=datetime.now(timezone.utc),
        expires_at=datetime.now(timezone.utc) + SESSION_TTL
    )

    return session_id

#email verification upon acc creation
def get_status(user_id: str):
    return db.database.get_user_verification_status(user_id)

def get_salt(email: str):
    user = db.database.get_user_by_email(email)
    if user is None:
        raise ValueError("User not found")
    return user.auth_salt




