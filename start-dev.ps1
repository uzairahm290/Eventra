<#
  start-dev.ps1
  Simplified development bootstrap (no Docker required):
   - restores dotnet tools & packages
   - applies EF Core migrations to LocalDB
   - runs the backend

  Usage:
    ./start-dev.ps1   (from repo root)
  Afterwards start frontend:
    cd eventra_app; npm install; npm run dev
#>

Write-Host "[Eventra] Starting simplified development setup..."

Set-Location .\eventra_api

Write-Host "[Eventra] Restoring dotnet tools and packages..."
dotnet tool restore
dotnet restore

Write-Host "[Eventra] Applying EF Core migrations to LocalDB..."
dotnet ef database update

Write-Host "[Eventra] Launching backend (Ctrl+C to stop)..."
dotnet run

Write-Host "[Eventra] Seeded dev user: dev@eventra.local / Dev@12345!"
