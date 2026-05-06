<#
.SYNOPSIS
    Automated cleanup script for YT-Studio project
.DESCRIPTION
    Identifies original project files and removes unwanted files/folders
    Creates backup before deletion
.WARNING
    This script removes files permanently. Review the list before confirming.
#>

param(
    [switch]$DryRun = $false,  # Set to $true to preview without deleting
    [switch]$SkipBackup = $false  # Skip backup creation
)

$projectRoot = "C:\Projects\MyRepo\YT-Studio"
Set-Location $projectRoot

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "YT-STUDIO PROJECT CLEANUP SCRIPT" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# ============================================
# ORIGINAL PROJECT FILES (Keep These)
# ============================================
$keepFiles = @(
    # Core Frontend
    "index.html",
    "css/style.css",
    "js/app.js",
    "js/ai.js",
    "js/dashboard.js",
    "js/islamic.js",
    "js/planner.js",
    "js/repurpose.js",
    "js/research.js",
    "js/seo.js",
    "js/voice.js",
    "js/versioning.js",
    
    # Config Files
    "package.json",
    "pnpm-lock.yaml",
    "tsconfig.json",
    "vite.config.js",
    "wrangler.jsonc",
    "worker-configuration.d.ts",
    "firebase.json",
    "firestore.rules",
    "firestore.indexes.json",
    "storage.rules",
    ".node-version",
    ".gitignore",
    
    # Backend
    "src/worker.ts",
    "server.js",
    
    # Documentation
    "README.md",
    "WEBSITE_ANALYSIS.md",
    "AGENTS.md",
    
    # Deployment
    "Dockerfile",
    "docker-compose.yml",
    "sitemap.xml",
    
    # Workflows (keep working ones)
    ".github/workflows/opencode.yml",
    ".github/workflows/youtube-stats.yml",
    
    # Public assets
    "public/data/demo.json",
    "public/index.html",
    
    # Dist (build output - keep if needed)
    "dist/"
)

# ============================================
# FILES TO DELETE (Unwanted)
# ============================================
$deleteItems = @(
    # Temporary/Duplicate files
    "clean_tree.txt",
    "directory_tree.html",
    "directory_tree.txt",
    "project_structure_clean.txt",
    "tree.txt",
    "*.tmp",
    "*.log",
    "*.pyc",
    
    # Broken/Backup files
    "js/app.js.broken",
    "css_updates.css",
    "optimize-report.md",
    "test.md",
    
    # PowerShell scripts (optional - keep if you need them)
    "setup-preview-workflow.ps1",
    "setup-wif.ps1",
    "setup-youtube-workflow.ps1",
    
    # Gemini session cache
    "gemini-session.json",
    
    # Function directories (not actively used)
    "functions/",
    "my-workflow/",
    "yt-proxy/",
    
    # Node modules (can reinstall)
    "node_modules/",
    
    # Python cache
    "__pycache__/",
    
    # Vercel output (build cache)
    ".vercel/",
    
    # PNPM store (can be regenerated)
    ".pnpm-store/"
)

# ============================================
# CREATE BACKUP
# ============================================
if (-not $SkipBackup -and -not $DryRun) {
    $backupDir = "..\YT-Studio-Backup-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
    Write-Host "📦 Creating backup at: $backupDir" -ForegroundColor Yellow
    Copy-Item -Path $projectRoot -Destination $backupDir -Recurse -Force
    Write-Host "✓ Backup created" -ForegroundColor Green
    Write-Host ""
}

# ============================================
# DRY RUN - Preview what will be deleted
# ============================================
if ($DryRun) {
    Write-Host "🔍 DRY RUN MODE - No files will be deleted" -ForegroundColor Yellow
    Write-Host "================================================" -ForegroundColor Yellow
    Write-Host ""
    
    $totalSize = 0
    $foundItems = @()
    
    foreach ($item in $deleteItems) {
        $found = Get-ChildItem -Path $item -ErrorAction SilentlyContinue
        if ($found) {
            $size = (Get-ChildItem -Path $item -Recurse -ErrorAction SilentlyContinue | Measure-Object -Property Length -Sum).Sum
            $totalSize += $size
            $foundItems += $found
            Write-Host "  📄 $item" -ForegroundColor Red
        }
    }
    
    Write-Host ""
    Write-Host "📊 Summary:" -ForegroundColor Cyan
    Write-Host "   Files to delete: $($foundItems.Count)" -ForegroundColor Yellow
    Write-Host "   Space to free: $([math]::Round($totalSize/1MB, 2)) MB" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Run without -DryRun to actually delete" -ForegroundColor Green
    exit 0
}

# ============================================
# CONFIRM DELETE
# ============================================
Write-Host "⚠️  WARNING: This will permanently delete files!" -ForegroundColor Red
Write-Host ""
$confirm = Read-Host "Type 'DELETE' to confirm deletion"

if ($confirm -ne "DELETE") {
    Write-Host "❌ Cancelled" -ForegroundColor Red
    exit 1
}

# ============================================
# DELETE UNWANTED FILES
# ============================================
Write-Host ""
Write-Host "🗑️  Deleting unwanted files..." -ForegroundColor Yellow
Write-Host ""

$deletedCount = 0

foreach ($item in $deleteItems) {
    if (Test-Path $item) {
        try {
            Remove-Item -Path $item -Recurse -Force -ErrorAction Stop
            Write-Host "  ✓ Deleted: $item" -ForegroundColor Green
            $deletedCount++
        }
        catch {
            Write-Host "  ✗ Failed: $item - $_" -ForegroundColor Red
        }
    }
}

# ============================================
# REINSTALL DEPENDENCIES (Optional)
# ============================================
Write-Host ""
$reinstall = Read-Host "Reinstall dependencies? (y/n)"
if ($reinstall -eq 'y') {
    Write-Host "📦 Reinstalling dependencies..." -ForegroundColor Yellow
    
    # Check if using pnpm or npm
    if (Test-Path "pnpm-lock.yaml") {
        Write-Host "   Using pnpm..." -ForegroundColor Gray
        pnpm install
    } else {
        Write-Host "   Using npm..." -ForegroundColor Gray
        npm install
    }
    Write-Host "✓ Dependencies reinstalled" -ForegroundColor Green
}

# ============================================
# CLEAN GIT
# ============================================
Write-Host ""
$cleanGit = Read-Host "Clean git ignored files? (y/n)"
if ($cleanGit -eq 'y') {
    Write-Host "🧹 Cleaning git ignored files..." -ForegroundColor Yellow
    git clean -fdX
    Write-Host "✓ Git clean complete" -ForegroundColor Green
}

# ============================================
# SUMMARY
# ============================================
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "✅ CLEANUP COMPLETE!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "📊 Summary:" -ForegroundColor Yellow
Write-Host "   Items deleted: $deletedCount" -ForegroundColor White
Write-Host ""
Write-Host "📁 Remaining project structure:" -ForegroundColor Yellow
lsd --tree --depth 1 --icon=never --color=never

Write-Host ""
Write-Host "🎯 To verify your project works:" -ForegroundColor Cyan
Write-Host "   npm run dev" -ForegroundColor White
Write-Host "   or" -ForegroundColor White
Write-Host "   pnpm dev" -ForegroundColor White