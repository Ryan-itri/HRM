param (
    [Parameter(Mandatory=$true)]
    [string]$Message
)

$OutputEncoding = [System.Console]::OutputEncoding = [System.Text.Encoding]::UTF8

Write-Host "Adding all changes..."
git add .
if ($LASTEXITCODE -ne 0) {
    Write-Error "Git add failed"
    exit $LASTEXITCODE
}

Write-Host "Committing with message: $Message"
git commit -m "$Message"
if ($LASTEXITCODE -ne 0) {
    Write-Error "Git commit failed"
    exit $LASTEXITCODE
}

Write-Host "Commit successful!"
