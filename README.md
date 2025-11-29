# Eventra

Eventra is a full-stack event management application with a React + Vite frontend and an ASP.NET Core backend API.

## Repository

GitHub: [uzairahm290/Eventra](https://github.com/uzairahm290/Eventra.git)

## Cloning the Repository

Clone the repository using:

```sh
git clone https://github.com/uzairahm290/Eventra.git
```

## Project Structure

- `eventra_app/` - Frontend (React + Vite)
- `eventra_api/` - Backend (ASP.NET Core Web API)

---


## Frontend Setup (`eventra_app`)

### Prerequisites
- Node.js (v18+ recommended)
- npm (comes with Node.js)

### Installation

1. Navigate to the frontend directory:
   ```sh
   cd eventra_app
   ```
2. Install dependencies:
   ```sh
   npm install
   ```
3. Start the development server:
   ```sh
   npm run dev
   ```
4. Open [http://localhost:5173](http://localhost:5173) in your browser.

#### API Proxy Configuration
The frontend is configured to proxy API requests to the backend at `https://localhost:7079` (see `vite.config.ts`). This matches the default HTTPS port used by the backend when running in Visual Studio.

---


## Backend Setup (`eventra_api`)

### Prerequisites
- .NET 8 SDK
- Visual Studio 2022 or later

### Running with Visual Studio
1. Open the `eventra_api.sln` solution file in Visual Studio.
2. Restore NuGet packages if prompted.
3. Press `F5` to build and run the API (or click the "Start" button).
4. The API will be available at [http://localhost:7079](http://localhost:7079) or as configured in `launchSettings.json`.

### Running with Command Line (Optional)
1. Navigate to the backend directory:
   ```sh
   cd eventra_api
   ```
2. Restore dependencies:
   ```sh
   dotnet restore
   ```
3. Run the API:
   ```sh
   dotnet run
   ```
4. The API will be available at [http://localhost:7079](http://localhost:7079) or as configured in `launchSettings.json`.

---

## Environment Configuration

- Frontend: Edit environment variables in `.env` (if present).
- Backend: Configure settings in `appsettings.json` and `appsettings.Development.json`.

---

## Database setup (development)

To make it easy for team members to run the database locally, this project includes a Docker Compose configuration that starts a SQL Server container and uses the development connection string in `eventra_api/appsettings.Development.json`.

1) Start the database with Docker Compose (requires Docker Desktop):

```powershell
# From repository root
docker compose up -d

# Verify the SQL Server container is healthy
docker compose ps
```

2) The development connection string (already added to `eventra_api/appsettings.Development.json`) points to the container:

```
Server=localhost,1433;Database=EventraDB;User Id=sa;Password=Your_password123;TrustServerCertificate=True;
```

3) Run EF Core migrations to create the database schema:

```powershell
cd eventra_api
dotnet tool restore
dotnet ef database update
# If EF tools are not installed globally, install the dotnet-ef tool:
# dotnet tool install --global dotnet-ef
```

4) Start the backend (in Visual Studio or `dotnet run`) and then the frontend. The app will connect to the local Docker SQL Server instance.

Notes:
- The chosen SA password `Your_password123` is an example. If you change it in `docker-compose.yml`, update `appsettings.Development.json` accordingly or set the `ConnectionStrings__DefaultConnection` environment variable when running the API.
- If your team prefers SQLite for development (no Docker required), let me know and I can add an alternative SQLite configuration and migration guidance.

### Seeded development data

When running in `Development` mode this app will automatically apply migrations and seed a small set of development data (admin user + sample events). The seeded admin credentials are:

- Email: `dev@eventra.local`
- Username: `devadmin`
- Password: `Dev@12345!`

Use the above credentials to sign in immediately after you start the API and frontend.

---

## Additional Notes
- Make sure both frontend and backend are running for full functionality.
- For production builds, use `npm run build` (frontend) and `dotnet publish` (backend).

---

## License
MIT
