param()

$ErrorActionPreference = "Stop"

Write-Host ">>> Deploying Backend (Google Apps Script)..." -ForegroundColor Cyan

$BackendDir = Join-Path $PSScriptRoot "..\backend"
Push-Location $BackendDir

try {
    # Check for .clasp.json
    if (-not (Test-Path ".clasp.json")) {
        Write-Warning "File '.clasp.json' not found in backend directory."
        Write-Warning "Please initialize your GAS project first:"
        Write-Warning "  1. cd backend"
        Write-Warning "  2. clasp login"
        Write-Warning "  3. clasp create --type webapp --title 'Your Project Name' (or clasp clone <scriptId>)"
        exit 1
    }

    Write-Host "Pushing code to GAS..."
    # Simply try to push. Clasp will error if not logged in.
    clasp push -f
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Code push successful. Creating new deployment version..."
        # Create a new version and update the 'Head' or specific deploymentId if known.
        # For simplicity in V4, we just create a new deployment description.
        # Ideally we should grab the deploymentId from .clasp.json or config, but 'clasp deploy' creates a new version.
        # Update the existing Production Deployment Found in Config
        # ID: AKfycbxSovG8ZG7zOgh8EMzZOeqsgjStPBBa8LkI1EsJRLVNk-pQryyRL80nkx1oZVU2vE2m2A
        $DeploymentId = "AKfycbxSovG8ZG7zOgh8EMzZOeqsgjStPBBa8LkI1EsJRLVNk-pQryyRL80nkx1oZVU2vE2m2A"
        Write-Host "Updating existing deployment ($DeploymentId)..."
        clasp deploy --deploymentId $DeploymentId --description "Auto-deploy $(Get-Date -Format 'yyyy-MM-dd HH:mm')"
        
        Write-Host "Backend deployment successful!" -ForegroundColor Green
    }
    else {
        throw "Clasp push failed. Please check if you are logged in (clasp login) and have valid script ID."
    }
}
catch {
    Write-Error "Backend deployment failed: $_"
}
finally {
    Pop-Location
}
