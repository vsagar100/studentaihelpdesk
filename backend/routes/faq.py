from flask import Flask, request, jsonify, current_app, Blueprint
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy import or_
from models import FAQ
import requests
import os
import openai

faq_bp = Blueprint('faq', __name__)


openai.api_key = current_app.config['OPENAI_API_KEY']
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
    data = request.get_json()
    description = data.get('description')

    if not description:
        return jsonify({"error": "No description provided"}), 400

    # Try to find relevant FAQs in the database
    faqs = FAQ.query.filter(or_(FAQ.question.ilike(f"%{description}%"), FAQ.answer.ilike(f"%{description}%"))).all()

    if faqs:
        # If matching FAQs found, return the first match (or combine multiple answers)
        return jsonify({"answer": faqs[0].answer}), 200

    # Fallback to ChatGPT if no FAQs match
    try:
        response = openai.ChatCompletion.create(
            model=gpt_model,  # Adjust this to the model you are using
            messages=[
                {"role": "system", "content": "You are a helpful assistant for students."},
                {"role": "user", "content": description}
            ],
            temperature=0.7
        )
        answer = response['choices'][0]['message']['content']
        return jsonify({"answer": answer}), 200

    except Exception as e:
        print(e)
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True)
