# build-automation.ps1 - Complete build automation suite
param(
    [ValidateSet("install", "dev", "build", "test", "watch", "clean", "all")]
    [string]$Command = "dev",
    
    [switch]$Verbose
)

$ErrorActionPreference = "Stop"

# Colors
$Green = "Green"
$Cyan = "Cyan"
$Yellow = "Yellow"
$Red = "Red"

function Write-Step {
    param([string]$Message)
    Write-Host "`n════════════════════════════════════════════════════════════" -ForegroundColor $Cyan
    Write-Host "▶ $Message" -ForegroundColor $Yellow
    Write-Host "════════════════════════════════════════════════════════════" -ForegroundColor $Cyan
}

function Write-Success {
    param([string]$Message)
    Write-Host "✓ $Message" -ForegroundColor $Green
}

function Install-Dependencies {
    Write-Step "Installing dependencies"
    
    $packages = @(
        "concurrently",
        "npm-run-all",
        "nodemon",
        "chokidar-cli",
        "esbuild",
        "tsup",
        "rimraf",
        "cross-env"
    )
    
    foreach ($pkg in $packages) {
        Write-Host "Installing: $pkg" -ForegroundColor Gray
        npm install --save-dev $pkg 2>&1 | Out-Null
        if ($LASTEXITCODE -eq 0) {
            Write-Success "Installed $pkg"
        }
    }
}

function Start-DevServer {
    Write-Step "Starting development environment"
    
    # Update package.json with scripts
    if (Test-Path "package.json") {
        $package = Get-Content "package.json" -Raw | ConvertFrom-Json
        
        if (-not $package.scripts) {
            $package | Add-Member -MemberType NoteProperty -Name "scripts" -Value @{}
        }
        
        # Add scripts if they don't exist
        if (-not $package.scripts.dev) {
            $package.scripts | Add-Member -MemberType NoteProperty -Name "dev" -Value "concurrently `"npm run dev:css`" `"npm run dev:js`" `"npm run dev:server`""
        }
        if (-not $package.scripts."dev:css") {
            $package.scripts | Add-Member -MemberType NoteProperty -Name "dev:css" -Value "sass --watch src/styles:dist/css"
        }
        if (-not $package.scripts."dev:js") {
            $package.scripts | Add-Member -MemberType NoteProperty -Name "dev:js" -Value "esbuild src/index.js --bundle --outfile=dist/bundle.js --watch"
        }
        if (-not $package.scripts."dev:server") {
            $package.scripts | Add-Member -MemberType NoteProperty -Name "dev:server" -Value "nodemon server.js"
        }
        if (-not $package.scripts.build) {
            $package.scripts | Add-Member -MemberType NoteProperty -Name "build" -Value "npm-run-all clean build:css build:js"
        }
        if (-not $package.scripts."build:css") {
            $package.scripts | Add-Member -MemberType NoteProperty -Name "build:css" -Value "sass src/styles:dist/css --style=compressed"
        }
        if (-not $package.scripts."build:js") {
            $package.scripts | Add-Member -MemberType NoteProperty -Name "build:js" -Value "esbuild src/index.js --bundle --outfile=dist/bundle.js --minify"
        }
        if (-not $package.scripts.clean) {
            $package.scripts | Add-Member -MemberType NoteProperty -Name "clean" -Value "rimraf dist"
        }
        if (-not $package.scripts.test) {
            $package.scripts | Add-Member -MemberType NoteProperty -Name "test" -Value "jest"
        }
        
        # Save package.json
        $package | ConvertTo-Json -Depth 10 | Out-File "package.json" -Encoding UTF8
        Write-Success "Updated package.json with build scripts"
    }
    
    # Start dev server
    npm run dev
}

function Start-Build {
    Write-Step "Building production bundle"
    
    # Clean
    if (Test-Path "dist") {
        Remove-Item -Path "dist" -Recurse -Force
        Write-Success "Cleaned dist directory"
    }
    
    # Run build
    npm run build
    
    if (Test-Path "dist") {
        $size = (Get-ChildItem "dist" -Recurse | Measure-Object -Property Length -Sum).Sum / 1KB
        Write-Success "Build complete! Size: $([math]::Round($size, 2)) KB"
    }
}

function Start-Test {
    Write-Step "Running tests"
    
    if (Test-Path "package.json") {
        $package = Get-Content "package.json" -Raw | ConvertFrom-Json
        if ($package.scripts.test) {
            npm test
        } else {
            Write-Host "No test script found in package.json" -ForegroundColor $Yellow
        }
    } else {
        Write-Host "No package.json found" -ForegroundColor $Red
    }
}

function Start-Watch {
    Write-Step "Watching for file changes"
    
    # Create watch configuration
    $watchConfig = @'
{
  "watch": ["src"],
  "ext": "js,ts,jsx,tsx,css,scss",
  "ignore": ["node_modules", "dist"],
  "delay": 1000,
  "events": {
    "change": "npm run build"
  }
}
'@
    $watchConfig | Out-File -FilePath "nodemon-build.json" -Encoding UTF8
    
    # Start watcher
    if (Get-Command nodemon -ErrorAction SilentlyContinue) {
        nodemon --config nodemon-build.json
    } else {
        Write-Host "nodemon not installed. Run: npm install --save-dev nodemon" -ForegroundColor $Red
    }
}

function Start-Clean {
    Write-Step "Cleaning project"
    
    $dirsToClean = @("dist", "build", ".cache", "coverage", "node_modules/.cache")
    
    foreach ($dir in $dirsToClean) {
        if (Test-Path $dir) {
            Remove-Item -Path $dir -Recurse -Force
            Write-Success "Removed: $dir"
        }
    }
}

# Main execution
Clear-Host
Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor $Cyan
Write-Host "║         BUILD & DEVELOPMENT AUTOMATION TOOLS               ║" -ForegroundColor $Green
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor $Cyan

switch ($Command) {
    "install" { Install-Dependencies }
    "dev" { Start-DevServer }
    "build" { Start-Build }
    "test" { Start-Test }
    "watch" { Start-Watch }
    "clean" { Start-Clean }
    "all" {
        Install-Dependencies
        Start-Clean
        Start-Build
        Start-Test
        Write-Host "`n✅ All tasks completed!" -ForegroundColor $Green
    }
    default {
        Write-Host "Usage: .\build-automation.ps1 -Command <command>" -ForegroundColor $Yellow
        Write-Host "Commands: install, dev, build, test, watch, clean, all" -ForegroundColor Gray
    }
}