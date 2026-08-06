# sync-backend.ps1
# Run this script whenever you edit backend PHP files to sync them to XAMPP.
# Usage: Right-click → "Run with PowerShell"  OR  run from terminal: .\sync-backend.ps1

$src = "C:\Users\Tharushi\Downloads\fitzone---gym-management-system\backend"
$dst = "C:\xampp\htdocs\backend"

Write-Host "Syncing backend to XAMPP htdocs..." -ForegroundColor Cyan

# Copy all files recursively, force overwrite
Copy-Item "$src\*" $dst -Recurse -Force

Write-Host "Sync complete!" -ForegroundColor Green
Write-Host "Files are now live at http://localhost/backend/api/" -ForegroundColor Yellow
