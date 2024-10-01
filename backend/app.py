from flask import Flask, jsonify, g  
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from flask import send_from_directory
import os


db = SQLAlchemy()
bcrypt = Bcrypt()
jwt = JWTManager()


def create_app():
    app = Flask(__name__)
    app.config.from_object('config.Config')
    
    db.init_app(app)
    bcrypt.init_app(app)
    jwt.init_app(app)
    #CORS(app)
    print( app.config.get('FRONTEND_URL'))
    #CORS(app, resources={r"/*": {"origins":  app.config.get('FRONTEND_URL')}},
    #supports_credentials=True, 
    #methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    #allow_headers=["Authorization", "Content-Type"])

    
    @app.route('/api/test', methods=['GET'])
    def test():
        return jsonify({"status": "success", "message": "The server is running correctly!"})
    
    @app.route('/uploads/<path:filename>')
    def uploaded_file(filename):
        return send_from_directory(os.path.join(app.root_path, './uploads'), filename)


    with app.app_context():
        # Import the blueprint inside the function
        from routes.auth import auth_bp
        app.register_blueprint(auth_bp, url_prefix='/api/auth')
    
    with app.app_context():
        # Import the blueprint inside the function
        from routes.faq import faq_bp
        app.register_blueprint(faq_bp, url_prefix='/api/faq')
    
    with app.app_context():
        # Import the blueprint inside the function
        from routes.submit_grievance import submit_grievance_bp
        app.register_blueprint(submit_grievance_bp, url_prefix='/api/grievance')

    with app.app_context():
        # Import the blueprint inside the function
        from routes.get_grievances import get_grievances_bp
        app.register_blueprint(get_grievances_bp, url_prefix='/api/grievances')
    print("test")
    with app.app_context():
        # Import the blueprint inside the function
        from routes.get_grievances import get_grievanceupdates_bp
        app.register_blueprint(get_grievanceupdates_bp, url_prefix='/api/grievanceupdates')

    @app.after_request
    def after_request(response):
      response.headers.add('Access-Control-Allow-Origin', app.config['FRONTEND_URL'])
      response.headers.add('Access-Control-Allow-Headers', 'Authorization, Content-Type')
      response.headers.add('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
      return response
    return app


if __name__ == "__main__":
    app = create_app()
    app.run(host='0.0.0.0', port=5000, debug=True)


