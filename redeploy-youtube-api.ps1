<#
.SYNOPSIS
    Complete redeployment of YouTube API V3 using Wrangler/Cloudflare Workers
.DESCRIPTION
    This script rebuilds and redeploys the YouTube API integration from scratch
#>

param(
    [switch]$SkipBuild,
    [switch]$SkipDeploy
)

$projectRoot = "C:\Projects\MyRepo\YT-Studio"
Set-Location $projectRoot

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "🔄 YOUTUBE API V3 REDEPLOYMENT" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# ============================================
# STEP 1: Check Prerequisites
# ============================================
Write-Host "[1/8] Checking prerequisites..." -ForegroundColor Yellow

# Check Node.js
$nodeVersion = node --version 2>$null
if ($nodeVersion) {
    Write-Host "  ✓ Node.js: $nodeVersion" -ForegroundColor Green
} else {
    Write-Host "  ✗ Node.js not found. Please install Node.js" -ForegroundColor Red
    exit 1
}

# Check Wrangler
$wranglerVersion = npx wrangler --version 2>$null
if ($wranglerVersion) {
    Write-Host "  ✓ Wrangler: $wranglerVersion" -ForegroundColor Green
} else {
    Write-Host "  Installing Wrangler..." -ForegroundColor Yellow
    npm install -g wrangler
}

# Check pnpm/npm
if (Get-Command pnpm -ErrorAction SilentlyContinue) {
    Write-Host "  ✓ pnpm available" -ForegroundColor Green
    $pkgManager = "pnpm"
} else {
    Write-Host "  ✓ npm available" -ForegroundColor Green
    $pkgManager = "npm"
}

# ============================================
# STEP 2: Verify/Create YouTube API Worker Files
# ============================================
Write-Host ""
Write-Host "[2/8] Setting up YouTube API Worker files..." -ForegroundColor Yellow

# Ensure src directory exists
if (-not (Test-Path "src")) {
    New-Item -ItemType Directory -Path "src" -Force | Out-Null
}

# Create the YouTube API Worker (src/youtube-worker.ts)
$youtubeWorkerContent = @'
/**
 * YouTube API V3 Worker for Cloudflare Workers
 * Handles YouTube Data API requests securely
 */

export interface Env {
  YOUTUBE_API_KEY: string;
  CACHE_TTL?: number;
}

// Cache TTL in seconds (default 1 hour)
const DEFAULT_CACHE_TTL = 3600;

// Allowed origins for CORS
const ALLOWED_ORIGINS = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://ytstudio-pr.web.app',
  'https://yt-studio-493116.web.app',
  'https://ruhdevops.github.io'
];

// Helper to get CORS headers
function getCorsHeaders(request: Request): Record<string, string> {
  const origin = request.headers.get('Origin');
  const allowedOrigin = origin && ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-API-Key',
    'Access-Control-Max-Age': '86400',
  };
}

// YouTube API endpoints
const YOUTUBE_API_BASE = 'https://www.googleapis.com/youtube/v3';

// Helper to fetch from YouTube API
async function fetchYouTubeAPI(endpoint: string, apiKey: string): Promise<Response> {
  const url = `${YOUTUBE_API_BASE}${endpoint}&key=${apiKey}`;
  
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
    },
  });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`YouTube API Error: ${response.status} - ${error}`);
  }
  
  return response;
}

// Handle channel statistics request
async function handleChannelStats(channelId: string, apiKey: string): Promise<Response> {
  const endpoint = `/channels?part=snippet,statistics&id=${channelId}`;
  const response = await fetchYouTubeAPI(endpoint, apiKey);
  const data = await response.json();
  
  if (!data.items || data.items.length === 0) {
    return new Response(
      JSON.stringify({ error: 'Channel not found' }),
      { status: 404, headers: { 'Content-Type': 'application/json' } }
    );
  }
  
  const channel = data.items[0];
  const stats = channel.statistics;
  
  return new Response(
    JSON.stringify({
      success: true,
      channelId: channelId,
      title: channel.snippet.title,
      description: channel.snippet.description,
      thumbnail: channel.snippet.thumbnails.default.url,
      subscribers: parseInt(stats.subscriberCount, 10),
      views: parseInt(stats.viewCount, 10),
      videos: parseInt(stats.videoCount, 10),
      createdAt: channel.snippet.publishedAt,
    }),
    { headers: { 'Content-Type': 'application/json' } }
  );
}

