from flask import Blueprint, request, jsonify
from flask import current_app
from werkzeug.utils import secure_filename
from textblob import TextBlob  # Import TextBlob for sentiment analysis
import os
from models import db, Grievance, User  # Assuming User is the staff model
import uuid
import datetime  # For setting created_date and modified_date

from notifications import send_notification

submit_grievance_bp = Blueprint('submit_grievance', __name__)

# Path for saving uploads
UPLOAD_FOLDER = os.path.join(os.path.dirname(__file__), '../uploads')

# Ensure the upload folder exists
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

# Allowed file extensions
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'pdf', 'doc', 'docx'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def analyze_sentiment(description):
    analysis = TextBlob(description)
    polarity = analysis.sentiment.polarity
    if polarity > 0:
        return 'positive'
    elif polarity < 0:
        return 'negative'
    else:
        return 'neutral'

def set_priority_based_on_sentiment(description):
    blob = TextBlob(description)
    polarity = blob.sentiment.polarity
    if polarity < -0.5:
        return "high"
    elif -0.5 <= polarity <= 0.1:
        return "medium"
    else:
        return "low"

def categorize_grievance(description):
    academic_keywords = ['professor', 'lecture', 'exam', 'course', 'assignment', 'class']
    facilities_keywords = ['hostel', 'lab', 'canteen', 'library', 'wifi', 'water', 'electricity']
    administration_keywords = ['admission', 'registration', 'fee', 'scholarship', 'staff', 'administration']

    description_lower = description.lower()

    if any(word in description_lower for word in academic_keywords):
        return "Academic"
    elif any(word in description_lower for word in facilities_keywords):
        return "Facilities"
    elif any(word in description_lower for word in administration_keywords):
        return "Administration"
    else:
        return "General"

# New function to auto-assign grievance to a staff member
def assign_staff_to_grievance(category):
    # Find staff who worked on similar grievances
    staff_with_experience = db.session.query(User).join(Grievance, User.user_id == Grievance.created_by)\
        .filter(Grievance.category == category, User.role == 'staff').group_by(User.user_id).all()

    # Check workload if experienced staff is found
    if staff_with_experience:
        staff_with_least_workload = min(staff_with_experience, key=lambda staff: staff.current_workload)
        return staff_with_least_workload

    # If no experienced staff, assign to the staff member with least workload
    all_staff = db.session.query(User).filter(User.role == 'staff').all()
    if all_staff:
        staff_with_least_workload = min(all_staff, key=lambda staff: staff.current_workload)
        return staff_with_least_workload

    # Safeguard, in case no staff is available
    return None

@submit_grievance_bp.route('/submit', methods=['POST'])
def submit_grievance():
    try:
        # Get form data
        description = request.form.get('description')
        student_id = request.form.get('student_id')

        # Categorize grievance
        category = categorize_grievance(description)

        # Default status - initially setting to 'submitted'
        status = 'submitted'

        # Analyze sentiment of the grievance description
        sentiment = analyze_sentiment(description)

        # Automatically set priority based on sentiment
        priority = set_priority_based_on_sentiment(description)

        # Assign grievance to a staff member based on category and workload
        assigned_staff = assign_staff_to_grievance(category)

        if assigned_staff:
            assigned_staff_id = assigned_staff.user_id
            # Reduce workload of the assigned staff member
            assigned_staff.current_workload += 1  # Increase workload count
            db.session.commit()  # Save updated workload
        else:
            return jsonify({'status': 'error', 'message': 'No staff available for assignment'}), 500

        # Set system user ID (for demo purposes, let's assume it's hardcoded)
        gbl_system_user_id = current_app.config['SYSTEM_USER_ID']

        # Check if category and description are provided
        if not category or not description:
            return jsonify({'status': 'error', 'message': 'Category and description are required fields.'}), 400

        # Handle file upload
        file = request.files.get('file')
        file_path = None
        # Modify the file path to be relative and serve from '/uploads'
        if file and allowed_file(file.filename):
          filename = secure_filename(file.filename)
          unique_filename = str(uuid.uuid4()) + "_" + filename
          file_path = os.path.join(UPLOAD_FOLDER, unique_filename)
          file.save(file_path)
      
          # Save the relative path in the database, e.g., '/uploads/filename'
          file_path = f"/uploads/{unique_filename}"


        # Get current date and time for created_date and modified_date
        current_date_time = datetime.datetime.utcnow()
        print(f"Before save")
        # Create new grievance object
        grievance = Grievance(
            student_id=student_id,
            category=category,
            description=description,
            status=status,
            sentiment=sentiment,
            priority=priority,
            created_by=gbl_system_user_id,
            created_date=current_date_time,
            modified_date=current_date_time,
            modified_by=gbl_system_user_id,
            file_path=file_path,
            staff_id=assigned_staff_id  # Assign to selected staff member
        )

        # Save grievance to the database
        db.session.add(grievance)
        db.session.commit()

        grievance_id = grievance.grievance_id
        user_id = student_id
        notification_message = f"Your grievance (ID: {grievance_id}) has been successfully submitted and assigned to a staff member."

        # Send email notification
        if not send_notification(user_id=user_id, grievance_id=grievance_id, message=notification_message, notification_type='email'):
            raise Exception("Failed to send notification")

        return jsonify({'status': 'success', 'message': 'Grievance submitted successfully', 'sentiment': sentiment, 'priority': priority, 'status': status}), 200

    except Exception as e:
        print(f"{str(e)}")
        return jsonify({'status': 'error', 'message': str(e)}), 500
