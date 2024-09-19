from app import create_app, db  # Import create_app and db from your app
from models import User  # Import your User model

# Create the Flask app instance
app = create_app()

# Use the application context to perform database operations
with app.app_context():
    # Fetch all users from the users table
    users = User.query.all()

    # Check if any users were found
    if users:
        print(f"{'User ID':<10} {'Username':<20} {'Password':<20} {'Email':<30} {'Role':<10} {'Department':<20}")
        print("-" * 90)
        for user in users:
            print(f"{user.user_id:<10} {user.username:<20} {user.password:<20} {user.email:<30} {user.role:<10} {user.department or 'N/A':<20}")
    else:
        print("No users found in the database.")
