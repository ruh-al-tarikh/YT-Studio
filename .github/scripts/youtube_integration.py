import os
import json
from google.oauth2 import service_account
from googleapiclient.discovery import build

def setup_youtube_client():
    try:
        # Get the JSON from secret
        creds_json = os.environ.get('GOOGLE_CREDENTIALS')
        
        if not creds_json:
            return None, "❌ GOOGLE_CREDENTIALS secret not found"
        
        # Parse JSON
        creds_info = json.loads(creds_json)
        
        # Create credentials
        credentials = service_account.Credentials.from_service_account_info(
            creds_info,
            scopes=['https://www.googleapis.com/auth/youtube.readonly']
        )
        
        # Build service
        youtube = build('youtube', 'v3', credentials=credentials)
        
        return youtube, "✅ YouTube API ready"
        
    except json.JSONDecodeError as e:
        return None, f"❌ JSON parse error: {e}"
    except Exception as e:
        return None, f"❌ Setup error: {e}"
