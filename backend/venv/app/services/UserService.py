import app.db.db as db
from app.domain.user.User import user
import smtplib
from email.message import EmailMessage
from argon2 import PasswordHasher

hasher= PasswordHasher()

#creating account
def register(userId : str, name : str, email : str, password : str):
    hash=hasher.hash(password)
    new_user = user(userId, name, email, hash)
    verify_email(email)
    db.database.add_user(new_user)
    return new_user

def verify_email(email : str):
    sender_email = "PassVault@passvault.com"
    receiver_email = email
    message = EmailMessage()
    message["Subject"] = "Email Verification for your new Account"
    message["From"] = sender_email
    message["To"] = receiver_email
    message.set_content("Please verify your email address by clicking the following link: <verification_link>")

#email verification upon acc creation
def get_status(userId : str):
    return None




