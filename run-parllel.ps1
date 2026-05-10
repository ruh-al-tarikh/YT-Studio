# run-parallel.ps1 - Run multiple development scripts simultaneously
param(
    [string]$Mode = "dev"
)

$scripts = @{
    "dev" = @(
        "npm run watch:css",
        "npm run watch:js",
        "npm run serve"
    )
    "build" = @(
        "npm run build:css",
        "npm run build:js",
        "npm run build:assets"
    )
    "test" = @(
        "npm run test:unit",
        "npm run test:integration",
        "npm run lint"
    )
}

if ($scripts.ContainsKey($Mode)) {
    $cmd = "concurrently " + ($scripts[$Mode] -join " ")
    Write-Host "Running: $cmd" -ForegroundColor Cyan
    Invoke-Expression $cmd
} else {
    Write-Host "Available modes: dev, build, test" -ForegroundColor Yellow
}