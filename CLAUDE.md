# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Smart Service Flow** is a government queue management system for Nepal. Citizens request digital queue tokens for services (citizenship, passport, land registry, etc.), monitor live queue status, and visit offices only when their turn is near. Staff authenticate separately and manage queues.

The project is a monorepo with two independent apps:
- `client/` — React 19 + TypeScript + Vite + Tailwind CSS v4 (PWA-enabled)
- `server/` — Express 5 + TypeScript (ESM), run via `tsx`

No database is connected yet — all data (users, OTPs, queue state) is in-memory and resets on server restart.

## Commands

### Client (run from `client/`)
```bash
npm run dev       # Vite dev server → http://localhost:5173
npm run build     # tsc -b && vite build
npm run lint      # eslint
npm run preview   # preview production build
```

### Server (run from `server/`)
```bash
npm run dev       # tsx watch src/server.ts → http://localhost:5000
npm run build     # tsc (outputs to dist/)
npm start         # node dist/server.js (production)
```

No tests are configured yet (`npm test` exits with error in both packages).

## Environment Variables

Copy `.env.example` to `.env` in each package before running.

**`server/.env`**
```
PORT=5000
CLIENT_URL=http://localhost:5173
NODE_ENV=development
DATABASE_URL=           # not yet used
JWT_SECRET=             # not yet used
JWT_EXPIRES_IN=7d
OTP_EXPIRES_MINUTES=5
OTP_MAX_ATTEMPTS=5
```

**`client/.env`**
```
VITE_API_BASE_URL=http://localhost:5000/api
```

## Architecture

### Client Structure

```
client/src/
├── routes/AppRoutes.tsx     # All routes defined here (BrowserRouter)
├── layouts/
│   ├── AuthLayout.tsx       # Wraps auth pages; same header as MainLayout
│   └── MainLayout.tsx       # Main shell with header + nav pill for token routes
├── pages/
│   ├── Home.tsx             # Landing page — entry point for citizens, staff, QR display
│   ├── auth/                # Login, Register, CitizenOTP, StaffRegister, ForgotPassword, ResetPassword, VerifyPhone
│   └── token/               # QRScanner, ServiceSelection, TokenGeneration, TokenDisplay, Monitor
├── components/
│   ├── ui/                  # Reusable: Button, Card, Input, PasswordInput (barrel exported from ui/index.ts)
│   └── LanguageSwitcher.tsx
├── services/
│   ├── api.ts               # Axios instance — reads VITE_API_BASE_URL
│   └── health.ts            # Health check helper
└── i18n/
    ├── index.ts             # i18next setup; persists language choice in localStorage
    ├── en/common.json       # English strings
    └── ne/common.json       # Nepali strings
```

**Key patterns:**
- Pages import `MainLayout` or `AuthLayout` for consistent chrome
- All i18n strings are namespaced in `common.json` under `common`, `auth`, `home`, `token`
- `useTranslation()` hook from `react-i18next` is used throughout
- TanStack Query (`@tanstack/react-query`) is installed but not yet wired with a `QueryClientProvider`
- Token flows (`/token/*`) are **public** — no auth guard exists yet

### Server Structure

```
server/src/
├── server.ts                # Entry: loads dotenv, starts Express on PORT
├── app.ts                   # Express app: helmet, cors, routes mounted
├── routes/
│   ├── auth/
│   │   ├── citizen.ts       # POST /api/auth/citizen/send-otp, /verify
│   │   └── staff.ts         # POST /api/auth/staff/register, /login, /verify-otp
│   └── queue.ts             # GET /api/queue/status, /services, /:serviceId
└── services/auth/
    ├── otp.ts               # generateOTP(), deliverOTPToConsole()
    └── otpStore.ts          # In-memory OTP store with expiry (Map-based)
```

**Key patterns:**
- All routes return `{ success: boolean, ... }` JSON
- OTPs print to server stdout — check the console when testing auth flows
- Citizen auth: phone number → OTP → base64 token (not JWT)
- Staff auth: email + password → OTP 2FA → base64 token (not JWT)
- CORS is locked to `CLIENT_URL` env var
- Nepal phone validation: `/^(\+977)?9[6-9]\d{8}$/`

### API Routes Reference

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/health` | Health check |
| POST | `/api/auth/citizen/send-otp` | Send OTP to phone |
| POST | `/api/auth/citizen/verify` | Verify OTP, get token |
| POST | `/api/auth/staff/register` | Register staff account |
| POST | `/api/auth/staff/login` | Login (triggers OTP 2FA) |
| POST | `/api/auth/staff/verify-otp` | Verify 2FA OTP, get token |
| GET | `/api/queue/status` | All services with live-simulated queue numbers |
| GET | `/api/queue/services` | Service list (id + name only) |
| GET | `/api/queue/:serviceId` | Single service queue status |

## Styling & Theme

Tailwind CSS v4 (via `@tailwindcss/vite` plugin — **no** `tailwind.config.js`). The design uses a Finpay/government teal brand:
- `primary-700` — main brand teal (`#0A3A48` area), used for headers, buttons, active states
- `neutral-*` — grays for backgrounds and text
- Subtle SVG grid pattern is rendered as a background on both layout components

Typography uses `font-heading` for titles/labels and default sans for body.

## Production Readiness Notes

Several items are intentionally stubbed for development and need replacing before production:
- **Passwords** stored in plaintext — needs bcrypt
- **Tokens** are base64-encoded strings — needs JWT (`JWT_SECRET` + `jsonwebtoken`)
- **OTP delivery** logs to console — needs an SMS gateway
- **Data** is in-memory — needs PostgreSQL (DATABASE_URL is already in .env.example)
- **TanStack Query** is installed but `QueryClientProvider` is not yet added to `main.tsx`
