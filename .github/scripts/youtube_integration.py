#!/usr/bin/env python3
import os
import json
from google.oauth2 import service_account
from googleapiclient.discovery import build

def setup_youtube_client():
    """Initialize YouTube API client using service account JSON"""
    try:
        # Get credentials from GitHub secret
        creds_json = os.environ.get('GOOGLE_CREDENTIALS')
        
        if not creds_json:
            return None, "❌ GOOGLE_CREDENTIALS secret not found"
        
        # Parse JSON and create credentials
        creds_info = json.loads(creds_json)
        credentials = service_account.Credentials.from_service_account_info(
            creds_info,
            scopes=['https://www.googleapis.com/auth/youtube.readonly']
        )
        
        # Build YouTube service
        youtube = build('youtube', 'v3', credentials=credentials)
        return youtube, "✅ Authentication successful"
        
    except json.JSONDecodeError as e:
        return None, f"❌ Invalid JSON in GOOGLE_CREDENTIALS: {e}"
    except Exception as e:
        return None, f"❌ Setup failed: {e}"

def fetch_channel_stats(channel_id):
    """Fetch public channel statistics"""
    try:
        youtube, error = setup_youtube_client()
        if error:
            return error
        
        # Get channel details
        channel = youtube.channels().list(
            part='snippet,statistics',
            id=channel_id
        ).execute()
        
        if not channel['items']:
            return f"❌ Channel not found: {channel_id}"
        
        data = channel['items'][0]
        stats = data['statistics']
        
        return f"""## 📊 YouTube Channel Statistics

**Channel:** {data['snippet']['title']}
**Channel ID:** {channel_id}

### Current Stats:
- 👥 **Subscribers:** {int(stats.get('subscriberCount', 0)):,}
- 👁️ **Total Views:** {int(stats.get('viewCount', 0)):,}
- 🎬 **Videos:** {stats.get('videoCount', 0)}

🔗 https://youtube.com/channel/{channel_id}
"""
    except Exception as e:
        return f"❌ API Error: {e}"

def get_video_stats(video_id):
    """Fetch public video statistics"""
    try:
        youtube, error = setup_youtube_client()
        if error:
            return error
        
        video = youtube.videos().list(
            part='snippet,statistics',
            id=video_id
        ).execute()
        
        if not video['items']:
            return f"❌ Video not found: {video_id}"
        
        data = video['items'][0]
        stats = data['statistics']
        
        return f"""## 📹 Video Statistics

**Title:** {data['snippet']['title']}
**Video ID:** {video_id}

### Metrics:
- 👁️ **Views:** {int(stats.get('viewCount', 0)):,}
- 👍 **Likes:** {int(stats.get('likeCount', 0)):,}
- 💬 **Comments:** {int(stats.get('commentCount', 0)):,}

🔗 https://youtube.com/watch?v={video_id}
"""
    except Exception as e:
        return f"❌ API Error: {e}"

if __name__ == "__main__":
    cmd = os.environ.get('YOUTUBE_COMMAND', 'fetch-analytics')
    channel_id = os.environ.get('YOUTUBE_CHANNEL_ID')
    video_id = os.environ.get('YOUTUBE_VIDEO_ID')
    
    if cmd == 'fetch-analytics' and channel_id:
        result = fetch_channel_stats(channel_id)
    elif cmd == 'get-stats' and video_id:
        result = get_video_stats(video_id)
    else:
        result = f"""❌ **Usage Error**

Command: `{cmd}`

**Available commands:**
- `fetch-analytics CHANNEL_ID` - Get channel statistics
- `get-stats VIDEO_ID` - Get video stats

**Example:**
