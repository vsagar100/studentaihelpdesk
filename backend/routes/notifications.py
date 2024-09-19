from flask import Blueprint, jsonify, request
from models import db, Notification, User, Grievance
from sqlalchemy.exc import SQLAlchemyError
import logging
from datetime import datetime

notifications_bp = Blueprint('notifications', __name__)

def send_notification(user_id, grievance_id, message, notification_type='email'):
    try:
        # Create a new notification entry in the database
        notification = Notification(
            user_id=user_id,
            grievance_id=grievance_id,
            notification_text=message,            
            notification_type=notification_type
            
        )
        db.session.add(notification)
        db.session.commit()

        # Simulate sending email/SMS (Here we'll just log it)
        if notification_type == 'email':
            logging.info(f"Sending email to user {user_id}: {message}")
        elif notification_type == 'sms':
            logging.info(f"Sending SMS to user {user_id}: {message}")

        return True
    except SQLAlchemyError as e:
        logging.error(f"Error sending notification: {str(e)}")
        return False
