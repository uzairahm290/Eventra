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

## Additional Notes
- Make sure both frontend and backend are running for full functionality.
- For production builds, use `npm run build` (frontend) and `dotnet publish` (backend).

---

## License
MIT
