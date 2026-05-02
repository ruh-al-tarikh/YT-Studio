# ============================================
# CircleCI Kubernetes Component Setup (Fixed)
# For YT-Studio Project
# ============================================

Write-Host "=== CircleCI Kubernetes Component Setup ===" -ForegroundColor Cyan

# Step 1: Get CircleCI Project ID
Write-Host "`n📋 Step 1: Getting CircleCI Project ID" -ForegroundColor Yellow

$projectId = Read-Host "Enter your CircleCI Project ID (from Project Settings)"

if (-not $projectId) {
    Write-Host "❌ Project ID required!" -ForegroundColor Red
    Write-Host "🔍 Find it at: https://app.circleci.com/settings/project/github/ruhdevops/YT-Studio" -ForegroundColor Cyan
    exit 1
}

Write-Host "✅ Project ID: $projectId" -ForegroundColor Green

# Step 2: Define component details
Write-Host "`n📦 Step 2: Define component details" -ForegroundColor Yellow

$componentName = "yt-studio-api"
$version = Read-Host "Enter version (default: latest)"
if (-not $version) { $version = "latest" }
$namespace = Read-Host "Enter Kubernetes namespace (default: default)"
if (-not $namespace) { $namespace = "default" }

Write-Host "✅ Component: $componentName" -ForegroundColor Green
Write-Host "✅ Version: $version" -ForegroundColor Green
Write-Host "✅ Namespace: $namespace" -ForegroundColor Green

# Step 3: Generate Kubernetes Deployment YAML
Write-Host "`n📝 Step 3: Generating Kubernetes Deployment YAML" -ForegroundColor Yellow

$deploymentYaml = @"
apiVersion: apps/v1
kind: Deployment
metadata:
  name: $componentName
  namespace: $namespace
  annotations:
    circleci.com/project-id: $projectId
  labels:
    app: $componentName
    circleci.com/component-name: $componentName
    circleci.com/version: $version
spec:
  replicas: 2
  selector:
    matchLabels:
      app: $componentName
  template:
    metadata:
      labels:
        app: $componentName
        circleci.com/component-name: $componentName
        circleci.com/version: $version
    spec:
      containers:
      - name: $componentName
        image: ghcr.io/ruhdevops/yt-studio:$version
        ports:
        - containerPort: 3000
          name: http
        env:
        - name: NODE_ENV
          value: "production"
        - name: PORT
          value: "3000"
        livenessProbe:
          httpGet:
            path: /
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 5
---
apiVersion: v1
kind: Service
metadata:
  name: $componentName-service
  namespace: $namespace
  labels:
    circleci.com/component-name: $componentName
spec:
  selector:
    app: $componentName
  ports:
  - protocol: TCP
    port: 80
    targetPort: 3000
  type: ClusterIP
"@

# Save YAML file
$yamlPath = "k8s-deployment.yaml"
$deploymentYaml | Out-File -FilePath $yamlPath -Encoding utf8
Write-Host "✅ Generated $yamlPath" -ForegroundColor Green

# Step 4: Apply to Kubernetes cluster
Write-Host "`n🚀 Step 4: Apply to Kubernetes cluster" -ForegroundColor Yellow

# Check if kubectl is available
$kubectlExists = Get-Command kubectl -ErrorAction SilentlyContinue
if (-not $kubectlExists) {
    Write-Host "❌ kubectl not found! Install Kubernetes CLI first." -ForegroundColor Red
    Write-Host "📥 Download: https://kubernetes.io/docs/tasks/tools/" -ForegroundColor Cyan
    exit 1
}

# Apply the deployment
Write-Host "Applying $yamlPath..." -ForegroundColor Yellow
kubectl apply -f $yamlPath

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Deployment applied successfully!" -ForegroundColor Green
} else {
    Write-Host "❌ Failed to apply deployment" -ForegroundColor Red
}

# Step 5: Verify deployment
Write-Host "`n🔍 Step 5: Verifying deployment" -ForegroundColor Yellow

Write-Host "`n📊 Deployment status:" -ForegroundColor Cyan
kubectl get deployment $componentName -n $namespace

Write-Host "`n📊 Pods status:" -ForegroundColor Cyan
kubectl get pods -n $namespace -l app=$componentName

Write-Host "`n📊 Services:" -ForegroundColor Cyan
kubectl get svc -n $namespace -l circleci.com/component-name=$componentName

# Step 6: Check CircleCI labels
Write-Host "`n🏷️ Step 6: Verifying CircleCI labels" -ForegroundColor Yellow

Write-Host "Checking deployment labels..." -ForegroundColor Cyan
kubectl get deployment $componentName -n $namespace -o json | Select-String "circleci.com"

# Step 7: Create verification script
Write-Host "`n📝 Step 7: Creating verification script" -ForegroundColor Yellow

$verifyScript = @'
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
'@

$verifyScript | Out-File -FilePath "verify-circleci.ps1" -Encoding utf8
Write-Host "✅ Created verify-circleci.ps1" -ForegroundColor Green

# Step 8: Check CircleCI Deploys
Write-Host "`n" + ("=" * 50) -ForegroundColor Cyan
Write-Host "✅ SETUP COMPLETE!" -ForegroundColor Green
Write-Host ("=" * 50) -ForegroundColor Cyan

Write-Host @"

📋 Files Created:
---------------
1. k8s-deployment.yaml - Kubernetes deployment manifest
2. verify-circleci.ps1 - Verification script

🔗 Next Steps:
-------------
1. Verify deployment: ./verify-circleci.ps1
2. Check CircleCI Deploys: https://app.circleci.com/deploys
3. If components don't appear, wait 5-10 minutes for CircleCI to sync

📌 Important Notes:
----------------
- CircleCI labels are case-sensitive
- Component name must be unique across namespace
- Both metadata and template labels must match exactly

"@

# Optional: Open CircleCI deploys page
$openBrowser = Read-Host "`nOpen CircleCI Deploys page? (y/n)"
if ($openBrowser -eq 'y') {
    Start-Process "https://app.circleci.com/deploys/github/ruhdevops"
}