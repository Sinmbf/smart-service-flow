# Smart Service Flow — Progress Tracker

> **Purpose:** Track the project's status against `complete_project_roadmap.md` and `plans/implementation_plan.md`. Updated after every major change.

> **Last updated:** 2026-09-05

---

## Current Position

| Field | Value |
|---|---|
| Active branch | `feature/remove-typescript` (ready to merge → `main`) |
| Current step | **Step 1.5 — Plain JS conversion (COMPLETE, pending merge)** |
| Next step | **Step 2 — JWT + bcrypt + auth middleware** |
| Increment | 1 (Foundation) — 80% done |
| Server runs on | `http://localhost:5000` |
| Client runs on | `http://localhost:5174` (or next free port) |
| Database | PostgreSQL 18 (`smart_service_flow` db, seeded) |

---

## Roadmap Status

### Increment 1 — Project Foundation

| Phase | Step | Status | Notes |
|---|---|---|---|
| 1.1 Repo & dev setup | — | ✅ Done | monorepo, client/ + server/, .gitignore, scripts |
| 1.2 Frontend foundation | — | ✅ Done | React + Vite + Tailwind + i18next + Lucide + PWA |
| 1.3 Backend foundation | — | ✅ Done | Express + TS→JS, helmet, cors, health, /api routes |
| **1.4 Database foundation** | **Step 1** | ✅ **Done** | Prisma 7 + PostgreSQL 18 + seed (2 offices, 3 services, 14 stages, 10 docs, 3 users) |
| 1.5 Authentication | Step 2 | ⏳ Next | JWT + bcrypt + auth middleware (upcoming) |
| 1.5 Frontend auth state | Step 3 | 🔜 Pending | AuthContext + ProtectedRoute + protected routes |
| 1.5 Logout + lang | Step 4 | 🔜 Pending | Logout endpoint, language persistence |
| 1.6 Bilingual | — | ✅ Done | EN + NE, LanguageSwitcher, localStorage persistence |

### Increment 2 — Service Information & Citizen Guidance

| Phase | Step | Status | Notes |
|---|---|---|---|
| 2.1 Service info | Step 5 | 🔜 Pending | Service listing/detail pages, /api/services |
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
| 4.1–4.3 Stage queues + staff ops | Step 10 | 🔜 Pending | Per-stage queue lists, call/skip/recall/complete |
| 4.4 Multiple counters | Step 11 | 🔜 Pending | Counter model, assign/release |
| 4.5 Stage progress | Step 12 | 🔜 Pending | Citizen progress view |

### Increment 5 — Dynamic Waiting-Time Engine

| Phase | Step | Status | Notes |
|---|---|---|---|
| 5.1–5.5 Engine | Step 13 | 🔜 Pending | ServiceDurationHistory + estimator |

### Increment 6 — Priority & Deferred

| Phase | Step | Status | Notes |
|---|---|---|---|
| 6.1–6.4 Priority + audit | Step 14 | 🔜 Pending | PriorityRequest model, audit log, deferred handling |

### Increment 10 — Staff & Administration (partial, jumping ahead)

| Phase | Step | Status | Notes |
|---|---|---|---|
| Staff dashboard | Step 15 | 🔜 Pending | Quick UI for current stage/queue |

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

### Increment 10 (continued) — Admin

| Phase | Step | Status | Notes |
|---|---|---|---|
| Admin CRUD | Step 19 | 🔜 Pending | Office/service/stage/document/counter/staff mgmt |

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
| `feature/remove-typescript` | `fix(client): import i18n JSON as namespace to match Vite's named-export transform` | ⏳ Ready to merge (Step 1.5) |
| `feature/auth-jwt` | — | 🔜 Next (Step 2) |

---

## Environment

**PostgreSQL**
- Database: `smart_service_flow`
- Connection: `postgresql://postgres:sinmbf12345@localhost:5432/smartservice` (per `.env`; Prisma maps this to `smart_service_flow`)
- Started locally (no Docker)

**Server (port 5000)**
- Dev: `cd server && npm run dev` (uses `node --watch`)
- Seed: `npm run db:seed` (runs `node prisma/seed.js`)

**Client (port 5173+, vite picks next free)**
- Dev: `cd client && npm run dev`
- Build: `npm run build` (Vite, no tsc)

---

## Known Issues & Gotchas

1. **JSON imports via Vite** — Vite transforms `.json` imports to named exports (one per top-level key). Always use `import * as ns from "./file.json"` for i18n resources, not `import ns from ...`. (Fixed in `client/src/i18n/index.js`.)
2. **Prisma generated client lives in `server/src/generated/prisma/`** — already gitignored. Regenerated by `npx prisma generate`.
3. **Prisma uses `prisma-client-js` (not `prisma-client`)** — the newer `prisma-client` provider requires the `prisma7.config.ts` adapter and a runtime-built client, which broke our build. Sticking with `prisma-client-js` (the standard one).
4. **No TypeScript** — all `.ts`/`.tsx` removed; plain `.js`/`.jsx` only. No `tsc`, no JSDoc, no `.d.ts`.
5. **Vite picks next free port** if 5173 is busy. Watch the terminal output for the actual URL.

---

## Quick Verification Commands

```bash
# Server health
curl http://localhost:5000/api/health

# Database seed check (dev only)
curl http://localhost:5000/api/admin/_debug/seed-check

# Service listing
curl http://localhost:5000/api/queue/services
```

---

## How to Resume Work

1. Check this file to find the current step.
2. Check `plans/implementation_plan.md` for the step's full task list.
3. Create the next feature branch off `main`:
   ```bash
   git checkout main
   git pull
   git checkout -b feature/<next-step-name>
   ```
4. After completing a step, commit on the branch, then update this file (set the step's status to ✅ Done, advance the cursor, append a commit-log row, note any new gotchas).
5. Merge to `main` when green.
