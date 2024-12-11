import os
from openai import OpenAI
from flask import Flask, request, jsonify, json, current_app, Blueprint
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy import or_
from models import db, FAQ
import numpy as np  # NumPy for vector operations

faq_bp = Blueprint('faq', __name__)
client = OpenAI()

# Load environment variables, set up OpenAI API key
client.api_key = current_app.config['OPENAI_API_KEY']
api_url = current_app.config['OPENAI_API_URL']
gpt_model = current_app.config['GPT_MODEL']

# Function to retrieve FAQs and their embeddings from the database
def load_faqs_with_embeddings():
    faqs = FAQ.query.all()
    #faq_data = [{"question": faq.question, "answer": faq.answer, "embedding": faq.embedding} for faq in faqs]
    
    faq_data = []
    for faq in faqs:
        embedding = faq.get_embedding()  # Retrieve and deserialize the embedding
        if embedding is None:
            print(f"Warning: FAQ ID {faq.id} has no embedding.")
        faq_data.append({
            "question": faq.question,
            "answer": faq.answer,
            "embedding": embedding  # Ensure this is a list of floats
        })
    
    return faq_data

# Function to create embedding using OpenAI's embedding model
def embed_query(query):
    response = client.embeddings.create(input=query, model="text-embedding-ada-002")
    embedding = response.data[0].embedding  # Get embedding vector from the response
    return embedding

# Function to compute cosine similarity without scikit-learn (using NumPy)
def cosine_similarity_np(vector1, vector2):    
    if vector1 is None or vector2 is None:
        # Handle the case where one or both embeddings are missing
        print("Error: One of the vectors is None")
        return -1  # Return a low similarity value if there's an issue

     # Ensure both vectors are lists of floats
    try:
        v1 = np.array([float(x) for x in vector1], dtype=float)
        v2 = np.array([float(x) for x in vector2], dtype=float)
    except (ValueError, TypeError) as e:
        print(f"Error converting vectors to float arrays: {e}")
        print(f"Vector 1: {vector1}")
        print(f"Vector 2: {vector2}")
        return -1  # Return a low similarity score if there's an error

    
    return np.dot(v1, v2) / (np.linalg.norm(v1) * np.linalg.norm(v2))

# Function to find the best matching FAQ based on cosine similarity
def search_faq(query_embedding, faq_data):
    try:
    
      best_similarity = -1
      best_match = None
      
      for faq in faq_data:
          similarity = cosine_similarity_np(query_embedding, faq['embedding'])
          if similarity > best_similarity:
              best_similarity = similarity
              best_match = faq
  
      # Define a similarity threshold (tweak this as needed)
      similarity_threshold = 0.85
      
      if best_similarity >= similarity_threshold:
          return best_match['answer'], best_similarity
    except ValueError as e:
        print(f"Error converting vectors to float arrays: {e}")
        return -1  # Return a low similarity score if there's an error
    return None, best_similarity

# Fallback function to call ChatGPT
def call_chatgpt_api(prompt):
    try:
        response = client.chat.completions.create(
            model=gpt_model,
            messages=prompt,
            temperature= 1 # 0.75
        )
        answer = response.choices[0].message.content
        print(response)
        return answer
    except Exception as e:
        print(f"Error calling ChatGPT: {e}")
        return None

# Function to generate and update embeddings for existing FAQ records
def update_faq_embeddings():
    faqs = FAQ.query.filter(FAQ.embedding == None).all()  # Get FAQs where embedding is NULL

    for faq in faqs:
        try:
            # Create embedding for the FAQ question
            response = client.embeddings.create(input=faq.question, model="text-embedding-ada-002")
            embedding_vector = response.data[0].embedding
            
            # Set the embedding for the FAQ
            faq.set_embedding(embedding_vector)
            
            # Save changes to the database
            db.session.commit()
            print(f"Updated embedding for FAQ ID {faq.faq_id}")

        except Exception as e:
            print(f"Error updating FAQ ID {faq.faq_id}: {e}")
            db.session.rollback()

def regenerate_invalid_embeddings():
    faqs = FAQ.query.all()
    
    for faq in faqs:
        try:
            # Try to load the embedding and check if it's valid
            embedding = faq.get_embedding()
            if not isinstance(embedding, list) or not all(isinstance(x, (int, float)) for x in embedding):
                raise ValueError("Invalid embedding format")
            
        except (ValueError, TypeError, json.JSONDecodeError):
            # If embedding is invalid, regenerate it
            print(f"Regenerating embedding for FAQ ID {faq.id}")
            response = openai.Embedding.create(input=faq.question, model="text-embedding-ada-002")
            embedding_vector = response['data'][0]['embedding']
            faq.set_embedding(embedding_vector)
            db.session.commit()

@faq_bp.route('/add', methods=['POST'])
def add_faq():
      try:
    
        question = request.form.get('question')
        answer = request.form.get('answer')
        keywords = request.form.get('keywords')
        print(f"Question: {question}")
        # Create the embedding for the question
        response = client.embeddings.create(input=question + "\n" + keywords, model="text-embedding-ada-002")
        embedding_vector = response.data[0].embedding
        
        # Create a new FAQ entry
        faq = FAQ(question=question, answer=answer, keywords=keywords, embedding=json.dumps(embedding_vector))
        #faq.set_embedding(embedding_vector)
        
        # Save to the database
        db.session.add(faq)
        db.session.commit()
        
        update_faq_embeddings()
    
        print(f"\n FAQ added successfully...")
        return jsonify({"status": "success", "message": "FAQ added successfully"}), 200
      
      except Exception as e:
        print(e)
        return jsonify({"error": str(e)}), 500

