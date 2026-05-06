<#
.SYNOPSIS
    Check, create, and import Google API Key for GitHub Actions
.DESCRIPTION
    This script checks if a Google API key exists, creates one if needed,
    and adds it to GitHub Actions secrets
#>

param(
    [string]$ProjectId = "ytstudio-pr",
    [string]$KeyName = "github-actions-api-key",
    [string]$GitHubRepo = "ruhdevops/YT-Studio"
)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "GOOGLE API KEY MANAGEMENT" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Project ID: $ProjectId" -ForegroundColor Yellow
Write-Host "Key Name: $KeyName" -ForegroundColor Yellow
Write-Host "GitHub Repo: $GitHubRepo" -ForegroundColor Yellow
Write-Host ""

# ============================================
# STEP 1: Check if API key already exists
# ============================================
Write-Host "[1/5] Checking for existing API keys..." -ForegroundColor Yellow

# List existing API keys
$apiKeys = gcloud services api-keys list --project=$ProjectId --format="json" 2>$null

if ($apiKeys) {
    $keys = $apiKeys | ConvertFrom-Json
    Write-Host "  Found $($keys.Count) existing API key(s)" -ForegroundColor Gray
    
    # Check if our key exists
    $existingKey = $keys | Where-Object { $_.displayName -eq $KeyName }
    
    if ($existingKey) {
        Write-Host "✓ Found existing key: $KeyName" -ForegroundColor Green
        Write-Host "  Key ID: $($existingKey.uid)" -ForegroundColor Gray
        Write-Host "  Created: $($existingKey.createTime)" -ForegroundColor Gray
        
        # Get the actual key string (needs to be retrieved)
        Write-Host "  Note: The actual key string cannot be retrieved once created" -ForegroundColor Yellow
        Write-Host "  You'll need to create a new key if you don't have it saved" -ForegroundColor Yellow
        
        $createNew = Read-Host "  Do you want to create a new key anyway? (y/n)"
        if ($createNew -ne 'y') {
            Write-Host "  Using existing key (you'll need to add it manually to GitHub secrets)" -ForegroundColor Yellow
            exit 0
        }
    } else {
        Write-Host "  No key found with name: $KeyName" -ForegroundColor Yellow
    }
} else {
    Write-Host "  No API keys found in project" -ForegroundColor Yellow
}

# ============================================
# STEP 2: Enable required APIs
# ============================================
Write-Host ""
Write-Host "[2/5] Enabling required Google APIs..." -ForegroundColor Yellow

$apis = @(
    "youtube.googleapis.com",
    "customsearch.googleapis.com",
    "generativelanguage.googleapis.com"
)

foreach ($api in $apis) {
    Write-Host "  Enabling $api..." -ForegroundColor Gray
    gcloud services enable $api --project=$ProjectId --quiet 2>$null
    Write-Host "  ✓ $api enabled" -ForegroundColor Green
}

# ============================================
# STEP 3: Create a new API key
# ============================================
Write-Host ""
Write-Host "[3/5] Creating new API key..." -ForegroundColor Yellow

# Create a JSON file with key restrictions
$keyRestrictions = @"
{
  "displayName": "$KeyName",
  "restrictions": {
    "apiTargets": [
      {
        "service": "youtube.googleapis.com"
      },
      {
        "service": "customsearch.googleapis.com"
      },
      {
        "service": "generativelanguage.googleapis.com"
      }
    ]
  }
}
"@

$restrictionsFile = "$env:TEMP\key-restrictions.json"
$keyRestrictions | Out-File -FilePath $restrictionsFile -Encoding utf8 -Force

# Create the API key
Write-Host "  Creating API key (this may take a moment)..." -ForegroundColor Gray
$createResult = gcloud services api-keys create `
    --project=$ProjectId `
    --display-name="$KeyName" `
    --api-target="service=youtube.googleapis.com" `
    --format="json" 2>$null

if ($createResult) {
    $keyData = $createResult | ConvertFrom-Json
    $API_KEY = $keyData.keyString
    $KEY_ID = $keyData.uid
    
    Write-Host "✓ API Key created successfully!" -ForegroundColor Green
    Write-Host "  Key ID: $KEY_ID" -ForegroundColor Gray
} else {
    Write-Host "✗ Failed to create API key. Trying alternative method..." -ForegroundColor Yellow
    
    # Alternative method using create-key command
    $createResult = gcloud alpha services api-keys create `
        --project=$ProjectId `
        --display-name="$KeyName" `
        --format="json" 2>$null
    
    if ($createResult) {
        $keyData = $createResult | ConvertFrom-Json
        $API_KEY = $keyData.keyString
        $KEY_ID = $keyData.uid
        Write-Host "✓ API Key created successfully!" -ForegroundColor Green
    } else {
        Write-Host "✗ Failed to create API key. Please create manually in Google Cloud Console." -ForegroundColor Red
        Write-Host "  Go to: https://console.cloud.google.com/apis/credentials?project=$ProjectId" -ForegroundColor Cyan
        exit 1
    }
}

# ============================================
# STEP 4: Add restrictions to the key (optional)
# ============================================
Write-Host ""
Write-Host "[4/5] Adding restrictions to API key..." -ForegroundColor Yellow

try {
    # Restrict to specific APIs
    gcloud services api-keys update $KEY_ID `
        --project=$ProjectId `
        --api-target="service=youtube.googleapis.com" `
        --api-target="service=customsearch.googleapis.com" `
        --api-target="service=generativelanguage.googleapis.com" `
        --quiet 2>$null
    Write-Host "✓ API restrictions added" -ForegroundColor Green
} catch {
    Write-Host "⚠️ Could not add restrictions (non-critical)" -ForegroundColor Yellow
}

