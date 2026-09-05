# Smart Service Flow — Progress Tracker

> **Purpose:** Track the project's status against `complete_project_roadmap.md` and `plans/implementation_plan.md`. Updated after every major change so you can resume work in any session.

> **Last updated:** 2026-09-05 (end of session 5 — Step 4 merged; Increment 1 closed)

---

## ⏭️ Instructions for the Next Session

**Read this section first, then start coding.**

### Context snapshot
- **Increment 1 (Foundation) is closed.** All 4 sub-steps (db, JWT, AuthContext, logout/lang) are merged.
- Next: **Step 5 — Increment 2.1: Service Information (API + UI)**.
- The codebase is **plain JavaScript only** (no TypeScript anywhere).
- Database is wired up via Prisma 7 + PostgreSQL 18 (db: `smart_service_flow`, locally installed, **no Docker**).
- Prisma 7 uses `prisma.config.js` for CLI tooling; the runtime still uses `@prisma/adapter-pg` in `db.js`.
- The `User` table has `lastLoginAt` and `passwordChangedAt` columns.
- The frontend has an AuthContext: `useAuth()` returns `{ user, token, isAuthenticated, isLoading, login, logout }`.
- JWT is validated against `GET /api/auth/me` on every app load; stale tokens are auto-cleared.
- `/dashboard` (any role) and `/staff/dashboard` (STAFF/ADMIN) are protected; both are stubs pending Step 4+.
- The language switcher persists to `PUT /api/auth/me/language` when authed.

### First message to send to the next session
Open the new session with this exact prompt (copy-paste it):
> "Read `PROGRESS.md` and continue from where it left off. Start with Step 5 (Service Information: GET /api/services + list/detail pages)."

### Step 1 — Set up the environment (in your own terminals)
```powershell
# Terminal 1 — start PostgreSQL if not already running
# (Windows Service: it should already be up; verify with `psql -U postgres -c "SELECT 1;"`)

# Terminal 2 — start the server in the FOREGROUND
cd C:\Users\LOQ\OneDrive\Documents\GitHub\Master-web-development-AI-Era\PERN\smart-service-flow\server
npm run dev
# You should see:
#   🚀 Starting Smart Service Flow API...
#   ✅ Connected to PostgreSQL (Xms) — N offices, N services, N users
#   ✅ Server is running on http://localhost:5000

# Terminal 3 — tail the OTP log (only needed while testing auth)
Get-Content C:\Users\LOQ\OneDrive\Documents\GitHub\Master-web-development-AI-Era\PERN\smart-service-flow\server\otp.log -Wait

# Terminal 4 — start the client
cd C:\Users\LOQ\OneDrive\Documents\GitHub\Master-web-development-AI-Era\PERN\smart-service-flow\client
npm run dev
# Vite will print: Local: http://localhost:5173 (or 5174 if 5173 is busy)
```

### Step 2 — Confirm the project is healthy before coding
```powershell
# Server liveness
curl http://localhost:5000/api/health
# Expected: {"success":true,"message":"API is running"}

# Database seed check
curl http://localhost:5000/api/admin/_debug/seed-check
# Expected: {"success":true,"counts":{"offices":2,"services":3,"stages":14,"documents":10,"users":4}}

# Service listing
curl http://localhost:5000/api/queue/services
# Expected: list of 3 services (Driving License, Renewal, Citizenship)

# New in Step 2: /api/auth/me should 401 without a token
curl -i http://localhost:5000/api/auth/me
# Expected: HTTP/1.1 401
```

If any of these fail, fix the environment first before proceeding.

### Step 3 — Create the feature branch and start Step 3
```powershell
cd C:\Users\LOQ\OneDrive\Documents\GitHub\Master-web-development-AI-Era\PERN\smart-service-flow
git checkout main
git pull
git checkout -b feature/auth-context
```

Then send the next-session prompt to start coding. The full task list for Step 3 is in `plans/implementation_plan.md` under **"STEP 3 — Increment 1.5: Frontend auth state + protected routes"**.

### Step 4 — When Step 3 is done
1. Commit on `feature/auth-context`.
2. Update `PROGRESS.md`: set Step 3 to ✅ Done, advance the cursor, add a row to the **Branch & Commit Log**, and note any new gotchas.
3. Merge to `main`:
   ```powershell
   git checkout main
   git merge --no-ff feature/auth-context -m "Merge feature/auth-context: ..."
   git push
   ```
4. Continue to **Step 4** (logout + language persistence endpoint).