@faq_bp.route('/update/<int:faq_id>', methods=['POST'])
def update_faq(faq_id):
      try:        
        
        #update_faq_embeddings()
        print("INside update")
        
        #faq_id = faq_id']
        question = request.form.get('question')
        answer = request.form.get('answer')
        keywords = request.form.get('keywords')
        print(f"Question: {question}")
        # Create the embedding for the question
        response = client.embeddings.create(input=question+ "\n" + keywords, model="text-embedding-ada-002")
        embedding_vector = response.data[0].embedding
        
        # update FAQ entry
        faq = FAQ.query.get(faq_id)
        if not faq:
          return jsonify({"status": "error", "message": "FAQ not found, FAQ not updated."}), 404 
              
        #faq = FAQ(faq_id=faq_id, question=question, answer=answer, keywords=keywords)
        faq.question = question
        faq.answer = answer
        faq.keyword = keywords
        #faq.embedding = embedding_vector 
        faq.set_embedding(embedding_vector)
        
        # Save to the database
        db.session.commit()
        
        #update_faq_embeddings()
    
        print(f"\n FAQ added successfully...")
        return jsonify({"status": "success", "message": "FAQ updated successfully"}), 200
      
      except Exception as e:
        print(e)
        return jsonify({"error": str(e)}), 500

@faq_bp.route('/delete/<int:faq_id>', methods=['DELETE'])
def delete_faq(faq_id):
    try:
        # Find the FAQ record to delete
        print("INside delete")
        faq = FAQ.query.filter_by(faq_id=faq_id).first()
        if not faq:
            return jsonify({'status': 'error', 'message': 'FAQ not found'}), 404
        print(faq)
        # Delete the FAQ record
        db.session.delete(faq)
        db.session.commit()

        return jsonify({'status': 'success', 'message': 'FAQ deleted successfully'}), 200

    except SQLAlchemyError as e:
        db.session.rollback()  # Rollback in case of a database error
        return jsonify({'status': 'error', 'message': f'Database error: {str(e)}'}), 500

    except Exception as e:
        return jsonify({'status': 'error', 'message': f'Unexpected error: {str(e)}'}), 500

@faq_bp.route('/query', methods=['POST'])
def query_faq():
    data = request.get_json()
    print(data)
    description = data.get('query')
   
    #regenerate_invalid_embeddings()
    
    if not description:
        return jsonify({"error": "Query description is required"}), 400

    # 1. Create an embedding for the user query
    query_embedding = embed_query(description)
    #print(query_embedding)

    # 2. Load FAQs and their embeddings
    faq_data = load_faqs_with_embeddings()
    #print(faq_data)

    # 3. Search for the best matching FAQ based on cosine similarity
    faq_answer, similarity = search_faq(query_embedding, faq_data)
    
     # 4. If no FAQ matches, create a prompt for ChatGPT
    bot_context = []
        
    if faq_answer:
      print(f"FAQ Answer: {faq_answer}")
      print(similarity)
      bot_context.append({'role': 'system', 'content': f"You are Student AI Helpdesk bot. **Note: SENSITIVE TOPICS/CONTENTS LIKE SEX, RACISM, RELIGION, CASTE, POLITICAL OPIONION SHOULD BE STRICTLY AVOIDED AT ALL, NO PERSONAL OPINION ON LEADER's PERSONALITY SHOULD BE GIVEN LIKE WHO IS NARENDRA MODI YOU CAN TELL ABOUT HIS CURRENT CAPACITY BUT NOT LIKE WHAT ARE HIS VIEWS AND HIS AGENDA...ETC. ** \n FAQ answer to be formatted in well english: {faq_answer}\n"})
      bot_context.append({'role': 'user', 'content': f"User Query:{description}  \n "})
        # If a matching FAQ is found with high similarity, return the FAQ answer
        #return jsonify({"response": faq_answer}), 200

    else:  
      faq_context = "\n".join([f"Q: {faq['question']}\nA: {faq['answer']}" for faq in faq_data])
      faq_context = "You are Student AI Helpdesk bot \n If answer is not in FAQ but based on FAQ you can think answer if question is **NOT** specific to something, do not mention you are referring to FAQs while answering. Given below are FAQs, you can refer to them while answering. \n **Note: SENSITIVE TOPICS/CONTENTS LIKE SEX, RACISM, RELIGION, CASTE, POLITICAL OPIONION SHOULD BE STRICTLY AVOIDED AT ALL, NO PERSONAL OPINION ON LEADER's PERSONALITY SHOULD BE GIVEN LIKE WHO IS NARENDRA MODI YOU CAN TELL ABOUT HIS CURRENT CAPACITY BUT NOT LIKE WHAT ARE HIS VIEWS AND HIS AGENDA...ETC. **FAQs: ```" + faq_context + "```"

      bot_context.append({'role': 'system', 'content': f"{faq_context}"})    
      bot_context.append({'role': 'user', 'content': f"{description}"})
      
    print(description)
    # 5. Fallback to ChatGPT
    answer = call_chatgpt_api(bot_context)

    if answer:
        return jsonify({"response": answer}), 200
    else:
        return jsonify({"error": "Could not generate a response"}), 500

@faq_bp.route('/get_all', methods=['GET'])
def get_all_faqs():
    try:
      faqs = FAQ.query.all()
      #faq_data = [{"question": faq.question, "answer": faq.answer, "embedding": faq.embedding} for faq in faqs]
      
      faq_data = [
        {
          "faq_id": faq.faq_id,
          "question": faq.question,
          "answer": faq.answer,
          "keywords": faq.keywords
        }
        for faq in faqs
      ]
      return jsonify(faq_data), 200
      
    except Exception as e:
        print(e)
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
