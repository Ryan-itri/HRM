param()

$ErrorActionPreference = "Stop"

$ScriptDir = $PSScriptRoot

Write-Host "==========================================" -ForegroundColor Magenta
Write-Host "   Automated Deployment System (V4.0)     " -ForegroundColor Magenta
Write-Host "==========================================" -ForegroundColor Magenta

# Deploy Backend
& "$ScriptDir\deploy_backend.ps1"
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

# Deploy Frontend
& "$ScriptDir\deploy_frontend.ps1"
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host "`nAll deployments completed successfully!" -ForegroundColor Green
Write-Host "--------------------------------------------------" -ForegroundColor Cyan
Write-Host "Frontend URL: https://Ryan-itri.github.io/HRM/" -ForegroundColor Cyan
Write-Host "--------------------------------------------------" -ForegroundColor Cyan