### Things to tell the next session explicitly
- The project is **plain JavaScript only** (no TS, no JSDoc, no `.d.ts`).
- **Do not put the server in the background** — keep it foreground in Terminal 2 so OTPs appear live.
- **Do not touch the seed** unless explicitly told to. The seeded users/services are stable.
- **Do not refactor existing files** during a step unless the step requires it. Convert/fix only files you actively need to touch.
- **Do not commit `server/otp.log`** — it's gitignored for a reason (contains dev-only secrets).
- **Server-only-port-5000**: if you start a server in the background, it kills the user's foreground server. Always assume the foreground server belongs to the user.
- The frontend currently persists auth via `localStorage` directly inside `CitizenOTP.jsx`/`Login.jsx`. Step 3 should centralize that into an AuthContext — do not change the storage keys, only the call sites.
- The seeded staff user has `password = null` in the DB (no bcrypt hash yet). To test staff login, register a new staff account first (the existing seed user can only be used for citizen OTP).
- Prisma 7 CLI requires `server/prisma.config.js` (already in place) — do NOT move `url` back into `schema.prisma`; the Prisma 7 design intentionally removes it.
- The citizen `/verify` endpoint now returns `code: "NAME_REQUIRED"` on first login if no `name` is in the body. The frontend `CitizenOTP.jsx` handles this by switching to a name-collection step. Preserve this handshake when refactoring auth.
- The seeded citizen `Siddhartha Shakya (+9779841234567)` already has a name in the DB, so existing accounts skip the name step. New phone numbers will hit the name step.

---

## Current Position

| Field | Value |
|---|---|
| Active branch | `main` |
| Current step | **Step 4 — Logout + language persistence endpoint (✅ MERGED)** |
| Next step | **Step 5 — Service Information (API + UI)** |
| Increment | 1 (Foundation) — 85% done |
| Server runs on | `http://localhost:5000` |
| Client runs on | `http://localhost:5173+` (Vite auto-picks next free port) |
| Database | PostgreSQL 18, db `smart_service_flow` (locally installed, **no Docker**) |
| Server status at handoff | **stopped** (port 5000 free) — you start it in your own terminal |
| Seeded data | 2 offices, 3 services, 14 stages, 10 required documents, 4 users (3 demo + 1 you created via the citizen OTP flow) |

---

## Roadmap Status

### Increment 1 — Project Foundation

| Phase | Step | Status | Notes |
|---|---|---|---|
| 1.1 Repo & dev setup | — | ✅ Done | monorepo, client/ + server/, .gitignore, scripts |
| 1.2 Frontend foundation | — | ✅ Done | React 19 + Vite + Tailwind v4 + i18next + Lucide + PWA |
| 1.3 Backend foundation | — | ✅ Done | Express 5 (ESM, plain JS) + Helmet + CORS, /api routes |
| **1.4 Database foundation** | **Step 1** | ✅ **Done** | Prisma 7.10 + PostgreSQL 18 + seed |
| **1.5 Authentication (server)** | **Step 2** | ✅ **Done** | JWT + bcrypt + `requireAuth`/`requireRole` middleware + `GET /api/auth/me` |
| **1.5 Frontend auth state** | **Step 3** | ✅ **Done** | AuthContext + ProtectedRoute + stub `/dashboard` and `/staff/dashboard` + smart redirect + auth pill in MainLayout |
| 1.5 Logout + lang | Step 4 | ✅ **Done** | `POST /api/auth/logout` (stateless) + `PUT /api/auth/me/language` + `LanguageSwitcher` server persistence |
| 1.6 Bilingual | — | ✅ Done | EN + NE, LanguageSwitcher, localStorage; server-side persistence via `me/language` now active |

### Increment 2 — Service Information & Citizen Guidance

| Phase | Step | Status | Notes |
|---|---|---|---|
| 2.1 Service info | Step 5 | 🔜 Pending | Service list/detail pages, GET /api/services |
| 2.2 Service roadmap | Step 6 | 🔜 Pending | ServiceRoadmap component (DB-driven) |
| 2.3 Required docs | Step 7 | 🔜 Pending | RequiredDocumentsList per stage |
| 2.4 Office guidance | Step 7 | 🔜 Pending | Office info block on detail page |

### Increment 3 — Digital Token & Check-in

| Phase | Step | Status | Notes |
|---|---|---|---|
| 3.1–3.3 Token + QR | Step 8 | 🔜 Pending | POST /api/tokens, position reservation, QR rendering |
| 3.4–3.6 Check-in, no-show, cancel | Step 9 | 🔜 Pending | Staff check-in endpoint, no-show sweeper |