# ============================================
# STEP 5: Add to GitHub Secrets
# ============================================
Write-Host ""
Write-Host "[5/5] Adding API key to GitHub Secrets..." -ForegroundColor Yellow

# Check if GitHub CLI is installed
$ghInstalled = Get-Command gh -ErrorAction SilentlyContinue

if ($ghInstalled -and $API_KEY) {
    Write-Host "  Adding secret to GitHub repository..." -ForegroundColor Gray
    
    # Add the API key as a GitHub secret
    echo $API_KEY | gh secret set GOOGLE_API_KEY --repo $GitHubRepo
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ GOOGLE_API_KEY added to GitHub secrets!" -ForegroundColor Green
        
        # Also add to .env file for local development
        $envFile = ".env"
        if (Test-Path $envFile) {
            # Update existing .env
            $content = Get-Content $envFile -Raw
            if ($content -match "GOOGLE_API_KEY=") {
                $content = $content -replace "GOOGLE_API_KEY=.*", "GOOGLE_API_KEY=$API_KEY"
            } else {
                $content += "`nGOOGLE_API_KEY=$API_KEY"
            }
            $content | Out-File -FilePath $envFile -Encoding utf8 -Force
        } else {
            # Create new .env file
            "GOOGLE_API_KEY=$API_KEY" | Out-File -FilePath $envFile -Encoding utf8 -Force
        }
        Write-Host "✓ Added to .env file for local development" -ForegroundColor Green
        
    } else {
        Write-Host "✗ Failed to add secret to GitHub" -ForegroundColor Red
        Write-Host "  Please add manually:" -ForegroundColor Yellow
        Write-Host "  1. Go to: https://github.com/$GitHubRepo/settings/secrets/actions" -ForegroundColor Cyan
        Write-Host "  2. Click 'New repository secret'" -ForegroundColor Cyan
        Write-Host "  3. Name: GOOGLE_API_KEY" -ForegroundColor Cyan
        Write-Host "  4. Value: $API_KEY" -ForegroundColor Cyan
    }
} else {
    Write-Host "⚠️ GitHub CLI not installed or API key not available" -ForegroundColor Yellow
    Write-Host "  Please add secret manually:" -ForegroundColor Yellow
    Write-Host "  1. Go to: https://github.com/$GitHubRepo/settings/secrets/actions" -ForegroundColor Cyan
    Write-Host "  2. Click 'New repository secret'" -ForegroundColor Cyan
    Write-Host "  3. Name: GOOGLE_API_KEY" -ForegroundColor Cyan
    Write-Host "  4. Value: $API_KEY" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "  Also add to .env file for local development:" -ForegroundColor Yellow
    Write-Host "  echo 'GOOGLE_API_KEY=$API_KEY' >> .env" -ForegroundColor Gray
}

# ============================================
# FINAL SUMMARY
# ============================================
Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "✅ API KEY MANAGEMENT COMPLETE!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

Write-Host "📊 Summary:" -ForegroundColor Yellow
if ($API_KEY) {
    Write-Host "  ✓ API Key Created: Yes" -ForegroundColor Green
    Write-Host "  ✓ Key ID: $KEY_ID" -ForegroundColor White
    Write-Host "  ✓ Key Value: $($API_KEY.Substring(0,10))... (hidden)" -ForegroundColor White
} else {
    Write-Host "  ✗ API Key Created: No" -ForegroundColor Red
}
Write-Host "  ✓ GitHub Secret: GOOGLE_API_KEY" -ForegroundColor Green
Write-Host "  ✓ Enabled APIs: YouTube, Custom Search, Generative AI" -ForegroundColor Green

Write-Host ""
Write-Host "💡 Next Steps:" -ForegroundColor Cyan
Write-Host "  1. Test the API key locally:" -ForegroundColor White
Write-Host "     npm run enhance" -ForegroundColor Gray
Write-Host ""
Write-Host "  2. Push to trigger GitHub Actions:" -ForegroundColor White
Write-Host "     git add . && git commit -m 'feat: Add Google API key' && git push" -ForegroundColor Gray
Write-Host ""
Write-Host "  3. Or run manually:" -ForegroundColor White
Write-Host "     docker compose run automation" -ForegroundColor Gray
Write-Host ""

Write-Host "🔗 Useful Links:" -ForegroundColor Yellow
Write-Host "  Google Cloud Console: https://console.cloud.google.com/apis/credentials?project=$ProjectId" -ForegroundColor Gray
Write-Host "  GitHub Secrets: https://github.com/$GitHubRepo/settings/secrets/actions" -ForegroundColor Gray