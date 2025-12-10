param()

$ErrorActionPreference = "Stop"

Write-Host ">>> Deploying Frontend (GitHub Pages)..." -ForegroundColor Cyan

$FrontendDir = Join-Path $PSScriptRoot "..\frontend"
Push-Location $FrontendDir

try {
    Write-Host "Building project..."
    npm run build
    if ($LASTEXITCODE -ne 0) { throw "Build failed." }

    Write-Host "Cleaning gh-pages cache..."
    if (Test-Path "node_modules\.cache\gh-pages") {
        Remove-Item -Recurse -Force "node_modules\.cache\gh-pages"
    }

    Write-Host "Publishing to gh-pages (Target: Ryan-itri/HRM)..."
    # Explicitly deploy to the specific repository for Pages
    npx gh-pages -d dist --repo https://github.com/Ryan-itri/HRM.git
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Frontend deployment successful!" -ForegroundColor Green
    }
    else {
        throw "Deployment failed."
    }
}
catch {
    Write-Error "Frontend deployment failed: $_"
}
finally {
    Pop-Location
}
