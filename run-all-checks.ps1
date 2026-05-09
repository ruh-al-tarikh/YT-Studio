# run-all-checks.ps1
Write-Host "=== Full Quality Check ===" -ForegroundColor Cyan
.\run-lint.ps1
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
.\run-typecheck.ps1
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
.\run-tests.ps1
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
Write-Host "All checks passed!" -ForegroundColor Green
