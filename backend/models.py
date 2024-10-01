from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt, generate_password_hash, check_password_hash
from flask import jsonify, json
from app import db
import datetime  # Import the datetime module

db = SQLAlchemy()
bcrypt = Bcrypt()

class User(db.Model):
    __tablename__ = 'users'
    user_id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), nullable=False)
    password = db.Column(db.String(255), nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    role = db.Column(db.String(50), nullable=False)
    department = db.Column(db.String(100))  # Optional field
    file_path = db.Column(db.String(100))
    created_by = db.Column(db.String(100))
    created_date = db.Column(db.DateTime, default=db.func.current_timestamp())
    modified_by = db.Column(db.String(100))
    modified_date = db.Column(db.DateTime, default=db.func.current_timestamp(), onupdate=db.func.current_timestamp())
    
    current_workload = db.Column(db.Integer, default=0)

    # Hash the password before storing it in the database
    def set_password(self, password):
        self.password = generate_password_hash(password).decode('utf-8')

    # Check if the provided password matches the hashed password
    def check_password(self, password):
        return check_password_hash(self.password, password)

# FAQ model
class FAQ(db.Model):
    __tablename__ = 'faqs'
    faq_id = db.Column(db.Integer, primary_key=True)
    question = db.Column(db.Text, nullable=False)
    keywords = db.Column(db.Text, nullable=False)  # Keywords for matching
    answer = db.Column(db.Text, nullable=False)
    embedding = db.Column(db.Text, nullable=True)
    
    def set_embedding(self, embedding_vector):
        # Convert embedding list to JSON string
        self.embedding = json.dumps(embedding_vector)

    def get_embedding(self):
        # Convert JSON string back to Python list
        return json.loads(self.embedding)


class Grievance(db.Model):
    __tablename__ = 'grievances'
    grievance_id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, nullable=False)
    staff_id = db.Column(db.Integer, nullable=False)
    category = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=False)
    status = db.Column(db.String(50), nullable=False) 
    sentiment = db.Column(db.String(50), nullable=False)  # New field for sentiment
    priority = db.Column(db.String(50), nullable=True)
    file_path = db.Column(db.String(255), nullable=True)
    created_date = db.Column(db.DateTime, default=datetime.datetime.utcnow)
    created_by = db.Column(db.String(100), nullable=True)
    modified_date = db.Column(db.DateTime, default=datetime.datetime.utcnow)
    modified_by = db.Column(db.String(100), nullable=True)
    
    def __init__(self, student_id, staff_id, category, description, status, sentiment, file_path=None, priority=True, created_date=None, created_by=None, modified_date=None, modified_by=None):
        self.student_id = student_id
        self.staff_id = staff_id
        self.category = category
        self.description = description
        self.status = status
        self.sentiment = sentiment
        self.priority = priority
        self.file_path = file_path
        self.created_date = created_date
        self.created_by = created_by
        self.modified_date = modified_date
        self.modified_by = modified_by

class GrievanceUpdates(db.Model):
    __tablename__ = 'grievance_updates'
    update_id = db.Column(db.Integer, primary_key=True)
    grievance_id = db.Column(db.Integer, db.ForeignKey('grievances.grievance_id'), nullable=False)  # Link to Grievance
    user_id = db.Column(db.Integer, db.ForeignKey('users.user_id'), nullable=False)  # The staff member making the update
    update_text = db.Column(db.Text, nullable=False)  # The update details
    update_date = db.Column(db.DateTime, default=datetime.datetime.utcnow)  # Timestamp of the update

    def __init__(self, grievance_id, user_id, update_text):
        self.grievance_id = grievance_id
        self.user_id = user_id
        self.update_text = update_text
        
class Notification(db.Model):
    __tablename__ = 'notifications'
    notification_id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, nullable=False)
    grievance_id = db.Column(db.Integer, nullable=False)
    notification_text = db.Column(db.String(500), unique=True, nullable=False)
    notification_type  = db.Column(db.String(50), nullable=False)
    sent_date = db.Column(db.DateTime, default=datetime.datetime.utcnow)
    created_by = db.Column(db.String(100), nullable=False)
    created_date = db.Column(db.DateTime, default=db.func.current_timestamp())
    modified_by = db.Column(db.String(100), nullable=False)
    modified_date = db.Column(db.DateTime, default=db.func.current_timestamp(), onupdate=db.func.current_timestamp())
    
    
        

        