### Increment 4 — Multi-Stage Service Flow

| Phase | Step | Status | Notes |
|---|---|---|---|
| 4.1–4.3 Stage queues + staff ops | Step 10 | 🔜 Pending | call/skip/recall/complete per token |
| 4.4 Multiple counters | Step 11 | 🔜 Pending | Counter model, assign/release |
| 4.5 Stage progress | Step 12 | 🔜 Pending | Citizen progress view |

### Increment 5 — Dynamic Waiting-Time Engine

| Phase | Step | Status | Notes |
|---|---|---|---|
| 5.1–5.5 Engine | Step 13 | 🔜 Pending | ServiceDurationHistory + estimator (no AI yet) |

### Increment 6 — Priority & Deferred

| Phase | Step | Status | Notes |
|---|---|---|---|
| 6.1–6.4 Priority + audit | Step 14 | 🔜 Pending | PriorityRequest model, audit log, deferred handling |

### Increment 10 — Staff & Administration

| Phase | Step | Status | Notes |
|---|---|---|---|
| Staff dashboard | Step 15 | 🔜 Pending | Quick UI for current stage/queue |
| Admin CRUD | Step 19 | 🔜 Pending | Office/service/stage/document/counter/staff mgmt |

### Increment 7 — Real-time Communication

| Phase | Step | Status | Notes |
|---|---|---|---|
| 7 Socket.IO | Step 16 | 🔜 Pending | Mount socket, emit queue events |

### Increment 8 — AI Service-Duration Prediction

| Phase | Step | Status | Notes |
|---|---|---|---|
| 8.1–8.4 FastAPI service | Step 17 | 🔜 Pending | Python service + integration |

### Increment 9 — Notifications

| Phase | Step | Status | Notes |
|---|---|---|---|
| 9 In-app notifications | Step 18 | 🔜 Pending | Notification model, bell UI |

### Increment 11 — Analytics & Reports

| Phase | Step | Status | Notes |
|---|---|---|---|
| 11 Analytics | Step 20 | 🔜 Pending | Summary endpoint, charts |

### Increment 12 — PWA & Polish

| Phase | Step | Status | Notes |
|---|---|---|---|
| 12 PWA polish | Step 21 | 🔜 Pending | manifest, service worker, a11y |

### Increment 13 — Testing

| Phase | Step | Status | Notes |
|---|---|---|---|
| 13 Tests | Step 22 | 🔜 Pending | Vitest + supertest + Playwright |

---

## Branch & Commit Log

| Branch | Last commit | Status |
|---|---|---|
| `feature/db` | `feat(db): add Prisma schema, migration, and seed` | ✅ Merged (Step 1) |
| `feature/remove-typescript` | `fix(client): restore navigate state object in TokenGeneration` | ✅ Merged to main (Step 1.5) |
| `feature/auth-jwt` | `feat(auth): replace base64 with JWT, add bcrypt password hashing` | ✅ Merged to main (Step 2) |
| `feature/auth-foundation-fixes` | `feat(auth-foundation): add lastLoginAt, passwordChangedAt columns + first-login name prompt` | ✅ Merged to main (Step 2.5) |
| `feature/auth-context` | `feat(auth): AuthContext + ProtectedRoute + stub dashboards + smart redirect` | ✅ Merged to main (Step 3) |
| `feature/logout-lang` | — | 🔜 **Next** (Step 4) |

### Post-Step-2.5 hotfix

| Commit | What | Why |
|---|---|---|
| `fix(auth): regenerate Prisma 7 client + add generate to dev/postinstall; add migration commands` | Server `dev` and `start` now run `prisma generate` automatically; added `postinstall: prisma generate`; `db:migrate` no longer forces `--name init`; added `db:migrate:create` for new migrations. | After adding new columns to the User table in Step 2.5, the running server still held the old Prisma client in memory, causing `PrismaClientValidationError: Unknown argument 'lastLoginAt'` on `/api/auth/citizen/verify`. Auto-generating on `dev` start and `postinstall` prevents the same trap for future schema changes and for fresh clones. |

### Server-side quality-of-life commits

### Session 2 housekeeping (commited before starting Step 2)

