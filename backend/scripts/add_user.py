import sys
import os

# Adjust the path to the backend directory to import the app
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app import create_app, db
from models import User
from flask_bcrypt import generate_password_hash

app = create_app()

with app.app_context():
    # Create a new user instance
    new_user = User(
        username='rock',
        email='rock@x.com',
        role='student',
        department='Computer Science'
    )
    
    # Set the user's password with hashing
    new_user.set_password('password123')

    # Add the user to the session and commit to the database
    db.session.add(new_user)
    db.session.commit()
    
    print(f"User {new_user.username} added with user_id {new_user.user_id}.")
