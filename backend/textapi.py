
import os
import google.generativeai as genai
from dotenv import load_dotenv

# Load env variables
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), '.env'))

api_key = os.getenv("GEMINI_API_KEY")
if not api_key:
    print("ERROR: GEMINI_API_KEY not found.")
    exit(1)

genai.configure(api_key=api_key)

def test_generate_json():
    print("Listing available models...")
    for m in genai.list_models():
        if 'generateContent' in m.supported_generation_methods:
            print(f"- {m.name}")

    try:
        # Match services.py model
        target_model = 'gemini-3-flash-preview'
        print(f"\nAttempting to use model: {target_model}")
        model = genai.GenerativeModel(target_model) 
        
        topic = "React Hooks"
        skill_level = "Beginner"
        
        prompt = f"""
        You are an expert curriculum designer. Create a comprehensive video-based learning roadmap for "{topic}" suitable for a "{skill_level}" learner.
        
        Return the response in strictly valid JSON format with this exact structure:
        {{
            "course": {{
                "title": "Course Title",
                "description": "Brief course description",
                "difficulty": "{skill_level}",
                "estimated_hours": 10,
                "tags": ["{topic}", "video learning"]
            }},
            "chapters": [
                {{
                    "title": "Chapter Title",
                    "concepts": [
                        {{
                            "title": "Concept Title",
                            "description": "Concept description",
                            "video_url": "https://www.youtube.com/watch?v=...",
                            "duration_minutes": 15
                        }}
                    ]
                }}
            ]
        }}
        """
        
        print(f"Sending request to Gemini ({target_model})...")
        response = model.generate_content(prompt, generation_config={"response_mime_type": "application/json"})
        print("\nResponse Received:")
        print(response.text)
        
        import json
        data = json.loads(response.text)
        print("\nJSON Parsed Successfully!")
        print(data['course']['title'])
        return data
        
    except Exception as e:
        print(f"\nError: {e}")
        if 'response' in locals():
             print(f"Raw response was: {response.text}")

if __name__ == "__main__":
    test_generate_json()
