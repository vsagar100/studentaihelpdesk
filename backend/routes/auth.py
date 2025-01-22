from flask import Blueprint, request, jsonify
from flask import current_app
from flask_jwt_extended import create_access_token
from sqlalchemy.exc import SQLAlchemyError
from flask_bcrypt import check_password_hash  # Import bcrypt password verification
import logging
from werkzeug.utils import secure_filename
import pytesseract  # Import Tesseract OCR
from PIL import Image
import os
from models import db, AdminUser
import uuid
import datetime

auth_bp = Blueprint('auth', __name__)

UPLOAD_FOLDER = os.path.join(os.path.dirname(__file__), '../uploads/college_ids')

# Ensure the upload folder exists
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

# Allowed file extensions for college IDs
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'pdf'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@auth_bp.route('/signin', methods=['POST'])
def signin():
    try:
        if not request.is_json:
            return jsonify({"status": "error", "message": "Invalid JSON format"}), 400

        uname = request.json.get('uname', '').strip()
        password = request.json.get('password', '').strip()

        if not uname or not password:
            return jsonify({"status": "error", "message": "User name and password are required"}), 400

        user = AdminUser.query.filter_by(username=uname).first()
        #print(f"{user.password:<20}")
        #print(f"{generate_password_hash(password).decode('utf-8')}")
        if not user:            
            return jsonify({"status": "error", "message": "Invalid user name or password"}), 401

        # Use bcrypt to verify the provided password against the stored hashed password
        if not user.check_password(password):
            return jsonify({"status": "error", "message": "Invalid user name or password"}), 401

        # Create access token if authentication is successful
        access_token = create_access_token(identity={'user_id': user.id})

        return jsonify({
            "status": "success",
            "message": "Login successful",
            "token": access_token,
            "user": {
                "id": user.id,
                "username": user.username
            }
        }), 200

    except SQLAlchemyError as e:
        logging.error(f"Database error: {str(e)}")
        return jsonify({"status": "error", "message": "Internal server error"}), 500

    except Exception as e:
        logging.error(f"Unexpected error: {str(e)}")
        return jsonify({"status": "error", "message": "Internal server error"}), 500
        

@auth_bp.route('/user/add', methods=['POST'])
def register_user():
    try:
        # Generate password (temporary password, or you can request the user to input it)
        username = request.form.get('username')
        password = request.form.get('password')
        password_hint = request.form.get('hint')
        
        # Create new user and hash the password before saving
        user = AdminUser(
            username=username,
            password_hint=password_hint
        )
        user.set_password(password)  # Hash the password before saving

        db.session.add(user)
        db.session.commit()

        return jsonify({'status': 'success', 'message': 'User saved successfully'}), 201

    except Exception as e:
        print(str(e))
        return jsonify({'status': 'error', 'message': str(e)}), 500

@auth_bp.route('/user/update/<int:user_id>', methods=['POST'])
def update_user(user_id):
    try:
        username = request.form.get('username')
        password = request.form.get('password')
        password_hint = request.form.get('hint')
        
        curr_user = AdminUser.query.get(user_id)
        if not curr_user:
            return jsonify({'status': 'error', 'message': 'User not found'}), 404
        
        # Correct tuple unpacking
        curr_user.username = username
        curr_user.password_hint = password_hint
        curr_user.set_password(password)

        db.session.commit()

        return jsonify({'status': 'success', 'message': 'User updated successfully'}), 200

    except Exception as e:
        db.session.rollback()
        print(str(e))
        return jsonify({'status': 'error', 'message': str(e)}), 500

@auth_bp.route('/user/delete/<int:user_id>', methods=['DELETE'])
def delete_user(user_id):
    try:
               
        curr_user = AdminUser.query.get(user_id)
        if not curr_user:
            return jsonify({'status': 'error', 'message': 'User not found'}), 404

        db.session.delete(curr_user)
        db.session.commit()

        return jsonify({'status': 'success', 'message': 'User deleted successfully.'}), 200

    except Exception as e:
        db.session.rollback()
        print(str(e))
        return jsonify({'status': 'error', 'message': str(e)}), 500

@auth_bp.route('/user/resetpwd', methods=['POST'])
def reset_pwd():
    try:
        username = request.form.get('username')
        password = request.form.get('password')
        password_hint = request.form.get('hint')
        
        curr_user = AdminUser.query.filter_by(username=username).first()
        if not curr_user:
            return jsonify({'status': 'error', 'message': 'User not found'}), 404
        elif curr_user.password_hint != password_hint:
            return jsonify({'status': 'error', 'message': 'Incorrect hint answer, user password not reset.'}), 404
        
        # Correct tuple unpacking
        #curr_user.username = username
        #curr_user.password_hint = password_hint
        curr_user.set_password(password)

        db.session.commit()

        return jsonify({'status': 'success', 'message': 'User updated successfully'}), 200

    except Exception as e:
        db.session.rollback()
        print(str(e))
        return jsonify({'status': 'error', 'message': str(e)}), 500
               
@auth_bp.route('/users', methods=['GET'])
def get_users():
    try:
      users = AdminUser.query.all()
         
      users_data = [
        {
          "user_id": user.id,
          "username": user.username,
          "hint": user.password_hint
        }
        for user in users
      ]
      return jsonify(users_data), 200
    except Exception as e:
        print(str(e))
        return jsonify({'status': 'error', 'message': str(e)}), 500
      
# Function to extract student name from the extracted text
def extract_name_from_text(text):
    # Simple extraction based on patterns or keywords. You might need to adjust this logic
    # based on your ID card's format.
    lines = text.split('\n')
    for line in lines:
        if "Name" in line or "name" in line:
            return line.split(":")[-1].strip()  # Example extraction
    return None

# Function to extract college name from the extracted text
def extract_college_from_text(text):
    lines = text.split('\n')
    for line in lines:
        for college in current_app.config['VALID_COLLEGES']:
            if college.lower() in line.lower():
                return college
    return None

# Function to generate an email from the student's name
def generate_email_from_name(name):
    # For simplicity, assuming the email follows a format like 'first.last@college.com'
    name_parts = name.split()
    if len(name_parts) >= 2:
        first_name = name_parts[0].lower()
        last_name = name_parts[-1].lower()
        return f"{first_name}.{last_name}@"+ current_app.config['COLLEGE_DOMAIN']
    return None