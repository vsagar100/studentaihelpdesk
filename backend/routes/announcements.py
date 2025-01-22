from flask import Blueprint, request, jsonify
from models import db, Announcement
from werkzeug.utils import secure_filename
import os
import datetime

announcements_bp = Blueprint('announcements', __name__)

UPLOAD_FOLDER = os.path.join(os.getcwd(), 'uploads', 'announcements')
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

@announcements_bp.route('/create', methods=['POST'])
def create_announcement():
    title = request.form['title']
    description = request.form['description']
    category = request.form['category']
    is_expired = request.form.get('is_expired') == 'true'
    created_by = 1  # Assuming admin ID for now

    file_path = None
    if 'file' in request.files:
        file = request.files['file']
        filename = secure_filename(file.filename)
        file_path = os.path.join(UPLOAD_FOLDER, filename)
        file.save(file_path)

    announcement = Announcement(
        title=title,
        description=description,
        category=category,
        is_expired=is_expired,
        file_path=filename if file_path else None,
        created_by=created_by,
        created_at=datetime.datetime.now()
    )
    db.session.add(announcement)
    db.session.commit()

    return jsonify({'message': 'Announcement created successfully'}), 201


@announcements_bp.route('/', methods=['GET'])
def get_announcements():
    announcements = Announcement.query.filter_by(is_expired=False).all()
    result = [{
        'id': ann.id,
        'title': ann.title,
        'description': ann.description,
        'file_path': ann.file_path,
        'category': ann.category,
        'is_expired': ann.is_expired
    } for ann in announcements]
    return jsonify(result), 200