| Commit | What | Why |
|---|---|---|
| `chore(cleanup): remove unused client files; add populated Footer with i18n links; add ScrollToTop` | Removed `client/src/App.css`, `client/src/components/Test.jsx`, `client/dist/`, `server/otp.log`, `server/.agents`, `server/.claude`, `server/.cursor`, `server/.devin`. Populated `Footer.jsx` with brand + Services + Legal columns; Footer "Services" links use `<Link>` to `/token/services` and `/token/monitor`; Legal links stay as anchor placeholders with TODO. Added `ScrollToTop` component so route changes reset scroll to top. | Trim dead code, fill the empty Footer to match the design system, fix the SPA scroll-reset issue reported when clicking footer links. |

### Server-side quality-of-life commits

| Commit | What | Why |
|---|---|---|
| `feat(server): log successful DB connection on startup` | Added `src/dbCheck.js`; `server.js` logs `✅ Connected to PostgreSQL (Xms) — N offices, N services, N users` on boot. | Make the DB connection status visible at startup, not silently failing on the first request. |
| `feat(server): log OTPs to stdout and server/otp.log` | `deliverOTPToConsole` writes both a multi-line box to stdout (the original behaviour) AND a one-liner to `server/otp.log`. `server/otp.log` is gitignored. | When the foreground terminal is closed or the server runs in an IDE, OTPs were lost. The file is the safety net. |
| `fix(server): restore multi-line OTP box on stdout + keep one-liner in otp.log` | Switched back from `process.stdout.write` to `console.log` for the box; kept the file append. | `console.log` is what makes the multi-line box render correctly in a TTY. The file still gets the one-liner. |
| `fix(client): import i18n JSON as namespace to match Vite's named-export transform` | Changed `client/src/i18n/index.js` from `import en from ...` to `import * as en from ...` and wrapped resources in `en: { translation: en }`. | Vite turns JSON into named exports (one per top-level key), so the default export was `undefined`, which broke all translations — pages were showing raw keys like `common.appName`. |
| `fix(client): restore framer-motion variants and object property keys stripped during TS->JS` | Repaired `Home.jsx`, `Monitor.jsx`, `Button.jsx` (icon prop), `TokenGeneration.jsx` (navigate state object). | The regex strip script over-aggressively removed `key:` pairs in object literals. |

---

## Current API Routes (working)

| Method | Path | Purpose |
|---|---|---|
| GET | `/api/health` | Liveness check |
| POST | `/api/auth/citizen/send-otp` | Sends OTP to phone (logs to console + `server/otp.log`) |
| POST | `/api/auth/citizen/verify` | Verifies OTP, upserts Citizen user (requires `name` on first login — returns `code: "NAME_REQUIRED"` if missing), returns JWT |
| POST | `/api/auth/staff/register` | Register staff (bcrypt-hashed password; sets `passwordChangedAt`) |
| POST | `/api/auth/staff/login` | Email + password → 2FA OTP |
| POST | `/api/auth/staff/verify-otp` | 2FA OTP → JWT (includes `pwd` claim) |
| GET | `/api/auth/me` | Returns the current user (Bearer token required; rejects tokens with stale `pwd` claim) |
| GET | `/api/queue/status` | All services with current token counts (DB-driven) |
| GET | `/api/queue/services` | Service list (id, nameEn, nameNe) |
| GET | `/api/queue/:serviceId` | Single service queue status |
| GET | `/api/admin/_debug/seed-check` | Row counts per table (dev only — will be removed in Step 19) |
| GET | `/api/admin/_debug/services` | Services with office name (dev only) |

---

## Environment

**PostgreSQL**
- Local install (no Docker)
- Database: `smart_service_flow`
- Connection string in `server/.env`: `postgresql://postgres:sinmbf12345@localhost:5432/smartservice` — Prisma maps the `smartservice` slug to the actual `smart_service_flow` database name
- Verification: `curl http://localhost:5000/api/admin/_debug/seed-check` (only works when server is running)

**Server (port 5000)**
- Dev: `cd server && npm run dev` (uses `node --watch`)
- Seed: `cd server && npm run db:seed` (runs `node prisma/seed.js`)
- Health: `curl http://localhost:5000/api/health`
- DB check: `curl http://localhost:5000/api/admin/_debug/seed-check`
- OTP log: `server/otp.log` (auto-created, gitignored)

**Client (port 5173+)**
- Dev: `cd client && npm run dev`
- Build: `npm run build` (Vite, no tsc)

**Demo credentials (seeded)**
- Citizen: `+9779841234567` (Siddhartha Shakya) — uses OTP flow
- Staff: `staff@dotm.gov.np` (Ramesh Sharma) — uses email + 2FA OTP (password: not seeded; register a new one)
- Admin: `admin@smartservice.gov.np`

---

## Known Issues & Gotchas

