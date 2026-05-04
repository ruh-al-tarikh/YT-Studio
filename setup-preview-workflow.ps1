# Preview Workflow Setup Script - Fixed Version
Write-Host "🔥 Creating Firebase Preview Workflow..." -ForegroundColor Cyan
Write-Host ""

# Create the .github/workflows directory if it doesn't exist
$workflowDir = ".github/workflows"
if (-not (Test-Path $workflowDir)) {
    New-Item -ItemType Directory -Path $workflowDir -Force | Out-Null
    Write-Host "✅ Created directory: $workflowDir" -ForegroundColor Green
}

# Create the fixed preview.yml workflow file
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

      - name: Deploy to Firebase Preview Channel
        run: |
          if [ "${{ github.event_name }}" == "workflow_dispatch" ]; then
            CHANNEL_NAME="${{ github.event.inputs.channel }}"
          else
            CHANNEL_NAME="pr-${{ github.event.number }}"
          fi
          
          echo "📦 Deploying to channel: $CHANNEL_NAME"
          firebase hosting:channel:deploy "$CHANNEL_NAME" \
            --expires 7d \
            --project ytstudio-pr
        env:
          FIREBASE_TOKEN: ${{ secrets.FIREBASE_TOKEN }}

      - name: Output Preview URL
        run: |
          if [ "${{ github.event_name }}" == "workflow_dispatch" ]; then
            CHANNEL_NAME="${{ github.event.inputs.channel }}"
          else
            CHANNEL_NAME="pr-${{ github.event.number }}"
          fi
          echo "✅ Preview deployed successfully!"
          echo "🔗 Preview URL: https://ytstudio-pr--$CHANNEL_NAME.web.app"
'@ | Out-File -FilePath ".github/workflows/preview.yml" -Encoding utf8

Write-Host "✅ Created .github/workflows/preview.yml" -ForegroundColor Green

# Commit and push
Write-Host ""
$commitNow = Read-Host "Do you want to commit and push the workflow now? (y/n)"
if ($commitNow -eq 'y') {
    Write-Host "📦 Committing workflow..." -ForegroundColor Yellow
    git add .github/workflows/preview.yml
    git commit -m "fix: Update preview workflow with main branch as default"
    git push origin main
    Write-Host "✅ Committed and pushed!" -ForegroundColor Green
}

# Show next steps
Write-Host ""
Write-Host "🎯 Next Steps:" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host ""
Write-Host "1️⃣  Run with default settings (main branch):" -ForegroundColor Yellow
Write-Host "   gh workflow run preview.yml" -ForegroundColor White
Write-Host ""
Write-Host "2️⃣  Run with specific branch:" -ForegroundColor Yellow
Write-Host "   gh workflow run preview.yml -f branch=main -f channel=my-test" -ForegroundColor White
Write-Host ""
Write-Host "3️⃣  Check workflow status:" -ForegroundColor Yellow
Write-Host "   gh run list --workflow=preview.yml --limit 5" -ForegroundColor White
Write-Host ""
Write-Host "4️⃣  View workflow logs:" -ForegroundColor Yellow
Write-Host "   gh run view --workflow=preview.yml --latest --log" -ForegroundColor White
Write-Host ""
Write-Host "5️⃣  Deploy preview directly (local):" -ForegroundColor Yellow
Write-Host "   firebase hosting:channel:deploy my-test --expires 7d --project ytstudio-pr" -ForegroundColor White
Write-Host ""

# Optional: Test the workflow
$testNow = Read-Host "Do you want to trigger the workflow manually now? (y/n)"
if ($testNow -eq 'y') {
    Write-Host "🚀 Triggering workflow..." -ForegroundColor Yellow
    
    # Check if FIREBASE_TOKEN exists
    $tokenExists = gh secret list 2>$null | Select-String "FIREBASE_TOKEN"
    if ($tokenExists) {
        gh workflow run preview.yml
        Write-Host "✅ Workflow triggered!" -ForegroundColor Green
        Write-Host ""
        Write-Host "Check status: gh run list --workflow=preview.yml --limit 3" -ForegroundColor White
        Write-Host "View logs: gh run view --workflow=preview.yml --latest --log" -ForegroundColor White
    } else {
        Write-Host "❌ Cannot trigger workflow: FIREBASE_TOKEN secret is missing" -ForegroundColor Red
        Write-Host ""
        Write-Host "Please set up the token first:" -ForegroundColor Yellow
        Write-Host "1. Run: firebase login:ci" -ForegroundColor White
        Write-Host "2. Copy the token" -ForegroundColor White
        Write-Host "3. Run: gh secret set FIREBASE_TOKEN" -ForegroundColor White
    }
}

Write-Host ""
Write-Host "✅ Setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Workflow Features:" -ForegroundColor Cyan
Write-Host "  • Manual trigger with branch selection" -ForegroundColor White
Write-Host "  • Automatic PR previews" -ForegroundColor White
Write-Host "  • Uses main branch as default" -ForegroundColor White
Write-Host "  • 7-day preview expiration" -ForegroundColor White
Write-Host "  • pnpm support" -ForegroundColor White