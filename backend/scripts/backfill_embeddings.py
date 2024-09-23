import openai
from models import db, FAQ
from flask import Flask
import json

app = Flask(__name__)
app.config.from_object('config.Config')  # Load your config settings

openai.api_key = app.config['OPENAI_API_KEY']

# Function to create embeddings
def create_faq_embeddings():
    faqs = FAQ.query.all()
    
    for faq in faqs:
        # Create embedding for each FAQ question
        response = openai.Embedding.create(input=faq.question, model="text-embedding-ada-002")
        embedding_vector = response['data'][0]['embedding']
        
        # Set and save the embedding for this FAQ
        faq.set_embedding(embedding_vector)
        db.session.commit()
        print(f"Embedding created for FAQ ID {faq.id}")

# Initialize app context
with app.app_context():
    create_faq_embeddings()
