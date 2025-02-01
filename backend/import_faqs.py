import os
import json
from sqlalchemy.exc import SQLAlchemyError
from models import db, FAQ
from openai import OpenAI
from app import create_app, db  # Import create_app and db from your app


client = OpenAI()
# Create the Flask app instance
app = create_app()
json_file_path = "faqs.json" 

def import_faqs_from_json():
  try:
    # Load the JSON data
    with open(json_file_path, 'r') as file:
        grievances = json.load(file)
    print(f"Loaded grievances data from {json_file_path}")
    return grievances
  except Exception as e:
      print(f"Error loading JSON file: {e}")
  

def process_grievances_and_insert():
    # Load the grievances data from a document (adjust path and file type as needed)
    grievances = import_faqs_from_json()

    for category, faqs in grievances.items():
        for faq in faqs:
            question = faq.get("question")
            answer = faq.get("answer")

            if not question or not answer:
                print(f"Skipping incomplete FAQ: {faq}")
                continue

            # Generate keywords (limit to 3-4, derived from category and question)
            keywords = category

            try:
                # Generate embedding using embed_query
                response = client.embeddings.create(input=question+ "\n" + keywords, model="text-embedding-ada-002")
                embedding_vector = response.data[0].embedding
                #embedding_vector = embed_query(question)

                # Create FAQ instance
                new_faq = FAQ(
                    question=question,
                    keywords=keywords,
                    answer=answer,
                    embedding=json.dumps(embedding_vector)  # Convert to JSON string for storage
                )

                # Add to database session
                db.session.add(new_faq)
                print(f"Added FAQ: {question}")

            except Exception as e:
                print(f"Error processing FAQ: {faq}. Error: {e}")

    try:
        # Commit the session to save changes to the database
        db.session.commit()
        print("All FAQs have been added successfully!")

    except SQLAlchemyError as e:
        print(f"Database error: {e}")
        db.session.rollback()

if __name__ == "__main__":
    # Initialize database (ensure configuration is set up properly)
   with app.app_context():
    process_grievances_and_insert()