from app import create_app, db  # Import create_app and db from your app
from models import User  # Import your User model
from flask_bcrypt import generate_password_hash  # Import password hashing function
import os
from config import Config

# Create the app object using your create_app function
app = create_app()

with app.app_context():  # Use the app context to access db and models
    #db_uri = app.config['SQLALCHEMY_DATABASE_URI']
    #relative_path = db_uri.replace('sqlite:///', '')
    #absolute_path = os.path.abspath(relative_path)
    print(f"Connected to database at: {app.config['SQLALCHEMY_DATABASE_URI']}")  # Debug print
    
    users = User.query.all()
    for user in users:
        if not user.password.startswith('$2b$'):  # Check if the password is not already hashed
            print("User password before hashing: %s", user.password)
            user.password = generate_password_hash(user.password).decode('utf-8')
            print(f"Updated password for user {user.username} {user.password}")
    db.session.commit()  # Commit all changes to the database
    print("All passwords have been hashed and updated.")

    updated_users = User.query.all()
    for user in updated_users:
        print(f"User {user.username} has password: {user.password}")  # This should show the hashed passwords
    db.session.close()