from email.mime import message

import app.db.db as db
from app.domain.user.User import user
import smtplib
import ssl
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

#creating account
def register(userId : str, name : str, email : str, password : str):
    new_user = user(userId, name, email, password)
    verify_email(email)
    db.database.add_user(new_user)
    return new_user

def verify_email(email : str):
    sender_email = "your_email@example.com"
    receiver_email = email
    message = MIMEText(body, "plain")
    message["Subject"] = "Email Verification"
    message["From"] = "PassVault"

#email verification upon acc creation
def get_status(userId : str):
    return None




