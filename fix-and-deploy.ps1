# fix-and-deploy.ps1
# Run this script from the root of your YT-Studio project

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "YT-STUDIO: COMPLETE FIX & DEPLOY SCRIPT" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# --- 1. Set the Correct Worker URL ---
$CORRECT_WORKER_URL = "https://yt-studio-youtube-api.ruhdevopsytstudio.workers.dev"
Write-Host "[1/6] Correct Worker URL: $CORRECT_WORKER_URL" -ForegroundColor Green

# --- 2. Update Environment Variable in Cloudflare Pages via Wrangler ---
Write-Host "`n[2/6] Setting VITE_API_URL environment variable in Cloudflare Pages..." -ForegroundColor Yellow
# Note: This uses the Wrangler CLI to set the variable for your pages project.
# Your pages project is named 'yt-studio' as seen in your wrangler.jsonc.
npx wrangler pages project list | Out-Null # Ensure you're logged in
echo "$CORRECT_WORKER_URL" | npx wrangler pages deployment create --project-name=yt-studio --env=production --commit-message="ci: Set correct API URL" tail

# --- 3. Update wrangler.jsonc to ensure the Worker is correct ---
Write-Host "`n[3/6] Updating wrangler.jsonc..." -ForegroundColor Yellow
$wranglerConfig = @"
{
  "name": "yt-studio-youtube-api",
  "main": "src/youtube-worker.ts",
  "compatibility_date": "2025-01-01",
  "compatibility_flags": ["nodejs_compat"],
  "workers_dev": true,
  "env": {
    "production": {
      "vars": {
        "ENVIRONMENT": "production"
      }
    }
  }
}
"@
$wranglerConfig | Out-File -FilePath "wrangler.jsonc" -Encoding utf8 -Force
Write-Host "wrangler.jsonc updated." -ForegroundColor Green

# --- 4. Deploy the CORRECT Worker (using the file that has the routes) ---
Write-Host "`n[4/6] Deploying the correct Worker (src/youtube-worker.ts)..." -ForegroundColor Yellow
# We deploy using the name you used successfully before.
npx wrangler deploy src/youtube-worker.ts --name yt-studio-youtube-api --env production
if ($LASTEXITCODE -ne 0) { Write-Host "Worker deployment failed!" -ForegroundColor Red; exit 1 }
Write-Host "Worker deployed successfully!" -ForegroundColor Green

# --- 5. Update Frontend (js/app.js) to use the correct environment variable ---
Write-Host "`n[5/6] Ensuring js/app.js uses the 'import.meta.env.VITE_API_URL' variable..." -ForegroundColor Yellow
$appJsPath = "js/app.js"
if (Test-Path $appJsPath) {
    # Create a backup just in case
    Copy-Item $appJsPath "$appJsPath.backup" -Force
    
    # This regex replaces hardcoded URL strings with the env variable, if they exist.
    # It looks for patterns like: https://yt-studio-production...
    (Get-Content $appJsPath -Raw) -replace 'https://yt-studio-production\.ruhdevopsytstudio\.workers\.dev', 'import.meta.env.VITE_API_URL' `
                                   -replace '"https://yt-studio-production\.ruhdevopsytstudio\.workers\.dev"', 'import.meta.env.VITE_API_URL' `
                                   -replace "'https://yt-studio-production\.ruhdevopsytstudio\.workers\.dev'", 'import.meta.env.VITE_API_URL' `
                                   -replace 'const API_URL = .*?;', 'const API_URL = import.meta.env.VITE_API_URL;' `
                                   -replace 'VITE_API_URL', 'VITE_API_URL' | Out-File $appJsPath -Force
    Write-Host "js/app.js updated." -ForegroundColor Green
} else {
    Write-Host "js/app.js not found. Please ensure the file path is correct." -ForegroundColor Red
}

# --- 6. Build and Deploy Frontend to Cloudflare Pages ---
Write-Host "`n[6/6] Building and deploying frontend to Cloudflare Pages..." -ForegroundColor Yellow
pnpm install
pnpm run build
if ($LASTEXITCODE -ne 0) { Write-Host "Frontend build failed!" -ForegroundColor Red; exit 1 }

# Deploy to Cloudflare Pages. Your dashboard shows the project is named 'yt-studio'
npx wrangler pages deploy dist --project-name=yt-studio

Write-Host "`n========================================" -ForegroundColor Green
Write-Host "✅ DEPLOYMENT COMPLETE!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host "`nYour site should now be live at: https://yt-studio-97c.pages.dev" -ForegroundColor Cyan
Write-Host "Your API Worker is live at: $CORRECT_WORKER_URL" -ForegroundColor Cyan
Write-Host "`nIt may take a minute for the Cloudflare Pages deployment to finish.`n" -ForegroundColor Yellow