from app import create_app, db  # Import your create_app function and db object
from models import User  # Import your User model

app = create_app()  # Create your Flask app instance

with app.app_context():  # Push the application context
    # Fetch the user with user_id = 1
    user = User.query.get(1)
    if user:
        user.password = '$2b$12$JEHiJ8Xg7K6Qle1tSCqf3eaU8P76PYJNh4.d8YXC.iBPKTBqT3lwK'  # Replace with the actual hashed password
        user.modified_date = db.func.current_timestamp()  # Update the modified date
        db.session.commit()  # Commit the changes to the database
        print(f"Password updated for user_id: {user.user_id}")
    else:
        print("User not found")
