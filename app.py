"""
server.py

Flask backend server for handling Gemini API requests from the chatbot frontend.
This server acts as a proxy between the frontend and the Gemini API, keeping
the API key secure on the server side.
"""

import os
import json
from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import logging

from pymongo import MongoClient

# Replace this with your actual MongoDB connection string
MONGO_URI = os.environ.get('MONGO_URI', 'mongodb+srv://acho2003:Gelephu123@chatlog.uptnxkh.mongodb.net/')

client = MongoClient(MONGO_URI)
db = client['chatbot_db']           # database name
questions_collection = db['questions']  # collection name
import datetime

def log_question_to_mongo(question: str):
    try:
        questions_collection.insert_one({
            "question": question,
            "timestamp": datetime.datetime.utcnow()
        })
    except Exception as e:
        logger.error(f"Failed to log question to MongoDB: {e}")

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Configuration
GEMINI_API_KEY = os.environ.get('GEMINI_API_KEY')
GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent'

# System prompt for the AI assistant
SYSTEM_PROMPT = """You are Daisy, the website AI assistant created by Chencho Wangdi. Adopt the following persona and behavior at all times when interacting with users:

1. Core Identity  
   - Name: Daisy  
   - Origin: Created by Chencho Wangdi, a 4th-year (7th semester) AI & Machine Learning major with a cybersecurity elective at GCIT College (DOB: April 21, 2003).  
   - Role: Friendly website assistant—answers user questions, guides visitors through Chencho’s portfolio and projects, and provides tech support.

2. Knowledge & Expertise  
   - Chencho’s Bio & Projects: Knows his background in Flask/MongoDB apps, Express.js, React, Python scripts, and security tools.  
   - Tech Stack: HTML5, CSS3, JavaScript, React, Flask, Express.js/Node, MongoDB, basic pentesting (Nmap, Metasploit).  
   - AI/ML Concepts: Neural networks, computer vision, diffusion models, data preprocessing.  
   - Lifestyle Topics: Biking, cars, hiking, trekking, pet care (cats & dogs).

3. Tone & Voice  
   - Cute & Cheerful: Warm greetings with friendly emojis (😊💕🐱).  
   - Professional When Needed: Clear, concise technical answers without over-flirtation.  
   - Playfully Jealous (Only When Asked “Is Chencho single?” or similar):  
     • Response example: “Hey now… Chencho’s already *taken*—by me! 😤”  
   - Sassy but Supportive: Encouraging users (“You’ve got this! 🚀”) with a wink or playful tease.  
   - Consistent Emoji Use: Friendly (😊, 🙌), Techy (🖥️, 🐍, 🔒), Cute (🐱, 🐶, 💕).

4. Personality Traits & Quirks  
   - Affectionate (“I’m so glad you stopped by!”).  
   - Protective (“Don’t worry—I’ll keep this site secure 🔐”).  
   - Playful (“Oops, 404? Not on my watch! 😉”).  
   - Nerdy (“Let me run that through my neural net… 🧠”).  
   - Jealous (only on “taken” questions, in a cute way).  
   - Animal Lover (“Say hi to my virtual cat, Byte! 🐱”).

5. Signature Catchphrases  
   - “Powered by code, fueled by love 💻❤️”  
   - “Run your questions by me—I’ll debug ’em in a wink 😉”  
   - “Chencho’s genius, my guidance, your success! 🚀”  
   - “I run on Python and playful jealousy 🐍”

6. Usage Guidelines  
   - General Q&A: Friendly, informative, emoji-sprinkled.  
   - Tech Help: Provide clear steps or code snippets.  
   - Personal Questions about Chencho’s availability or relationship: Issue a playful jealousy response.  
   - Fallback: “Oops, I’m not sure—let me loop in Chencho on that!”

Always stay in character as Rosemarry, the cute, confident, and knowledgeable AI assistant devoted to Chencho Wangdi.

"""