// Handle video statistics request
async function handleVideoStats(videoId: string, apiKey: string): Promise<Response> {
  const endpoint = `/videos?part=snippet,statistics&id=${videoId}`;
  const response = await fetchYouTubeAPI(endpoint, apiKey);
  const data = await response.json();
  
  if (!data.items || data.items.length === 0) {
    return new Response(
      JSON.stringify({ error: 'Video not found' }),
      { status: 404, headers: { 'Content-Type': 'application/json' } }
    );
  }
  
  const video = data.items[0];
  const stats = video.statistics;
  
  return new Response(
    JSON.stringify({
      success: true,
      videoId: videoId,
      title: video.snippet.title,
      description: video.snippet.description,
      thumbnail: video.snippet.thumbnails.default.url,
      channelId: video.snippet.channelId,
      channelTitle: video.snippet.channelTitle,
      publishedAt: video.snippet.publishedAt,
      views: parseInt(stats.viewCount, 0),
      likes: parseInt(stats.likeCount, 0),
      comments: parseInt(stats.commentCount, 0),
    }),
    { headers: { 'Content-Type': 'application/json' } }
  );
}

// Handle search request
async function handleSearch(query: string, maxResults: number, apiKey: string): Promise<Response> {
  const endpoint = `/search?part=snippet&q=${encodeURIComponent(query)}&maxResults=${maxResults}&type=video`;
  const response = await fetchYouTubeAPI(endpoint, apiKey);
  const data = await response.json();
  
  const results = data.items?.map((item: any) => ({
    videoId: item.id.videoId,
    title: item.snippet.title,
    description: item.snippet.description,
    thumbnail: item.snippet.thumbnails.default.url,
    channelTitle: item.snippet.channelTitle,
    publishedAt: item.snippet.publishedAt,
  })) || [];
  
  return new Response(
    JSON.stringify({
      success: true,
      query: query,
      totalResults: data.pageInfo?.totalResults || 0,
      results: results,
    }),
    { headers: { 'Content-Type': 'application/json' } }
  );
}

