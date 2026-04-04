import os
import requests
import json
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

API_KEY = os.getenv('YOUTUBE_API_KEY')

def search_video(query):
    print(f"Testing query: {query}")
    if not API_KEY:
        print("ERROR: YOUTUBE_API_KEY not found in environment variables.")
        return

    try:
        url = "https://www.googleapis.com/youtube/v3/search"
        params = {
            'part': 'snippet',
            'q': query,
            'type': 'video',
            'maxResults': 1,
            'key': API_KEY
        }
        response = requests.get(url, params=params, timeout=10)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code != 200:
            print(f"Error Response: {response.text}")
            return

        data = response.json()
        print("JSON Parsed.")
        
        if 'items' in data and len(data['items']) > 0:
            item = data['items'][0]
            video_id = item['id']['videoId']
            print(f"Success! Video ID: {video_id}")
        else:
            print("No items found.")
            print(data)

    except Exception as e:
        print(f"Exception: {e}")

if __name__ == "__main__":
    search_video("React Tutorial")
