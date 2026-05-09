# run-lint.ps1
Write-Host "Running Ruff linter..." -ForegroundColor Cyan
ruff check . --fix
Write-Host "Running Ruff formatter..." -ForegroundColor Cyan
ruff format .
