import os
from openai import OpenAI
from flask import Flask, request, jsonify, current_app, Blueprint
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy import or_
from models import FAQ

faq_bp = Blueprint('faq', __name__)
client = OpenAI()
bot_context = []

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
    faq_context = "You are Student AI Helpdesk bot \n If you do not know answer **politely** say you do not know in friendly manner. \n An AI-integrated student grievance system using Raspberry Pi represents a significant advancement in how educational institutions handle student complaints. By leveraging the power of AI for automation and analysis, combined with the affordability and flexibility of the Raspberry Pi, institutions can provide a more efficient, transparent, and responsive grievance handling process. This not only enhances student satisfaction but also helps institutions maintain a supportive and well-managed educational environment." + faq_context
    bot_context.append({'role': 'system', 'content': f"{faq_context}"})
    bot_context.append({'role': 'user', 'content': f"{query}"})
    
    return bot_context

@faq_bp.route('/query', methods=['POST'])
def query_faq():
    data = request.get_json()
    description = data.get('description')
    
    prompt = formulate_prompt(description)
    

    # Fallback to ChatGPT if no FAQs match
    try:
        response = client.chat.completions.create(
            model=gpt_model,  # Adjust this to the model you are using
            messages=prompt,
            temperature=0.7
        )
        print(prompt)
        bot_context.append({'role': 'assistant', 'content': f"{response}"})
        print(response._request_id)
        answer = response.choices[0].message.content
        return jsonify({"answer": answer}), 200

    except Exception as e:
        print(e)
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)