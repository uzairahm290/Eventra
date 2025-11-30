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
The frontend proxies API requests to the backend at `http://localhost:5152` (see `vite.config.ts`). We now use the HTTP profile for simplicity. If you run the HTTPS profile the backend will also be available at `https://localhost:7079`, but the frontend proxy targets the HTTP port.

---


## Backend Setup (`eventra_api`)

### Prerequisites
- Visual Studio 2022 (latest) with the "ASP.NET and web development" workload
- .NET 8 SDK (installed automatically by VS if selected)

### Run the Backend (Visual Studio Only)
1. Open the solution: `eventra_api/eventra_api.sln` in Visual Studio.
2. VS automatically restores all NuGet packages on load (no CLI needed).
3. Press `F5` (Debug) or `Ctrl+F5` (Run without debug).
4. The API starts on `http://localhost:5152` (HTTP profile). An HTTPS endpoint (`https://localhost:7079`) also exists but is not used by the frontend proxy.

### Database & Migrations
The first run automatically applies EF Core migrations and seeds development data (admin user + sample events). No manual `dotnet ef` commands are required when using Visual Studio.

Development connection string (LocalDB):
```
Server=(localdb)\\MSSQLLocalDB;Database=EventraDB;Trusted_Connection=True;TrustServerCertificate=True;
```

If you need to add a new migration later:
1. Open the Package Manager Console in Visual Studio.
2. Set Default Project to `eventra_api`.
3. Run:
```
Add-Migration YourMigrationName
Update-Database
```

### NuGet Package Consistency
All developers use the same package versions defined in `eventra_api.csproj`. Visual Studio handles restore automatically. To enforce locked versions across the team you can (optional):
1. Enable package lock: add `<RestorePackagesWithLockFile>true</RestorePackagesWithLockFile>` to a `Directory.Build.props` or create a `packages.lock.json` by running a restore once.
2. Commit the generated `packages.lock.json` file.

This ensures reproducible restores without needing CLI scripts.

---

## Environment Configuration

- Frontend: Edit environment variables in `.env` (if present).
- Backend: Configure settings in `appsettings.json` and `appsettings.Development.json`.

---

## Frontend & Backend Startup Flow

1. Start backend via Visual Studio (`F5`).
2. In another terminal start frontend:
   ```powershell
   cd eventra_app
   npm install
   npm run dev
   ```
3. Sign in using seeded development admin credentials.

### Seeded Development Data

When running in `Development` mode this app will automatically apply migrations and seed a small set of development data (admin user + sample events). The seeded admin credentials are:

- Email: `dev@eventra.local`
- Username: `devadmin`
- Password: `Dev@12345!`

Use these credentials to sign in after starting the API and frontend.

---

## Additional Notes
- Make sure both frontend and backend are running for full functionality.
- For production builds, use `npm run build` (frontend) and `dotnet publish` (backend).

---

## License
MIT
