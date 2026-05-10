# generate-circleci-config.ps1 (fixed)
# Run this from your repository root.

$ErrorActionPreference = "Stop"

Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║     CircleCI Config Generator (TypeScript SDK)            ║" -ForegroundColor Green
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan

# Step 1: Ensure Node.js and npm are available
$nodeVersion = node --version 2>$null
if (-not $nodeVersion) {
    Write-Host "❌ Node.js is not installed." -ForegroundColor Red
    exit 1
}
Write-Host "✅ Node.js version: $nodeVersion" -ForegroundColor Green

# Step 2: Create .circleci folder
$circleciDir = ".circleci"
if (-not (Test-Path $circleciDir)) {
    New-Item -ItemType Directory -Path $circleciDir -Force | Out-Null
    Write-Host "📁 Created '$circleciDir' directory" -ForegroundColor Yellow
}

# Step 3: Ensure there is a package.json (if not present)
$pkgPath = "package.json"
if (-not (Test-Path $pkgPath)) {
    Write-Host "📦 No package.json found. Creating minimal one..." -ForegroundColor Yellow
    '{"name": "circleci-gen", "version": "1.0.0", "private": true}' | Out-File -FilePath $pkgPath -Encoding UTF8
}

# Step 4: Install the CircleCI SDK (if not already)
$sdkPackage = "@circleci/circleci-config-sdk"
$installed = npm list --depth=0 2>$null | Select-String $sdkPackage
if (-not $installed) {
    Write-Host "📦 Installing $sdkPackage ..." -ForegroundColor Yellow
    npm install --save-dev $sdkPackage
    Write-Host "✅ SDK installed" -ForegroundColor Green
} else {
    Write-Host "✅ SDK already installed" -ForegroundColor Green
}

# Step 5: Write the correct generator script
$generatorScript = @'
// generate-config.js
const CircleCI = require('@circleci/circleci-config-sdk');

// Instantiate new Config
const myConfig = new CircleCI.Config();

// Create a workflow
const myWorkflow = new CircleCI.Workflow('myWorkflow');
myConfig.addWorkflow(myWorkflow);

// Define an executor (Docker image) – use the correct path
const nodeExecutor = new CircleCI.executors.DockerExecutor('cimg/node:lts');

// Create a job
const nodeTestJob = new CircleCI.Job('node-test', nodeExecutor);
myConfig.addJob(nodeTestJob);

// Add steps to the job
nodeTestJob
  .addStep(new CircleCI.commands.Checkout())
  .addStep(new CircleCI.commands.Run({
    command: 'npm install',
    name: 'NPM Install'
  }))
  .addStep(new CircleCI.commands.Run({
    command: 'npm run test',
    name: 'Run tests'
  }));

// Add the job to the workflow
myWorkflow.addJob(nodeTestJob);

// Write the config file
myConfig.writeFile('.circleci/config.yml');
console.log('✅ CircleCI config written to .circleci/config.yml');
'@

$scriptPath = "generate-config.js"
$generatorScript | Out-File -FilePath $scriptPath -Encoding UTF8
Write-Host "📝 Created generator script: $scriptPath" -ForegroundColor Yellow

# Step 6: Run the generator
Write-Host "🚀 Generating CircleCI config..." -ForegroundColor Cyan
node $scriptPath

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Success! Config file is at: .circleci/config.yml" -ForegroundColor Green
    Write-Host "You can now commit and push this configuration." -ForegroundColor Yellow
} else {
    Write-Host "❌ Generation failed. Check the error messages above." -ForegroundColor Red
    exit 1
}