import os

from google import genai
from dotenv import load_dotenv

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

client = genai.Client()

def get_gemini_response(user_message: str):
    prompt = f"""
        You are a helpful Support Agent for an Energy Management Device Dashboard.
        Be concise, professional, and friendly. Answer in max 20 words.

        User Query: {user_message}
        """
    response = client.models.generate_content(
        model='gemini-2.0-flash',
        contents=prompt
    )
    return response.text

