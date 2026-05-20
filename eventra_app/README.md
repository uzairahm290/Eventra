# Eventra — Frontend

React 19 + TypeScript + Tailwind CSS v4 + Vite 7 frontend for the Eventra marquee management platform.

## Development

```bash
npm install
npm run dev       # http://localhost:5173
```

API calls are proxied to `http://localhost:5152` via `vite.config.ts` — no CORS configuration needed in development.

## Build

```bash
npm run build     # outputs to dist/
npm run preview   # preview the production build locally
```

## Environment Variables

Create `.env.local` for local overrides (not committed):

```
VITE_API_BASE_URL=            # empty = use /api proxy in dev
VITE_GOOGLE_CLIENT_ID=        # enables Google sign-in button
```

## Key Pages

| Route | Page |
|-------|------|
| `/` | Landing page |
| `/login` | Login |
| `/register` | Register |
| `/dashboard` | Dashboard (role-aware stats) |
| `/events` | Events |
| `/venues` | Marques (venues) |
| `/halls` | Halls |
| `/bookings` | Bookings |
| `/clients` | Clients |
| `/workers` | Workers |
| `/attendance` | Attendance |
| `/menus` | Menus |
| `/reports` | Reports |

See the [root README](../README.md) for full project setup and credentials.