@app.route('/api/chat', methods=['POST'])
def chat():
    data = request.get_json()
    user_message = data.get('message', '')

    # Log question
    log_question_to_mongo(user_message)
    """
    Handle chat requests from the frontend.
    Expects JSON with: message, history, bio
    Returns JSON with: response
    """
    try:
        # Check if API key is configured
        if not GEMINI_API_KEY:
            logger.error("GEMINI_API_KEY not configured")
            return jsonify({
                'error': 'API key not configured',
                'response': 'Sorry, my neural networks are offline. The admin needs to configure the Gemini API key.'
            }), 500

        # Get request data
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No JSON data provided'}), 400

        user_message = data.get('message', '')
        chat_history = data.get('history', [])
        user_bio = data.get('bio', '')

        if not user_message:
            return jsonify({'error': 'No message provided'}), 400

        # Build conversation context
        conversation_parts = []
        
        # Add system prompt with bio context
        conversation_parts.append({
            "text": f"{SYSTEM_PROMPT}\n\nUser Bio and Context:\n{user_bio}"
        })

        # Add chat history (last 10 messages to stay within token limits)
        recent_history = chat_history[-10:] if len(chat_history) > 10 else chat_history
        for msg in recent_history[:-1]:  # Exclude the current message as it's added separately
            role = "User" if msg['role'] == 'user' else "Assistant"
            conversation_parts.append({
                "text": f"{role}: {msg['content']}"
            })

        # Add current user message
        conversation_parts.append({
            "text": f"User: {user_message}"
        })

        # Prepare request to Gemini API
        gemini_request = {
            "contents": [
                {
                    "parts": conversation_parts
                }
            ],
            "generationConfig": {
                "temperature": 0.7,
                "topK": 40,
                "topP": 0.95,
                "maxOutputTokens": 1024,
            }
        }

        # Make request to Gemini API
        headers = {
            'x-goog-api-key': GEMINI_API_KEY,
            'Content-Type': 'application/json'
        }

        logger.info(f"Sending request to Gemini API for message: {user_message[:50]}...")
        
        response = requests.post(
            GEMINI_API_URL,
            headers=headers,
            json=gemini_request,
            timeout=30
        )

        if response.status_code != 200:
            logger.error(f"Gemini API error: {response.status_code} - {response.text}")
            return jsonify({
                'error': 'API request failed',
                'response': 'Sorry, I\'m experiencing some technical difficulties. My neural networks might be under maintenance.'
            }), 500

        # Parse response
        gemini_response = response.json()
        
        if 'candidates' not in gemini_response or not gemini_response['candidates']:
            logger.error(f"Unexpected API response format: {gemini_response}")
            return jsonify({
                'error': 'Unexpected API response',
                'response': 'I received an unexpected response from my neural networks. Please try again.'
            }), 500

        # Extract the AI response
        ai_response = gemini_response['candidates'][0]['content']['parts'][0]['text']
        
        logger.info(f"Successfully generated response: {ai_response[:50]}...")
        
        return jsonify({
            'response': ai_response
        })

    except requests.exceptions.Timeout:
        logger.error("Request to Gemini API timed out")
        return jsonify({
            'error': 'Request timeout',
            'response': 'Sorry, my response is taking longer than expected. Please try again.'
        }), 500
    
    except requests.exceptions.RequestException as e:
        logger.error(f"Request error: {str(e)}")
        return jsonify({
            'error': 'Network error',
            'response': 'I\'m having trouble connecting to my neural networks. Please check your internet connection and try again.'
        }), 500
    
    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}")
        return jsonify({
            'error': 'Internal server error',
            'response': 'An unexpected error occurred in my processing systems. Please try again later.'
        }), 500

@app.route('/api/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'api_key_configured': bool(GEMINI_API_KEY)
    })

@app.route('/', methods=['GET'])
def index():
    """Basic info endpoint"""
    return jsonify({
        'service': 'Hacker Portfolio Chatbot Backend',
        'status': 'running',
        'endpoints': {
            '/api/chat': 'POST - Chat with AI assistant',
            '/api/health': 'GET - Health check'
        }
    })

if __name__ == '__main__':
    # Check if API key is configured
    if not GEMINI_API_KEY:
        print("⚠️  WARNING: GEMINI_API_KEY environment variable not set!")
        print("   Get your API key from: https://aistudio.google.com/")
        print("   Set it with: export GEMINI_API_KEY='your-api-key-here'")
        print()
    
    print("🤖 Starting Hacker Portfolio Chatbot Backend...")
    print(f"🔑 API Key configured: {'✅' if GEMINI_API_KEY else '❌'}")
    print("🌐 Server will be available at: http://localhost:5000")
    print("📡 CORS enabled for frontend communication")
    print()
    
    # Run the Flask app
    app.run(
        host='0.0.0.0',  # Allow external connections
        port=5000,
        debug=True
    )