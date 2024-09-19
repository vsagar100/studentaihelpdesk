from flask import Blueprint, request, jsonify
from werkzeug.utils import secure_filename
from flask_jwt_extended import jwt_required, get_jwt_identity  # Import JWT methods
import os
from models import db, Grievance, GrievanceUpdates
import uuid
from sqlalchemy import not_
import datetime


get_grievances_bp = Blueprint('get_grievances', __name__)
get_grievanceupdates_bp = Blueprint('get_grievanceupdates', __name__)

@get_grievances_bp.route('/get/all', methods=['GET'])
def get_grievances_all():
    try:
        # Fetch all grievances from the database
        grievances = Grievance.query.all()
        grievances_list = [
            {
                'id': grievance.grievance_id,
                'category': grievance.category,
                'description': grievance.description,
                'status': grievance.status,  # Assuming there's a 'status' column in the table
                'sentiment': grievance.sentiment,
                'priority': grievance.priority,
                'file_path': grievance.file_path,
                'created_by': grievance.created_by,
                'created_date': grievance.created_date.strftime('%Y-%m-%d %H:%M:%S'),
                'modified_by': grievance.modified_by,
                'modified_date': grievance.modified_date.strftime('%Y-%m-%d %H:%M:%S')
            }
            for grievance in grievances
        ]        
        return jsonify(grievances_list), 200
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500
        

@get_grievances_bp.route('/get/all_cur_user', methods=['GET'])
@jwt_required()  # Ensure the user is authenticated
def get_grievances_users():
     try:
        # Get the user identity from the JWT token (contains user_id and other details)
        current_user = get_jwt_identity()
        print(current_user)
        student_id = current_user['user_id']

        # Fetch only grievances created by the logged-in student
        grievances = Grievance.query.filter_by(student_id=current_user['user_id']).all()

        grievances_list = [
            {
                'id': grievance.grievance_id,
                'category': grievance.category,
                'description': grievance.description,
                'status': grievance.status,
                'sentiment': grievance.sentiment,
                'priority': grievance.priority,
                'file_path': grievance.file_path,
                'created_by': grievance.created_by,
                'created_date': grievance.created_date.strftime('%Y-%m-%d %H:%M:%S'),
                'modified_by': grievance.modified_by,
                'modified_date': grievance.modified_date.strftime('%Y-%m-%d %H:%M:%S')
            }
            for grievance in grievances
        ]
        
        return jsonify(grievances_list), 200
     except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500
        
        
@get_grievances_bp.route('/get/grv_staff', methods=['GET'])
@jwt_required()  # Ensure the user is authenticated
def get_grv_staff():
     try:
      # Get the user identity from the JWT token (contains user_id and other details)
      current_user = get_jwt_identity()
      print(current_user)
      user_id = current_user['user_id']
      print(user_id)
      # Fetch only grievances created by the logged-in student
      grievances = Grievance.query.filter(
      Grievance.staff_id == current_user['user_id'],
      not_(Grievance.status.in_(['closed', 'resolved']))
      ).order_by(Grievance.created_date.desc()).all()

      grievances_list = [
          {
              'id': grievance.grievance_id,
              'category': grievance.category,
              'description': grievance.description,
              'status': grievance.status,
              'sentiment': grievance.sentiment,
              'priority': grievance.priority,
              'file_path': grievance.file_path,
              'created_by': grievance.created_by,
              'created_date': grievance.created_date.strftime('%Y-%m-%d %H:%M:%S'),
              'modified_by': grievance.modified_by,
              'modified_date': grievance.modified_date.strftime('%Y-%m-%d %H:%M:%S')
          }
          for grievance in grievances
      ]
      
      return jsonify(grievances_list), 200
     except Exception as e:
      print(str(e))
      return jsonify({'status': 'error', 'message': str(e)}), 500
      
@get_grievanceupdates_bp.route('/get/<int:grievance_id>', methods=['GET'])
@jwt_required()
def get_grievance_updates(grievance_id):
    updates = GrievanceUpdates.query.filter_by(grievance_id=grievance_id).order_by(GrievanceUpdates.update_date.desc()).all()
    updates_list = [
        {
            'update_id': update.update_id,
            'grievance_id': update.grievance_id,
            'user_id': update.user_id,
            'update_text': update.update_text,
            'update_date': update.update_date.strftime('%Y-%m-%d %H:%M:%S')
        }
        for update in updates
    ]
    #print(f"{updates_list}")
    return jsonify(updates_list), 200
    
@get_grievanceupdates_bp.route('/update', methods=['POST'])
@jwt_required()
def update_grievance():
    try:
        # Get form data
        grievance_id = request.form.get('grievance_id')
        print(f"inside update_grievance")
        status = request.form.get('status')
        update_text = request.form.get('update_text')
        current_user = get_jwt_identity()
        # Find the grievance
        grievance = Grievance.query.get(grievance_id)
        if not grievance:
            return jsonify({"status": "error", "message": "Grievance not found"}), 404

        # Update the status in the grievance table
        grievance.status = status
        grievance.modified_date = datetime.utcnow()
        db.session.commit()
        current_time = datetime.datetime.utcnow()
        # Insert the new update into grievance_updates table
        grievance_update = GrievanceUpdate(
            grievance_id=grievance_id,
            user_id=current_user['user_id'],  # Assuming you have current_user from JWT
            update_text=update_text,
            update_date=current_time,
            created_by=current_user['user_id'],  # Track who created the update
            created_date=current_time
        )
        db.session.add(grievance_update)
        db.session.commit()

        return jsonify({"status": "success", "message": "Grievance updated successfully"}), 200

    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"status": "error", "message": str(e)}), 500
