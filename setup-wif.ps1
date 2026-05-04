# Workload Identity Federation Setup for Firebase Deployments
Write-Host "🔐 Setting up Workload Identity Federation for GitHub Actions..." -ForegroundColor Cyan
Write-Host ""

# Variables - UPDATE THESE!
$PROJECT_ID = "ytstudio-pr"
$POOL_ID = "github-actions-pool"
$PROVIDER_ID = "github-provider"
$SERVICE_ACCOUNT = "github-actions-deploy@$PROJECT_ID.iam.gserviceaccount.com"
$REPO = "ruhdevops/YT-Studio"

Write-Host "📋 Configuration:" -ForegroundColor Yellow
Write-Host "   Project ID: $PROJECT_ID" -ForegroundColor White
Write-Host "   Pool ID: $POOL_ID" -ForegroundColor White
Write-Host "   Provider ID: $PROVIDER_ID" -ForegroundColor White
Write-Host "   Service Account: $SERVICE_ACCOUNT" -ForegroundColor White
Write-Host "   Repository: $REPO" -ForegroundColor White
Write-Host ""

# Check if gcloud is installed
$gcloudInstalled = Get-Command gcloud -ErrorAction SilentlyContinue
if (-not $gcloudInstalled) {
    Write-Host "❌ gcloud CLI not found. Please install Google Cloud SDK first:" -ForegroundColor Red
    Write-Host "   https://cloud.google.com/sdk/docs/install" -ForegroundColor Yellow
    exit 1
}

# Step 1: Login to Google Cloud
Write-Host "📋 Step 1: Logging into Google Cloud..." -ForegroundColor Cyan
gcloud auth login --no-launch-browser

# Step 2: Set the project
Write-Host ""
Write-Host "📋 Step 2: Setting project to $PROJECT_ID..." -ForegroundColor Cyan
gcloud config set project $PROJECT_ID

# Step 3: Enable required APIs
Write-Host ""
Write-Host "📋 Step 3: Enabling required APIs..." -ForegroundColor Cyan
gcloud services enable iamcredentials.googleapis.com
gcloud services enable cloudresourcemanager.googleapis.com
gcloud services enable firebase.googleapis.com

