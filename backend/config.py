import os

class Config:
    basedir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
    SQLALCHEMY_DATABASE_URI = 'sqlite:///' + os.path.join(basedir, 'DB', 'grievance_system.db')
    FRONTEND_URL = "http://vm-ae-mvn-ubn22.australiaeast.cloudapp.azure.com:3000"
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SYSTEM_USER_ID = 'grievance_system'
    COLLEGE_DOMAIN = "met.edu"
    VALID_COLLEGES = ['MET', 'Bhujbal Knowledge City']
    OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
    OPENAI_API_URL="https://api.openai.com/v1/chat/completions"
    GPT_MODEL="gpt-4o-mini"
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'your_jwt_secret_key')  # Use environment variable in production
