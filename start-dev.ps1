<#
  start-dev.ps1
  Helper script to bootstrap development environment:
   - starts Docker Compose (SQL Server)
   - restores dotnet tools and packages
   - applies EF migrations (creates DB)

  Usage: run from repository root in PowerShell with admin rights if needed
    ./start-dev.ps1
#>

Write-Host "Starting development environment setup..."

# 1) Start database
Write-Host "Bringing up Docker Compose services..."
docker compose up -d

Write-Host "Waiting a few seconds for SQL Server to initialize..."
Start-Sleep -Seconds 8

# 2) Restore dotnet tools and packages
Write-Host "Restoring dotnet tools and packages..."
cd .\eventra_api
dotnet tool restore
dotnet restore

# 3) Apply EF Core migrations
Write-Host "Applying EF Core migrations (this will create the database)..."
dotnet ef database update

Write-Host "Bootstrap complete. Next steps:"
Write-Host " - Start the backend: open eventra_api in Visual Studio or run 'dotnet run' inside eventra_api folder"
Write-Host " - Start the frontend: 'cd eventra_app' then 'npm install' and 'npm run dev'"

Write-Host "You can now sign in with the seeded dev user: dev@eventra.local / Dev@12345!"