# Step 4: Create the Workload Identity Pool
Write-Host ""
Write-Host "📋 Step 4: Creating Workload Identity Pool..." -ForegroundColor Cyan
$poolExists = gcloud iam workload-identity-pools describe $POOL_ID --location=global 2>$null
if (-not $poolExists) {
    gcloud iam workload-identity-pools create $POOL_ID `
        --location=global `
        --display-name="GitHub Actions Pool" `
        --description="Pool for GitHub Actions authentication"
    Write-Host "✅ Created pool: $POOL_ID" -ForegroundColor Green
} else {
    Write-Host "✅ Pool already exists: $POOL_ID" -ForegroundColor Green
}

# Step 5: Create the OIDC Provider
Write-Host ""
Write-Host "📋 Step 5: Creating OIDC Provider..." -ForegroundColor Cyan
$providerExists = gcloud iam workload-identity-pools providers describe $PROVIDER_ID --location=global --workload-identity-pool=$POOL_ID 2>$null
if (-not $providerExists) {
    gcloud iam workload-identity-pools providers create-oidc $PROVIDER_ID `
        --location=global `
        --workload-identity-pool=$POOL_ID `
        --display-name="GitHub Provider" `
        --description="OIDC provider for GitHub Actions" `
        --issuer-uri="https://token.actions.githubusercontent.com" `
        --attribute-mapping="google.subject=assertion.sub,attribute.repository=assertion.repository,attribute.repository_owner=assertion.repository_owner"
    Write-Host "✅ Created provider: $PROVIDER_ID" -ForegroundColor Green
} else {
    Write-Host "✅ Provider already exists: $PROVIDER_ID" -ForegroundColor Green
}

# Step 6: Get the Workload Identity Pool resource name
Write-Host ""
Write-Host "📋 Step 6: Getting pool resource name..." -ForegroundColor Cyan
$POOL_RESOURCE_NAME = gcloud iam workload-identity-pools describe $POOL_ID `
    --location=global `
    --format="value(name)"

Write-Host "✅ Pool Resource Name: $POOL_RESOURCE_NAME" -ForegroundColor Green

# Step 7: Create or update service account
Write-Host ""
Write-Host "📋 Step 7: Creating service account..." -ForegroundColor Cyan
$saExists = gcloud iam service-accounts describe $SERVICE_ACCOUNT 2>$null
if (-not $saExists) {
    gcloud iam service-accounts create "github-actions-deploy" `
        --display-name="GitHub Actions Deploy" `
        --description="Service account for GitHub Actions deployments"
    Write-Host "✅ Created service account: $SERVICE_ACCOUNT" -ForegroundColor Green
} else {
    Write-Host "✅ Service account already exists: $SERVICE_ACCOUNT" -ForegroundColor Green
}

# Step 8: Grant necessary roles to the service account
Write-Host ""
Write-Host "📋 Step 8: Granting roles to service account..." -ForegroundColor Cyan
gcloud projects add-iam-policy-binding $PROJECT_ID `
    --member="serviceAccount:$SERVICE_ACCOUNT" `
    --role="roles/firebase.admin"

gcloud projects add-iam-policy-binding $PROJECT_ID `
    --member="serviceAccount:$SERVICE_ACCOUNT" `
    --role="roles/cloudbuild.builds.editor"

gcloud projects add-iam-policy-binding $PROJECT_ID `
    --member="serviceAccount:$SERVICE_ACCOUNT" `
    --role="roles/iam.serviceAccountUser"

Write-Host "✅ Roles granted" -ForegroundColor Green

# Step 9: Allow the GitHub repository to authenticate using the pool
Write-Host ""
Write-Host "📋 Step 9: Granting access to GitHub repository..." -ForegroundColor Cyan
gcloud iam service-accounts add-iam-policy-binding $SERVICE_ACCOUNT `
    --member="principalSet://iam.googleapis.com/$POOL_RESOURCE_NAME/attribute.repository/$REPO" `
    --role="roles/iam.workloadIdentityUser"

Write-Host "✅ GitHub access granted" -ForegroundColor Green

# Step 10: Create the GitHub workflow file
Write-Host ""
Write-Host "📋 Step 10: Creating GitHub workflow with Workload Identity..." -ForegroundColor Cyan

# Create the workflow directory if it doesn't exist
New-Item -ItemType Directory -Path ".github/workflows" -Force | Out-Null

# Write the workflow file directly using a here-string
@'
name: Deploy Preview

on:
  workflow_dispatch:
    inputs:
      branch:
        description: 'Branch to deploy'
        required: false
        default: 'main'
        type: string
      channel:
        description: 'Preview channel name'
        required: false
        default: 'manual-preview'
        type: string
  pull_request:
    types: [opened, synchronize]

permissions:
  id-token: write
  contents: read

jobs:
  preview:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4
        with:
          ref: ${{ github.event.inputs.branch || github.event.pull_request.head.ref || 'main' }}
          fetch-depth: 0

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Setup pnpm
        uses: pnpm/action-setup@v4
        with:
          version: 8

      - name: Install dependencies
        run: pnpm install

      - name: Build project
        run: pnpm run build

      - name: Create firebase.json
        run: |
          cat > firebase.json << 'EOF'
          {
            "hosting": {
              "public": "dist",
              "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
              "cleanUrls": true,
              "rewrites": [{ "source": "**", "destination": "/index.html" }]
            }
          }
          EOF

      - name: Authenticate to Google Cloud
        uses: google-github-actions/auth@v2
        with:
          workload_identity_provider: "PLACEHOLDER_POOL/providers/github-provider"
          service_account: "PLACEHOLDER_SA"

      - name: Install Firebase CLI
        run: npm install -g firebase-tools

      - name: Deploy to Firebase Preview Channel
        run: |
          if [ "${{ github.event_name }}" == "workflow_dispatch" ]; then
            CHANNEL_NAME="${{ github.event.inputs.channel }}"
          else
            CHANNEL_NAME="pr-${{ github.event.number }}"
          fi
          
          echo "📦 Deploying to channel: $CHANNEL_NAME"
          firebase hosting:channel:deploy "$CHANNEL_NAME" --expires 7d --project PLACEHOLDER_PROJECT

      - name: Output Preview URL
        run: |
          if [ "${{ github.event_name }}" == "workflow_dispatch" ]; then
            CHANNEL_NAME="${{ github.event.inputs.channel }}"
          else
            CHANNEL_NAME="pr-${{ github.event.number }}"
          fi
          echo "✅ Preview deployed successfully!"
          echo "🔗 Preview URL: https://PLACEHOLDER_PROJECT--$CHANNEL_NAME.web.app"
'@ | Out-File -FilePath ".github/workflows/preview.yml" -Encoding utf8

# Replace placeholders with actual values
(Get-Content ".github/workflows/preview.yml") -replace 'PLACEHOLDER_POOL', $POOL_RESOURCE_NAME `
    -replace 'PLACEHOLDER_SA', $SERVICE_ACCOUNT `
    -replace 'PLACEHOLDER_PROJECT', $PROJECT_ID |
    Set-Content ".github/workflows/preview.yml"

Write-Host "✅ Created preview.yml with Workload Identity Federation" -ForegroundColor Green

# Step 11: Commit and push (optional)
Write-Host ""
$commitNow = Read-Host "Do you want to commit and push the workflow now? (y/n)"
if ($commitNow -eq 'y') {
    git add .github/workflows/preview.yml
    git commit -m "feat: Use Workload Identity Federation for Firebase deployments"
    git push origin main
    Write-Host "✅ Committed and pushed!" -ForegroundColor Green
}

Write-Host ""
Write-Host "🎉 Workload Identity Federation Setup Complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Summary:" -ForegroundColor Cyan
Write-Host "   Pool Resource Name: $POOL_RESOURCE_NAME" -ForegroundColor White
Write-Host "   Service Account: $SERVICE_ACCOUNT" -ForegroundColor White
Write-Host "   Workflow: .github/workflows/preview.yml" -ForegroundColor White
Write-Host ""
Write-Host "🚀 Next steps:" -ForegroundColor Cyan
Write-Host "   1. Run: gh workflow run preview.yml" -ForegroundColor White
Write-Host "   2. Check status: gh run list --workflow=preview.yml --limit 3" -ForegroundColor White
Write-Host ""
Write-Host "No service account keys needed! 🔐" -ForegroundColor Green