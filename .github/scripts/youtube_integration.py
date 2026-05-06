#!/usr/bin/env python3
import os
import json

def main():
    output_file = '/tmp/youtube_result.md'
    creds_json = os.environ.get('GOOGLE_CREDENTIALS', '')
    
    if not creds_json or creds_json == '':
        with open(output_file, 'w') as f:
            f.write("""## ⚠️ YouTube API Not Configured

The `GOOGLE_CREDENTIALS` secret is not set in this repository.

### To set it up:
1. Go to **Settings** → **Secrets and variables** → **Actions**
2. Click **New repository secret**
3. Name: `GOOGLE_CREDENTIALS`
4. Value: Paste your entire service account JSON
5. Click **Add secret**

### YouTube CLI Commands:
- `/youtube fetch-analytics CHANNEL_ID` - Get channel stats
- `/youtube get-stats VIDEO_ID` - Get video stats

For AI assistance, use `/oc your question here`
""")
        return
    
    try:
        creds = json.loads(creds_json)
        with open(output_file, 'w') as f:
            f.write(f"""## ✅ Google Credentials Configured

**Project:** `{creds.get('project_id', 'unknown')}`
**Service Account:** `{creds.get('client_email', 'unknown')}`

### Status:
- ✅ Credentials JSON is valid
- ⏳ YouTube API needs to be enabled
- ⏳ Service account needs channel permissions

### To Complete Setup:
1. Enable **YouTube Data API v3** in Google Cloud Console
2. Add `{creds.get('client_email', 'unknown')}` as a manager in YouTube Studio
3. Wait 24 hours for permissions to propagate

### Try OpenCode AI:
Comment `/oc What can you help me with?`
""")
    except Exception as e:
        with open(output_file, 'w') as f:
            f.write(f"## ❌ Invalid Credentials\n\nError: {str(e)}\n\nPlease check your `GOOGLE_CREDENTIALS` secret.")

if __name__ == "__main__":
    main()
