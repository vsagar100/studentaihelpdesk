from flask import Flask, request, jsonify, current_app, Blueprint
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.exc import SQLAlchemyError
from models import FAQ
import requests
import os

faq_bp = Blueprint('faq', __name__)


api_key = current_app.config['OPENAI_API_KEY']
api_url = current_app.config['OPENAI_API_URL']
gpt_model = current_app.config['GPT_MODEL']

# Function to retrieve FAQs from the database
def load_faqs():
    faqs = FAQ.query.all()
    return [{"question": faq.question, "answer": faq.answer} for faq in faqs]

# Function to formulate the prompt for ChatGPT using FAQs
def formulate_prompt(query):
    faqs = load_faqs()
    faq_context = "\n".join([f"Q: {faq['question']}\nA: {faq['answer']}" for faq in faqs])
    
    prompt = f"{faq_context}\n\nStudent Query: {query}\nAnswer:"
    return prompt

# ChatGPT API call function
def get_chatgpt_response(query):
    prompt = formulate_prompt(query)
    messages = [
            {"role": "user", "content": query}
        ]
    
    try:
        headers = {
          "Content-Type": "application/json",
          "Authorization": f"Bearer {api_key}"
        }
        data = {
          "model": gpt_model, #"gpt-4o-mini",  # Use the correct model here
          "messages": [{"role": "user", "content": prompt}],
          "temperature": 0.7
        }
        response = requests.post(api_url, headers=headers, json=data)

        # Check if the request was successful
        if response.status_code == 200:
            # Parse the response JSON
            result = response.json()
            print(result['choices'][0]['message']['content'].strip())
        else:
            # Print error if the request failed
            print(f"Error: {response.status_code} - {response.text}")
        return result['choices'][0]['message']['content'].strip()
    except Exception as e:
        return f"Sorry, we couldn't process your query at this time: {str(e)}"

# Route to handle student queries
@faq_bp.route('/query', methods=['POST'])
def handle_query():
    data = request.json
    query = data.get('description')

    if not query:
        return jsonify({'error': 'Description is required'}), 400

    # Send query to ChatGPT with FAQs context
    chatgpt_answer = get_chatgpt_response(query)
    return jsonify({'answer': chatgpt_answer}), 200

if __name__ == "__main__":
    app.run(debug=True)
