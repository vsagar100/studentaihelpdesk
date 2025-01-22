from app import create_app, db  # Import your create_app function and db object
from models import AdminUser  # Import your User model
#import auth

app = create_app()  # Create your Flask app instance

def register_admin(username, password, password_hint):
    try:      
        # Create new user and hash the password before saving
        user = AdminUser(
            username=username,
            password_hint=password_hint
        )
        user.set_password(password)  # Hash the password before saving

        db.session.add(user)
        db.session.commit()

        return jsonify({'status': 'success', 'message': 'User registered successfully'}), 201

    except Exception as e:
        print(str(e))
        return jsonify({'status': 'error', 'message': str(e)}), 500


#with app.app_context():  # Push the application context
    # Fetch the user with user_id = 1
register_admin('admin', 'admin123', 'default password')
