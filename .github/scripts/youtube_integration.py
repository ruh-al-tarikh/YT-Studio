#!/usr/bin/env python3
"""
YouTube API V3 Integration for OpenCode Workflow
Handles analytics fetching, video uploads, and statistics retrieval
"""

import os
import json
import sys
from datetime import datetime, timedelta
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError

def setup_youtube_client():
    """Initialize YouTube API client with OAuth credentials"""
    try:
        # Load credentials from GitHub secrets
        creds = Credentials.from_authorized_user_file('token_youtube.json')
        youtube = build('youtube', 'v3', credentials=creds)
        analytics = build('youtubeAnalytics', 'v2', credentials=creds)
        return youtube, analytics
    except Exception as e:
        print(f"❌ Failed to setup YouTube client: {e}")
        return None, None

def fetch_channel_analytics(youtube, analytics, channel_id):
    """Fetch channel analytics data"""
    try:
        # Get channel details
        channel_response = youtube.channels().list(
            part='snippet,statistics',
            id=channel_id
        ).execute()
        
        if not channel_response['items']:
            return "❌ Channel not found"
        
        channel = channel_response['items'][0]
        stats = channel['statistics']
        
        # Get analytics for last 30 days
        end_date = datetime.now().strftime('%Y-%m-%d')
        start_date = (datetime.now() - timedelta(days=30)).strftime('%Y-%m-%d')
        
        analytics_response = analytics.reports().query(
            ids=f'channel=={channel_id}',
            startDate=start_date,
            endDate=end_date,
            metrics='views,likes,comments,shares,estimatedMinutesWatched',
            dimensions='day',
            sort='day'
        ).execute()
        
        # Generate markdown report
        report = f"""## 📊 YouTube Analytics Report

### Channel: {channel['snippet']['title']}

**Current Statistics:**
- 📹 Subscribers: {int(stats['subscriberCount']):,}
- 👁️ Views: {int(stats['viewCount']):,}
- 🎬 Videos: {stats['videoCount']}

**Last 30 Days Performance:**
"""
        
        if 'rows' in analytics_response:
            total_views = sum(row[1] for row in analytics_response['rows'])
            total_likes = sum(row[2] for row in analytics_response['rows'])
            report += f"""
- 📺 Total Views: {total_views:,}
- 👍 Total Likes: {total_likes:,}
- 💬 Est. Comments: {sum(row[3] for row in analytics_response['rows']):,}
- 📤 Shares: {sum(row[4] for row in analytics_response['rows']):,}
- ⏱️ Watch Time: {sum(row[5] for row in analytics_response['rows']):,.0f} minutes
"""
        
        return report
        
    except HttpError as e:
        return f"❌ API Error: {e}"

def upload_video(youtube, video_path, metadata):
    """Upload video to YouTube"""
    try:
        body = {
            'snippet': {
                'title': metadata.get('title', 'Uploaded via OpenCode'),
                'description': metadata.get('description', ''),
                'tags': metadata.get('tags', []),
                'categoryId': metadata.get('category_id', '22')
            },
            'status': {
                'privacyStatus': metadata.get('privacy_status', 'private')
            }
        }
        
        request = youtube.videos().insert(
            part=','.join(body.keys()),
            body=body,
            media_body=video_path
        )
        response = request.execute()
        
        return f"✅ Video uploaded successfully!\n📹 Video ID: {response['id']}\n🔗 URL: https://youtu.be/{response['id']}"
    
    except HttpError as e:
        return f"❌ Upload failed: {e}"

def get_video_stats(youtube, video_id):
    """Fetch statistics for a specific video"""
    try:
        response = youtube.videos().list(
            part='snippet,statistics',
            id=video_id
        ).execute()
        
        if not response['items']:
            return "❌ Video not found"
        
        video = response['items'][0]
        stats = video['statistics']
        
        report = f"""## 📹 Video Statistics

**Title:** {video['snippet']['title']}

**Performance Metrics:**
- 👁️ Views: {int(stats.get('viewCount', 0)):,}
- 👍 Likes: {int(stats.get('likeCount', 0)):,}
- 💬 Comments: {int(stats.get('commentCount', 0)):,}
- 📤 Shares: {int(stats.get('shareCount', 0)):,}
"""
        return report
    
    except HttpError as e:
        return f"❌ API Error: {e}"

def main():
    command = os.environ.get('YOUTUBE_API_COMMAND', 'fetch-analytics')
    channel_id = os.environ.get('YOUTUBE_CHANNEL_ID')
    video_id = os.environ.get('YOUTUBE_VIDEO_ID')
    
    youtube, analytics = setup_youtube_client()
    
    if not youtube:
        sys.exit(1)
    
    result = ""
    
    if command == 'fetch-analytics':
        if not channel_id:
            result = "❌ Channel ID required for analytics fetch"
        else:
            result = fetch_channel_analytics(youtube, analytics, channel_id)
    
    elif command == 'get-stats':
        if not video_id:
            result = "❌ Video ID required for stats retrieval"
        else:
            result = get_video_stats(youtube, video_id)
    
    elif command == 'upload-video':
        result = "📹 Video upload requires video file. Use local upload script."
    
    else:
        result = f"❌ Unknown command: {command}"
    
    # Save results for GitHub comment
    with open('youtube_results.md', 'w') as f:
        f.write(result)
    
    print(result)

if __name__ == "__main__":
    main()