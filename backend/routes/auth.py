from flask import Blueprint, request, jsonify
from flask import current_app
from flask_jwt_extended import create_access_token
from models import User
from sqlalchemy.exc import SQLAlchemyError
from flask_bcrypt import check_password_hash  # Import bcrypt password verification
import logging
from werkzeug.utils import secure_filename
import pytesseract  # Import Tesseract OCR
from PIL import Image
import os
from models import db, User
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

        email = request.json.get('email', '').strip()
        password = request.json.get('password', '').strip()

        if not email or not password:
            return jsonify({"status": "error", "message": "Email and password are required"}), 400

        user = User.query.filter_by(email=email).first()
        #print(f"{user.password:<20}")
        #print(f"{generate_password_hash(password).decode('utf-8')}")
        if not user:            
            return jsonify({"status": "error", "message": "Invalid email or password"}), 401

        # Use bcrypt to verify the provided password against the stored hashed password
        if not user.check_password(password):
            return jsonify({"status": "error", "message": "Invalid email or password"}), 401

        # Create access token if authentication is successful
        access_token = create_access_token(identity={'user_id': user.user_id, 'role': user.role})

        return jsonify({
            "status": "success",
            "message": "Login successful",
            "token": access_token,
            "user": {
                "user_id": user.user_id,
                "username": user.username,
                "email": user.email,
                "role": user.role
            }
        }), 200

    except SQLAlchemyError as e:
        logging.error(f"Database error: {str(e)}")
        return jsonify({"status": "error", "message": "Internal server error"}), 500

    except Exception as e:
        logging.error(f"Unexpected error: {str(e)}")
        return jsonify({"status": "error", "message": "Internal server error"}), 500
        



# Extract text using Tesseract OCR
def extract_text_from_image(image_path):
    try:
        img = Image.open(image_path)
        text = pytesseract.image_to_string(img)
        return text
    except Exception as e:
        raise Exception(f"Error extracting text from image: {str(e)}")

@auth_bp.route('/signup', methods=['POST'])
def register_user():
    try:
        college_id_file = request.files.get('collegeId')

        # Ensure the file is provided and is valid
        if not college_id_file or not allowed_file(college_id_file.filename):
            return jsonify({'status': 'error', 'message': 'Valid College ID file is required'}), 400

        # Save the College ID file
        filename = secure_filename(college_id_file.filename)
        unique_filename = str(uuid.uuid4()) + "_" + filename
        file_path = os.path.join(UPLOAD_FOLDER, unique_filename)
        college_id_file.save(file_path)

        # Extract text from the uploaded image
        extracted_text = extract_text_from_image(file_path)

        # Extract student name and college name from the extracted text
        student_name = extract_name_from_text(extracted_text)
        college_name = extract_college_from_text(extracted_text)

        # Validate extracted college name with config.py's VALID_COLLEGES
        if college_name not in current_app.config['VALID_COLLEGES']:
            return jsonify({'status': 'error', 'message': 'Invalid College detected in the College ID'}), 400

        # Auto-generate email based on student name (assuming a fixed domain for students)
        #email = generate_email_from_name(student_name)

        # Generate password (temporary password, or you can request the user to input it)
        password = request.form.get('password')
        email = request.form.get('email')
        role = request.form['role']

        if not all([student_name, email, password]):
            return jsonify({'status': 'error', 'message': 'Error extracting required fields from the College ID'}), 400

        # Create new user and hash the password before saving
        user = User(
            username=student_name,
            email=email,
            role=role,
            department=college_name,  # Store the college name as department
            created_by=current_app.config['SYSTEM_USER_ID'],
            modified_by=current_app.config['SYSTEM_USER_ID']
        )
        user.set_password(password)  # Hash the password before saving

        db.session.add(user)
        db.session.commit()

        return jsonify({'status': 'success', 'message': 'User registered successfully'}), 201

    except Exception as e:
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