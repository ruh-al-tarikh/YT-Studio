Write-Host "=== CircleCI Component Verification ===" -ForegroundColor Cyan

# Check if kubectl is available
$kubectlExists = Get-Command kubectl -ErrorAction SilentlyContinue
if (-not $kubectlExists) {
    Write-Host "❌ kubectl not found!" -ForegroundColor Red
    exit 1
}

# Check deployment
$deploymentJson = kubectl get deployment yt-studio-api -n default -o json 2>$null
if (-not $deploymentJson) {
    Write-Host "❌ Deployment 'yt-studio-api' not found!" -ForegroundColor Red
    Write-Host "Run: kubectl apply -f k8s-deployment.yaml" -ForegroundColor Yellow
    exit 1
}

$deployment = $deploymentJson | ConvertFrom-Json

# Check required labels
$componentLabel = $deployment.metadata.labels.'circleci.com/component-name'
$versionLabel = $deployment.metadata.labels.'circleci.com/version'
$projectAnnotation = $deployment.metadata.annotations.'circleci.com/project-id'

Write-Host "`nCircleCI Component Name: $componentLabel" -ForegroundColor $(if ($componentLabel) { "Green" } else { "Red" })
Write-Host "CircleCI Version: $versionLabel" -ForegroundColor $(if ($versionLabel) { "Green" } else { "Red" })
Write-Host "CircleCI Project ID: $projectAnnotation" -ForegroundColor $(if ($projectAnnotation) { "Green" } else { "Red" })

if ($componentLabel -and $versionLabel -and $projectAnnotation) {
    Write-Host "`n✅ All CircleCI labels present!" -ForegroundColor Green
    Write-Host "🔗 View at: https://app.circleci.com/deploys" -ForegroundColor Cyan
} else {
    Write-Host "`n❌ Missing required CircleCI configuration" -ForegroundColor Red
}