1. **JSON imports via Vite** — Vite transforms `.json` imports to named exports (one per top-level key). Always use `import * as ns from "./file.json"` for i18n resources, not `import ns from ...`. (Fixed in `client/src/i18n/index.js`.)
2. **Prisma generated client lives in `server/src/generated/prisma/`** — already gitignored. Regenerated by `npx prisma generate`.
3. **Prisma uses `prisma-client-js` (not `prisma-client`)** — the newer `prisma-client` provider requires the `prisma7.config.ts` adapter and a runtime-built client, which broke our build. Sticking with `prisma-client-js` (the standard one).
4. **No TypeScript** — all `.ts`/`.tsx` removed; plain `.js`/`.jsx` only. No `tsc`, no JSDoc, no `.d.ts`.
5. **Vite picks next free port** if 5173 is busy. Watch the terminal output for the actual URL.
6. **Startup logs DB status** — `server.js` calls `checkDatabaseConnection()` before starting Express. If the DB is unreachable, the server exits with code 1.
7. **OTP log file path** — `server/otp.log`. To tail in another PowerShell: `Get-Content C:\Users\LOQ\OneDrive\Documents\GitHub\Master-web-development-AI-Era\PERN\smart-service-flow\server\otp.log -Wait`.
8. **Only one server can hold port 5000** — if your foreground server is replaced by a background process, you'll lose the terminal OTP output. Always start the server yourself with `npm run dev` and leave it running.
9. **Staff password is null in the seed** — staff can be registered via `/api/auth/staff/register` but cannot log in until a real bcrypt-hashed password is set. The seed creates staff with `password = null`; register a new account for testing.
10. **JWT requires `JWT_SECRET` in `.env`** — the `.env` already has `JWT_SECRET=dev-secret-key-change-in-production`. If it's missing or blank, JWT tokens will fail to sign/verify and all protected routes will return 401. Always confirm `JWT_SECRET` is non-empty before testing auth flows.
11. **Server-side quality notes from Step 2** — `jwt.js` uses `jsonwebtoken` (HS256); `auth.js` middleware hydrates the user from DB on every protected request; `me.js` exposes `GET /api/auth/me`. The `requireAuth` middleware attaches `req.user`; `requireRole(...)` gates after it.
12. **Prisma client regeneration** — Prisma 7's generated client (in `server/src/generated/prisma/`) does NOT auto-reload at runtime. After any schema change (new column, model, enum), you must `npm run dev` (or `npx prisma generate`) to refresh the client. The `dev` and `start` scripts now run `prisma generate` automatically, and `postinstall` regenerates after fresh `npm install`. **Always restart the server after a schema change** — the running process holds the old client in memory. Symptom of a stale client: `PrismaClientValidationError: Unknown argument 'X'` against a column that exists in the DB.

---

## Quick Verification Commands

```bash
# Server health
curl http://localhost:5000/api/health

# Database seed check
curl http://localhost:5000/api/admin/_debug/seed-check

# Service listing
curl http://localhost:5000/api/queue/services

# Citizen OTP flow (check otp.log for the code)
curl -X POST http://localhost:5000/api/auth/citizen/send-otp \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber":"+9779841234567"}'
```

---

## How to Resume Work (in the next session)

1. **Read this file first** — it has the current position, what was done, and what's pending.
2. **Start the database** if not already running (PostgreSQL 18 service on Windows).
3. **Start the server yourself in a terminal** — `cd server && npm run dev`. Watch for the startup banner:
   ```
   ✅ Connected to PostgreSQL (Xms) — N offices, N services, N users
   ✅ Server is running on http://localhost:5000
   ```
4. **Tail the OTP log in a second terminal** — `Get-Content server/otp.log -Wait` (optional but helpful while testing auth).
5. **Start the client** in a third terminal — `cd client && npm run dev`. Vite will print the URL.
6. **Create the next feature branch** off `main`:
   ```bash
   git checkout main
   git pull
   git checkout -b feature/auth-jwt
   ```
7. **Do Step 2 (JWT + bcrypt)** from `plans/implementation_plan.md`. The full task list is in that file under "STEP 2 — Increment 1.5: Real Authentication (JWT + bcrypt + middleware) (in Plain JS)".
8. **After completing the step**, commit on the branch, then update this file (set the step's status to ✅ Done, advance the cursor, append a commit-log row, note any new gotchas).
9. **Merge to `main`** when green.

**Today's stopping point:** all of Increment 1 except JWT/bcrypt (Step 2) is in place. The next session should pick up with Step 2 immediately.
