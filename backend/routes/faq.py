import os
from openai import OpenAI
from flask import Flask, request, jsonify, current_app, Blueprint
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy import or_
from models import FAQ

faq_bp = Blueprint('faq', __name__)
client = OpenAI()

# Load environment variables, set up OpenAI API key
client.api_key = current_app.config['OPENAI_API_KEY']
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

@faq_bp.route('/query', methods=['POST'])
def query_faq():
    data = request.get_json()
    description = data.get('description')
    
    prompt = formulate_prompt(description)
    

    # Fallback to ChatGPT if no FAQs match
    try:
        response = client.chat.completions.create(
            model=gpt_model,  # Adjust this to the model you are using
            messages=[
                {"role": "system", "content": "You are a helpful assistant for students."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7
        )
        print(prompt)
        print(response._request_id)
        answer = response.choices[0].message.content
        return jsonify({"answer": answer}), 200

    except Exception as e:
        print(e)
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
