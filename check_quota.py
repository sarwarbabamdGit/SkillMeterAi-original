import google.generativeai as genai
import os
from dotenv import load_dotenv
import time

load_dotenv('backend/.env')

api_key = os.getenv('GEMINI_API_KEY')
print(f"API Key present: {bool(api_key)}")
if api_key:
    print(f"API Key prefix: {api_key[:4]}...{api_key[-4:]}")

genai.configure(api_key=api_key)

model_name = 'models/gemini-3-flash-preview'
print(f"Testing generation with {model_name}...")

try:
    model = genai.GenerativeModel(model_name)
    response = model.generate_content("Say hello", request_options={"timeout": 30})
    print("SUCCESS: Generation worked!")
    print(f"Response: {response.text}")
except Exception as e:
    print(f"FAILED: {e}")
    if "429" in str(e):
        print("DIAGNOSIS: Quota Exceeded")
    elif "403" in str(e) or "API_KEY_INVALID" in str(e):
        print("DIAGNOSIS: Invalid API Key")
    elif "404" in str(e):
        print("DIAGNOSIS: Model not found (despite listing?)")
