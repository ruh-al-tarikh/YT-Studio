# ✅ YT Studio - Wrangler API Fix & Deployment

## Summary of Fixes Applied

### 1. Fixed CORS Headers ✅
- Added `Access-Control-Allow-Origin: *` to all API responses
- Handles preflight OPTIONS requests
- Frontend can now communicate with Wrangler API

### 2. Added Videos Endpoint ✅
- `GET /api/videos` - Returns mock video list for development
- Allows frontend to fetch videos without YouTube API key
- Fallback when YouTube API is unavailable

### 3. Configured YouTube API ✅
- `GET /api/youtube?id=VIDEO_ID` - Fetches real YouTube data
- Requires `YOUTUBE_API_KEY` environment variable
- Better error messages for debugging

### 4. Added Health & Debug Endpoints ✅
- `GET /health` - API status
- `GET /debug` - Request info and bindings status

### 5. Improved Error Handling ✅
- All errors return JSON with `success: false`
- Detailed error messages for troubleshooting
- Proper HTTP status codes (400, 403, 404, 500, 503)

## Files Modified

1. **src/index.js** - Complete Wrangler handler rewrite
2. **wrangler.jsonc** - Added env and secrets configuration

## How to Deploy

### Quick Start (Development Testing)
```bash
# Test locally
wrangler dev

# Test endpoints in another terminal
curl http://localhost:8787/health
curl http://localhost:8787/api/videos
```

### Production Deployment

#### Step 1: Set YouTube API Key
```bash
wrangler secret put YOUTUBE_API_KEY --env production
# When prompted, paste your YouTube Data API v3 key from:
# https://console.cloud.google.com/apis/library/youtube.v3
```

#### Step 2: Deploy to Cloudflare
```bash
wrangler publish --env production
```

#### Step 3: Verify Deployment
```bash
# Wait 1-2 minutes for deployment
curl https://yt-studio-api.ruhdevopsytstudio.workers.dev/health

# Should return:
# {
#   "status": "healthy",
#   "service": "yt-studio-api",
#   "timestamp": "...",
#   "endpoints": [...]
# }
```

#### Step 4: Test Videos Endpoint
```bash
curl https://yt-studio-api.ruhdevopsytstudio.workers.dev/api/videos

# Should return videos with thumbnails and metadata
```

## Frontend Updates Required

In `js/app.js`, line ~14, change:
```javascript
// OLD - points to root, expects videos property
const API = 'https://yt-studio-api.ruhdevopsytstudio.workers.dev';

// NEW - points to videos endpoint
const API = 'https://yt-studio-api.ruhdevopsytstudio.workers.dev/api/videos';
```

**OR** update the fetchVideos() function to call the endpoint:
```javascript
async function fetchVideos() {
  // ... cache check ...
  
  try {
    const response = await fetchWithRetry(API);  // Already points to /api/videos
    const json = await response.json();
    
    // Handle both response formats
    const fetchedVideos = (json.videos || json).map(mapVideo);
    // ... rest of function
  }
}
```

## API Endpoints Reference

### Public Endpoints

| Endpoint | Method | Purpose | Returns |
|----------|--------|---------|---------|
| `/` | GET | Root info | HTML |
| `/health` | GET | Health check | `{ status: "healthy", ... }` |
| `/debug` | GET | Debug info | `{ bindings: {}, request: {}, ... }` |
| `/api/videos` | GET | Video list | `{ videos: [...] }` |
| `/api/youtube` | GET | YouTube data | `{ success: true, data: {...} }` |
| `/api/orders` | GET | Orders (if D1 bound) | `{ data: [...] }` |

### Query Parameters

- `/api/youtube?id=VIDEO_ID` - YouTube video ID (required)

### Response Format

**Success:**
```json
{
  "success": true,
  "videos": [
    {
      "id": "string",
      "title": "string",
      "thumbnail": "url",
      "publishedAt": "ISO date",
      "channel": "string"
    }
  ]
}
```

**Error:**
```json
{
  "success": false,
  "error": "Description of what went wrong"
}
```

## Troubleshooting

### API Returns 503 "YouTube API key not configured"
→ Set the secret: `wrangler secret put YOUTUBE_API_KEY --env production`

### CORS errors in browser console
→ Already fixed in src/index.js. Redeploy: `wrangler publish --env production`

### Videos not loading on website
→ Verify `js/app.js` is calling the correct endpoint
→ Open DevTools → Console to check for errors
→ Test directly: `curl https://yt-studio-api.ruhdevopsytstudio.workers.dev/api/videos`

### 404 on `/api/videos`
→ Wrangler deployment didn't complete. Wait 2-3 minutes and retry.
→ Check deployment status: `wrangler deployments list`

## Performance Optimization (Optional)

### Add Response Caching
```javascript
const cacheUrl = 'https://api-cache.example.com';
const cachedResponse = await caches.default.match(cacheUrl);
if (cachedResponse) return cachedResponse;
```

### Rate Limiting  
```javascript
const rateLimit = env.RATE_LIMIT_PER_MINUTE || 100;
// Track requests and enforce limit
```

### Database Integration
```javascript
// Query D1 for video metadata
const { results } = await env.MY_DB.prepare('SELECT * FROM Videos').all();
```

## Next Steps

1. Deploy updated code to Cloudflare Workers
2. Set YouTube API key
3. Update frontend js/app.js
4. Test website - videos should now load
5. Monitor Wrangler logs for errors
6. Gradually migrate to database-backed video list

---

**Questions?**
- Check `WRANGLER_FIX.md` for detailed setup steps
- View logs: `wrangler tail`
- Test endpoint: Use `curl` or Postman
