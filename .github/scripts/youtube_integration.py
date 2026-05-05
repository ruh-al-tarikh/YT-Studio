#!/usr/bin/env python3
import os
import json
import sys
from datetime import datetime, timedelta
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from google.auth.exceptions import GoogleAuthError

def setup_youtube_client():
    """Initialize YouTube API client with better error handling"""
    try:
        # Check if credentials file exists and is valid
        token_path = 'token_youtube.json'
        creds_path = 'credentials.json'
        
        if not os.path.exists(token_path):
            return None, "❌ Token file not found. Please set up YouTube API authentication first."
        
        if not os.path.exists(creds_path):
            return None, "❌ Credentials file not found. Please add GOOGLE_CREDENTIALS secret."
        
        # Try to load credentials
        try:
            with open(token_path, 'r') as f:
                token_data = json.load(f)
            creds = Credentials.from_authorized_user_file(token_path)
        except json.JSONDecodeError:
            return None, "❌ Invalid token file format. Please check YOUTUBE_TOKEN secret."
        except Exception as e:
            return None, f"❌ Error loading credentials: {str(e)}"
        
        # Build the service
        youtube = build('youtube', 'v3', credentials=creds)
        
        # Test the connection
        try:
            youtube.channels().list(part='id', mine=True).execute()
        except Exception as e:
            return None, f"❌ Authentication failed: {str(e)}. Token may be expired."
        
        return youtube, "✅ Authentication successful"
    
    except Exception as e:
        return None, f"❌ Setup failed: {str(e)}"

def fetch_channel_analytics(channel_id):
    """Fetch channel statistics without requiring analytics API"""
    try:
        youtube, error = setup_youtube_client()
        if error:
            return f"❌ {error}"
        
        # Get channel details
        channel = youtube.channels().list(
            part='snippet,statistics',
            id=channel_id
        ).execute()
        
        if not channel['items']:
            return "❌ Channel not found. Please check the channel ID."
        
        channel_data = channel['items'][0]
        stats = channel_data['statistics']
        
        report = f"""## 📊 YouTube Channel Analytics

**Channel:** {channel_data['snippet']['title']}
**Channel ID:** {channel_id}

### Current Statistics:
- 👥 **Subscribers:** {int(stats.get('subscriberCount', 0)):,}
- 👁️ **Total Views:** {int(stats.get('viewCount', 0)):,}
- 🎬 **Total Videos:** {stats.get('videoCount', 0)}
- 📈 **Channel Created:** {channel_data['snippet']['publishedAt'][:10]}

### Channel URL:
🔗 https://youtube.com/channel/{channel_id}

---
*✅ YouTube API V3 integration is working!*
*Note: For detailed analytics (watch time, demographics, etc.), you need to enable YouTube Analytics API and set up OAuth 2.0 properly.*
"""
        return report
        
    except Exception as e:
        return f"❌ YouTube API Error: {str(e)}"

def get_video_stats(video_id):
    """Fetch statistics for a specific video"""
    try:
        youtube, error = setup_youtube_client()
        if error:
            return f"❌ {error}"
        
        # Get video details
        video = youtube.videos().list(
            part='snippet,statistics',
            id=video_id
        ).execute()
        
        if not video['items']:
            return f"❌ Video not found. Invalid video ID: {video_id}"
        
        video_data = video['items'][0]
        stats = video_data['statistics']
        
        report = f"""## 📹 YouTube Video Statistics

**Title:** {video_data['snippet']['title']}
**Video ID:** {video_id}

### Performance Metrics:
- 👁️ **Views:** {int(stats.get('viewCount', 0)):,}
- 👍 **Likes:** {int(stats.get('likeCount', 0)):,}
- 💬 **Comments:** {int(stats.get('commentCount', 0)):,}

### Video Details:
- **Published:** {video_data['snippet']['publishedAt'][:10]}
- **Channel:** {video_data['snippet']['channelTitle']}

### Video URL:
🔗 https://youtube.com/watch?v={video_id}
"""
        return report
        
    except Exception as e:
        return f"❌ Error fetching video stats: {str(e)}"

if __name__ == "__main__":
    cmd = os.environ.get('YOUTUBE_COMMAND', 'fetch-analytics')
    channel_id = os.environ.get('YOUTUBE_CHANNEL_ID')
    video_id = os.environ.get('YOUTUBE_VIDEO_ID')
    
    print(f"Debug: Command={cmd}, Channel={channel_id}, Video={video_id}")
    
    if cmd == 'fetch-analytics' and channel_id:
        result = fetch_channel_analytics(channel_id)
    elif cmd == 'get-stats' and video_id:
        result = get_video_stats(video_id)
    elif cmd == 'fetch-analytics' and not channel_id:
        result = """❌ **Channel ID Required**

To fetch YouTube analytics, you need to provide a channel ID.

**Usage:**
- In comment: `/youtube fetch-analytics CHANNEL_ID`
- Or add `YOUTUBE_CHANNEL_ID` to GitHub Secrets

**Example:** `/youtube fetch-analytics UCrjJP_SHUeCmqpTSHJCXkdA`
"""
    else:
        result = f"""❌ **Unknown Command**

Command: `{cmd}`

**Available YouTube commands:**
- `/youtube fetch-analytics CHANNEL_ID` - Get channel statistics
- `/youtube get-stats VIDEO_ID` - Get video performance

**Example:**