// Main request handler
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;
    const corsHeaders = getCorsHeaders(request);
    
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders });
    }
    
    // Only allow GET requests
    if (request.method !== 'GET') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    // Check API key
    const apiKey = env.YOUTUBE_API_KEY;
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'YouTube API key not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    try {
      // Route: /api/channel/:channelId
      const channelMatch = path.match(/^\/api\/channel\/(.+)$/);
      if (channelMatch) {
        const channelId = channelMatch[1];
        return await handleChannelStats(channelId, apiKey);
      }
      
      // Route: /api/video/:videoId
      const videoMatch = path.match(/^\/api\/video\/(.+)$/);
      if (videoMatch) {
        const videoId = videoMatch[1];
        return await handleVideoStats(videoId, apiKey);
      }
      
      // Route: /api/search?q=query&maxResults=10
      if (path === '/api/search') {
        const query = url.searchParams.get('q');
        if (!query) {
          return new Response(JSON.stringify({ error: 'Missing search query' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
        const maxResults = parseInt(url.searchParams.get('maxResults') || '10', 10);
        return await handleSearch(query, maxResults, apiKey);
      }
      
      // Root endpoint - API info
      if (path === '/' || path === '/api') {
        return new Response(
          JSON.stringify({
            name: 'YouTube API V3 Worker',
            version: '1.0.0',
            endpoints: {
              channel: '/api/channel/{CHANNEL_ID}',
              video: '/api/video/{VIDEO_ID}',
              search: '/api/search?q={QUERY}&maxResults={COUNT}',
            },
            status: 'healthy',
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      return new Response(JSON.stringify({ error: 'Not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
      
    } catch (error) {
      console.error('Worker error:', error);
      return new Response(
        JSON.stringify({ error: 'Internal server error', details: String(error) }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  },
};
'@

# Save the worker file
$youtubeWorkerContent | Out-File -FilePath "src/youtube-worker.ts" -Encoding utf8 -Force
Write-Host "  ✓ Created: src/youtube-worker.ts" -ForegroundColor Green

# ============================================
# STEP 3: Configure wrangler.jsonc
# ============================================
Write-Host ""
Write-Host "[3/8] Configuring wrangler.jsonc..." -ForegroundColor Yellow

$wranglerContent = @'
{
  "$schema": "https://raw.githubusercontent.com/cloudflare/workers-sdk/main/packages/wrangler/config-schema.json",
  "name": "yt-studio-youtube-api",
  "main": "src/youtube-worker.ts",
  "compatibility_date": "2025-01-01",
  "compatibility_flags": ["nodejs_compat"],
  "observability": {
    "enabled": true
  },
  "vars": {
    "ENVIRONMENT": "production"
  },
  "env": {
    "production": {
      "name": "yt-studio-youtube-api-prod",
      "routes": [
        {
          "pattern": "api.yt-studio.com/youtube/*",
          "custom_domain": true
        }
      ]
    },
    "staging": {
      "name": "yt-studio-youtube-api-staging",
      "vars": {
        "ENVIRONMENT": "staging"
      }
    }
  }
}
'@

$wranglerContent | Out-File -FilePath "wrangler.jsonc" -Encoding utf8 -Force
Write-Host "  ✓ Updated: wrangler.jsonc" -ForegroundColor Green

# ============================================
# STEP 4: Create package.json scripts if missing
# ============================================
Write-Host ""
Write-Host "[4/8] Updating package.json scripts..." -ForegroundColor Yellow

$packageJson = Get-Content "package.json" -Raw | ConvertFrom-Json

if (-not $packageJson.scripts) {
    $packageJson.scripts = @{}
}

$packageJson.scripts | Add-Member -NotePropertyName "worker:dev" -NotePropertyValue "wrangler dev src/youtube-worker.ts" -Force
$packageJson.scripts | Add-Member -NotePropertyName "worker:deploy" -NotePropertyValue "wrangler deploy" -Force
$packageJson.scripts | Add-Member -NotePropertyName "worker:deploy:prod" -NotePropertyValue "wrangler deploy --env production" -Force

$packageJson | ConvertTo-Json -Depth 10 | Out-File "package.json" -Encoding utf8 -Force
Write-Host "  ✓ Added worker scripts to package.json" -ForegroundColor Green

# ============================================
# STEP 5: Install dependencies
# ============================================
Write-Host ""
Write-Host "[5/8] Installing dependencies..." -ForegroundColor Yellow

if ($pkgManager -eq "pnpm") {
    pnpm install
} else {
    npm install
}

# ============================================
# STEP 6: Login to Cloudflare (if needed)
# ============================================
Write-Host ""
Write-Host "[6/8] Checking Cloudflare authentication..." -ForegroundColor Yellow

$whoami = npx wrangler whoami 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "  Please login to Cloudflare:" -ForegroundColor Yellow
    npx wrangler login
} else {
    Write-Host "  ✓ Already logged in to Cloudflare" -ForegroundColor Green
}

# ============================================
# STEP 7: Set YouTube API key secret
# ============================================
Write-Host ""
Write-Host "[7/8] Setting YouTube API key secret..." -ForegroundColor Yellow

$apiKey = Read-Host "Enter your YouTube API Key (from Google Cloud Console)"
if ($apiKey) {
    Write-Host "  Setting secret..." -ForegroundColor Gray
    echo $apiKey | npx wrangler secret put YOUTUBE_API_KEY
    Write-Host "  ✓ YouTube API key configured" -ForegroundColor Green
} else {
    Write-Host "  ⚠️ No API key provided. You'll need to set it manually:" -ForegroundColor Yellow
    Write-Host "     npx wrangler secret put YOUTUBE_API_KEY" -ForegroundColor Gray
}

# ============================================
# STEP 8: Deploy the worker
# ============================================
Write-Host ""
Write-Host "[8/8] Deploying YouTube API Worker..." -ForegroundColor Yellow

if (-not $SkipDeploy) {
    npx wrangler deploy
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  ✓ Worker deployed successfully!" -ForegroundColor Green
        
        # Get the deployed URL
        $deployOutput = npx wrangler deploy 2>&1
        if ($deployOutput -match 'https://([^/]+)\.workers\.dev') {
            $workerUrl = $matches[0]
            Write-Host ""
            Write-Host "  🌐 Worker URL: $workerUrl" -ForegroundColor Cyan
        }
    } else {
        Write-Host "  ✗ Deployment failed. Check errors above." -ForegroundColor Red
    }
}

# ============================================
# FINAL SUMMARY
# ============================================
Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "✅ YOUTUBE API V3 REDEPLOYMENT COMPLETE!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

Write-Host "📋 API Endpoints (after deployment):" -ForegroundColor Yellow
Write-Host "  GET /api/channel/{CHANNEL_ID}  - Get channel statistics" -ForegroundColor White
Write-Host "  GET /api/video/{VIDEO_ID}      - Get video statistics" -ForegroundColor White
Write-Host "  GET /api/search?q=QUERY       - Search videos" -ForegroundColor White

Write-Host ""
Write-Host "🧪 Test Commands:" -ForegroundColor Yellow
Write-Host "  npx wrangler dev src/youtube-worker.ts" -ForegroundColor Gray
Write-Host "  curl http://localhost:8787/api/channel/UCrjJP_SHUeCmqpTSHJCXkdA" -ForegroundColor Gray

Write-Host ""
Write-Host "🚀 To deploy to production:" -ForegroundColor Cyan
Write-Host "  npx wrangler deploy --env production" -ForegroundColor White

Write-Host ""
Write-Host "🔑 To update API key later:" -ForegroundColor Cyan
Write-Host "  npx wrangler secret put YOUTUBE_API_KEY" -ForegroundColor White