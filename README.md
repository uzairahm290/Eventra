# Eventra

Marquee & wedding hall management SaaS for Pakistani businesses. Manage Marques (venues), Halls, Bookings, Clients, Workers, Attendance, Menus, and Events from one dashboard.

**Stack:** React 19 + TypeScript + Tailwind CSS v4 + Vite 7 (frontend) · ASP.NET Core 8 + EF Core + SQLite (backend)

---

## Quick Start

Open two terminals:

**Terminal 1 — Backend API**
```bash
cd eventra_api
dotnet run
# API starts at http://localhost:5152
```

**Terminal 2 — Frontend**
```bash
cd eventra_app
npm install   # first time only
npm run dev
# App starts at http://localhost:5173
```

Open **http://localhost:5173** in your browser. The frontend proxies all `/api/*` requests to the backend automatically.

---

## Seeded Login Credentials

Demo credentials are stored in `.env.example` at the project root. Copy it to `.env` for local use:

```bash
cp .env.example .env
```

The Owner account has full access to all venues. Each Manager account is scoped to their assigned Marque.

---

## Seeded Demo Data

The database is auto-seeded on first run with realistic Pakistani marquee data:

- **3 Marques (Venues)** — Lahore, Karachi, Islamabad
- **9 Halls** — Main Banquet Hall, Mehndi Lawn, VIP Lounge per venue
- **30 Workers** — 10 per venue (cooks, waiters, security, cleaners, accountants, drivers) with CNICs
- **15 Clients** — Pakistani names, CNICs, phone numbers
- **8 Events** — Walimas, Mehndi nights, Nikkah, corporate dinners, birthday gala
- **8 Bookings** — Mix of Confirmed / Pending / Cancelled, PKR amounts (₨49K–₨1.44M)
- **Menus** — 5 packages per venue (Silver Walima, Gold Wedding, Mehndi BBQ, Hi-Tea, Vegetarian)
- **Attendance** — Last 7 days for all 30 workers

---

## Project Structure

```
Eventra/
├── eventra_app/          # React + Vite frontend
│   ├── src/
│   │   ├── pages/        # Landing, Dashboard, Events, Bookings, Halls, Workers, Attendance, ...
│   │   ├── components/   # Shared UI components
│   │   ├── services/     # API service functions (api.ts, hallService.ts, ...)
│   │   └── context/      # AuthContext (JWT decode, role-aware)
│   ├── vercel.json       # SPA rewrite rule for Vercel deployment
│   └── vite.config.ts    # Dev proxy: /api → http://localhost:5152
│
└── eventra_api/          # ASP.NET Core 8 Web API
    ├── Controllers/       # Auth, Venues, Halls, Bookings, Clients, Workers, Attendance, Menus, Events, Reports, Upload
    ├── Models/            # EF Core entities + DTOs
    ├── Data/              # AppDbContext + DataSeeder
    ├── Services/          # TokenService, MarqueScopeService
    └── Migrations/        # EF Core SQLite migrations
```

---

## Roles & Permissions

| Action | Owner | Manager |
|--------|-------|---------|
| View/manage all Marques | Yes | Own Marque only |
| Create / delete Marques | Yes | No |
| Create / delete Halls | Yes | Own Marque only |
| Manage Workers & Attendance | Yes | Own Marque only |
| Create / approve Bookings | Yes | Own Marque only |
| Approve Manager registrations | Yes | No |
| View Reports | Yes | Own Marque only |

---

## Environment Variables

### Backend (`eventra_api/appsettings.Development.json`)
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Data Source=EventraDB.db;"
  },
  "Jwt": {
    "Key": "your-secret-key-min-32-chars",
    "Issuer": "EventraAPI",
    "Audience": "EventraApp"
  }
}
```

### Frontend (`eventra_app/.env.local`) — optional
```
VITE_API_BASE_URL=            # leave empty for dev (proxy handles it)
VITE_GOOGLE_CLIENT_ID=        # set to enable Google login button
```

### Production optional features
| Variable | Purpose |
|----------|---------|
| `Cloudinary__CloudName` | Enable Cloudinary image uploads |
| `Cloudinary__ApiKey` | (required with CloudName) |
| `Cloudinary__ApiSecret` | (required with CloudName) |
| `Google__ClientId` | Validate Google ID tokens server-side |
| `AllowedOrigins` | Comma-separated production frontend URLs for CORS |

---

## Prerequisites

| Tool | Version |
|------|---------|
| .NET SDK | 8.0+ |
| Node.js | 18+ |
| npm | 9+ |

---

## Database

SQLite is used in development. The DB file (`EventraDB.db`) is created automatically on first run in the `eventra_api/` directory. No manual migration commands are needed — migrations apply and seeding runs at startup.

To reset the database and re-seed:
```bash
rm eventra_api/EventraDB.db
dotnet run --project eventra_api
```

---

## Deployment

**Frontend → Vercel**
1. Connect the `eventra_app/` directory to a Vercel project.
2. Set `VITE_API_BASE_URL` to your backend URL.
3. `vercel.json` already includes the SPA rewrite rule.

**Backend → Any host supporting .NET 8**
```bash
cd eventra_api
dotnet publish -c Release -o ./publish
```
Set production env vars: `Jwt__Key`, `ConnectionStrings__DefaultConnection`, `AllowedOrigins`.

---

## Repository

GitHub: [uzairahm290/Eventra](https://github.com/uzairahm290/Eventra.git)

```bash
git clone https://github.com/uzairahm290/Eventra.git
```

---

## License

MIT


Role	Email	Password
Owner	owner@eventra.pk	Owner@12345!
Manager (Al-Noor, Lahore)	ali.manager@eventra.pk	Manager@12345!
Manager (Pearl Continental, Karachi)	sara.manager@eventra.pk	Manager@12345!
Manager (Rawal Garden, Islamabad)	usman.manager@eventra.pk	Manager@12345!
Data seeded: