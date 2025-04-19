"""
import_faqs_with_embeddings.py

Reads a JSON file of FAQs and imports them into an SQLite database with embeddings and generated keywords.

Usage:
    export OPENAI_API_KEY="your_api_key_here"
    pip install --upgrade openai tqdm python-dotenv
    python import_faqs_with_embeddings.py \
        --json hotel_instructions_translated.json \
        --db faqs.db \
        --embed_model text-embedding-ada-002 \
        --chat_model gpt-3.5-turbo
"""

import os
import json
import time
import argparse
import logging
import sqlite3
from pathlib import Path

from dotenv import load_dotenv
import openai
from tqdm import tqdm

# Load environment variables
load_dotenv()
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")

def embed_query(query: str, model: str, max_retries: int = 5) -> list:
    for attempt in range(max_retries):
        try:
            resp = openai.embeddings.create(input=query, model=model)
            return resp.data[0].embedding
        except Exception as e:
            wait = 2 ** attempt
            logging.warning(f"Embedding error: {e}. Retrying in {wait}s...")
            time.sleep(wait)
    raise RuntimeError("Failed to generate embedding after retries")

def generate_keywords(text: str, model: str, max_retries: int = 5) -> str:
    system_prompt = (
        "You are an assistant that extracts key topics."
        "Given a user question, return 5–7 concise, comma-separated keywords."
    )
    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": text}
    ]
    for attempt in range(max_retries):
        try:
            resp = openai.chat.completions.create(
                model=model,
                messages=messages,
                temperature=0.0,
                max_tokens=50
            )
            return resp.choices[0].message.content.strip()
        except Exception as e:
            wait = 2 ** attempt
            logging.warning(f"Keyword generation error: {e}. Retrying in {wait}s...")
            time.sleep(wait)
    raise RuntimeError("Failed to generate keywords after retries")

def main():
    parser = argparse.ArgumentParser(description="Import FAQs to SQLite with embeddings & keywords")
    parser.add_argument("--json", "-j", required=True, help="Path to input JSON file")
    parser.add_argument("--db", "-d", required=True, help="Path to SQLite DB file")
    parser.add_argument("--embed_model", default="text-embedding-ada-002", help="Embedding model")
    parser.add_argument("--chat_model", default="gpt-3.5-turbo", help="Chat model for keyword generation")
    args = parser.parse_args()

    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        logging.error("Please set OPENAI_API_KEY in environment")
        return
    openai.api_key = api_key

    json_path = Path(args.json)
    if not json_path.exists():
        logging.error(f"JSON file not found: {json_path}")
        return

    with json_path.open("r", encoding="utf-8") as f:
        faqs = json.load(f)

    conn = sqlite3.connect(args.db)
    cursor = conn.cursor()
    insert_sql = """
    INSERT INTO faqs (question, keywords, answer, embedding)
    VALUES (?, ?, ?, ?)
    """

    for entry in tqdm(faqs, desc="Importing FAQs"):
        question = entry.get("input", "").strip()
        answer = entry.get("output", "").strip()
        if not question or not answer:
            logging.warning("Skipping entry with missing question or answer")
            continue

        keywords = generate_keywords(question, args.chat_model)
        embedding_vec = embed_query(question, args.embed_model)
        embedding_json = json.dumps(embedding_vec)

        cursor.execute(insert_sql, (question, keywords, answer, embedding_json))

    conn.commit()
    conn.close()
    logging.info(f"Imported {len(faqs)} FAQs into {args.db}")

if __name__ == "__main__":
    main()
