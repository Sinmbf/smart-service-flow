# Smart Service Flow — Step-by-Step Implementation Plan

## Method Note (rev. 2026-09-05)

**No TypeScript anywhere.** Both `client/` (React JSX) and `server/` (Express ESM) use plain JavaScript (`.js` / `.jsx`) only — no `.ts`/`.tsx`, no `.d.ts` types, no JSDoc annotations. The plan and code below reflect this.

**Conversion rule:** when a file is edited (new feature, fix, or existing file change), rename `.ts`/`.tsx` → `.js`/`.jsx` at the same time. Drop `import { Type } from ...` annotations. Drop `type` / `interface` declarations. Remove `as const` where only used for types.

**Prisma impact:** `prisma generate` produces TypeScript types, but the server uses the generated client at runtime via `import { ... } from "./generated/prisma/client.js"`. The static type-check (`tsc --noEmit`) is removed; type errors don't block. If a need for type hints arises, pure JS only — no `@param`/`@returns`.

---

## Context

The project is an **AI-Based Smart Service Flow Management System** for government offices in Nepal (BIM 6th-semester project). The `complete_project_roadmap.md` defines 13 increments over ~3–4 months. The repo is on branch `test/ui-ux-redesign` with substantial UI work already merged (Home, Monitor, layouts, i18n). The backend is in-memory only and the data layer is missing.

This plan finishes **Increment 1 (Foundation)** next, because everything else depends on it, and then sequences the remaining 12 increments in the order the roadmap prescribes. Each step is small, individually testable, and lands on `main` as a working commit.

---

## Current State Snapshot

**Client (working, but `.tsx` files will be renamed to `.jsx` as they're touched)**
- React 19 + Vite + Tailwind v4 PWA
- Routes wired in `client/src/routes/AppRoutes.jsx`
- `QueryClientProvider` already mounted in `client/src/main.jsx`
- UI kit: `Button`, `Card`, `Input`, `PasswordInput`, `Skeleton` (`client/src/components/ui/index.js`)
- Pages exist: `Home`, `Login`, `Register`, `CitizenOTP`, `StaffRegister`, `ForgotPassword`, `ResetPassword`, `VerifyPhone`, `ServiceSelection`, `TokenGeneration`, `TokenDisplay`, `QRScanner`, `Monitor`
- i18n: `en/common.json` + `ne/common.json`, `LanguageSwitcher`
- `api.js` reads `VITE_API_BASE_URL`

**Server (Prisma 7 wired and seeded, but `.ts` files will be renamed to `.js` as they're touched)**
- Express 5 + ESM + Helmet + CORS
- PostgreSQL via Prisma 7 + `@prisma/adapter-pg` driver adapter
- DB: `smart_service_flow` (PostgreSQL 18) — seeded with 2 offices, 3 services, 14 stages, 10 documents, 3 users
- `POST /api/auth/citizen/send-otp` & `/verify` (persists citizen to DB)
- `POST /api/auth/staff/register` & `/login` & `/verify-otp` (persists staff to DB, plaintext password)
- `GET /api/queue/status`, `/services`, `/:serviceId` (DB-driven, no more hardcoded mock)
- `GET /api/admin/_debug/seed-check` for development verification
- Tokens are base64 strings (Step 2 will replace with JWT)
- `prisma/seed.ts` will be renamed to `prisma/seed.js` (or kept as `.ts` since Node ESM works with both — convert for consistency)

**Missing (blocks further work)**
- Convert all `.ts`/`.tsx` to `.js`/`.jsx` (in progress as files are touched)
- Remove `tsconfig.json` from both packages, drop `typescript` from devDependencies
- Switch Vite from `vite-plugin-react` (TS-aware) to plain JSX transform
- Switch server from `tsx` to plain `node --watch` or `nodemon` for the dev script
- JWT auth + password hashing
- Auth context on frontend + protected routes
- Real queue/token business logic
- Socket.IO, AI service, admin/staff dashboards, notifications, analytics, PWA manifest

---

## Implementation Order

Each step is one branch, one or more commits, and merges to `main` when green.

---

### STEP 1 — Complete Increment 1.4: Database Foundation (Prisma + PostgreSQL)

**Goal:** Real data layer that every later increment needs.

**Tasks**
1. Add `docker-compose.yml` (or document `DATABASE_URL` for a local Postgres) and seed script.
2. Create `server/prisma/schema.prisma` with these models (from roadmap §1.4):
   - `User` (id, phoneNumber?, email?, password?, name, role enum, preferredLanguage enum, createdAt)
   - `GovernmentOffice` (id, name, location, hours)
   - `Service` (id, officeId, nameEn, nameNe, descriptionEn, descriptionNe, category, isActive)
   - `ServiceStage` (id, serviceId, stageOrder, nameEn, nameNe, baselineMinutes, location)
   - `RequiredDocument` (id, stageId, nameEn, nameNe, description, type)
   - Enums: `Role { CITIZEN, STAFF, ADMIN }`, `Language { EN, NE }`
3. `npx prisma migrate dev --name init`
4. Create `server/prisma/seed.ts` (will be renamed to `seed.js` in Step 1.5) that loads two demo services (e.g. Driving License, Citizenship) with full stage sequences + required docs.
5. Wire `server/src/db.ts` (will be renamed to `db.js` in Step 1.5) exporting `prisma` singleton.
6. Replace in-memory `users` Maps in `routes/auth/*` with `prisma.user` calls (read-only at this step — keep base64 token).

**Verification**
- `npm run dev` on server connects to DB
- `npx prisma studio` shows seeded services
- Existing `/api/auth/citizen/send-otp` still works (now persists user to DB)

**Commit:** `feat(db): add Prisma schema, migration, and seed`

---

### STEP 1.5 — Complete Removal of TypeScript (Convert codebase to plain JS/JSX)

**Goal:** Strip out TypeScript configs, types, and annotations across `client/` and `server/`. All source files become `.js` or `.jsx`. Development uses `node --watch` (server) and plain Vite (client).

**Server Tasks**
1. Convert `server/src/server.ts` → `server.js`
2. Convert `server/src/app.ts` → `app.js`
3. Convert `server/src/db.ts` → `db.js`
4. Convert `server/src/routes/auth/citizen.ts` → `citizen.js`, `staff.ts` → `staff.js`
5. Convert `server/src/routes/queue.ts` → `queue.js`, `routes/admin/debug.ts` → `debug.js`
6. Convert `server/src/services/auth/otp.ts` → `otp.js`, `otpStore.ts` → `otpStore.js`
7. Convert `server/prisma/seed.ts` → `seed.js`
8. Update `server/package.json`:
   - Change `dev` script to `node --watch src/server.js` (Node 22 native ESM watch)
   - Change `db:seed` script to `node prisma/seed.js`
   - Remove `build` script (`tsc`) since JS needs no build step
   - Uninstall `typescript`, `tsx`, `@types/*` packages
9. Delete `server/tsconfig.json`

**Client Tasks**
1. Convert `client/src/main.tsx` → `main.jsx`
2. Convert `client/src/App.tsx` → `App.jsx`
3. Convert `client/src/routes/AppRoutes.tsx` → `AppRoutes.jsx`
4. Convert `client/src/layouts/{MainLayout,AuthLayout}.tsx` → `.jsx`
5. Convert `client/src/components/ui/{Button,Card,Input,PasswordInput,Skeleton,index}.tsx` → `.jsx`/`.js`
6. Convert `client/src/components/{Footer,LanguageSwitcher}.tsx` → `.jsx`
7. Convert `client/src/services/{api,health}.ts` → `.js`
8. Convert `client/src/i18n/index.ts` → `index.js`
9. Convert all pages under `client/src/pages/{Home,auth/*,token/*}` → `.jsx`/`.js`
10. Update `client/package.json`:
    - Change `build` script to `vite build` (remove `tsc -b &&`)
    - Change `dev` script to `vite`
    - Uninstall `typescript`, `@types/*`, `typescript-eslint`
11. Delete `client/tsconfig.json`, `client/tsconfig.app.json`, `client/tsconfig.node.json`
12. Update `client/index.html` to point to `/src/main.jsx` (instead of `/src/main.tsx`)

**Verification**
- `cd server && npm run dev` starts via `node --watch` with zero TS build step
- `cd client && npm run dev` starts Vite without TS checks
- Home page loads at `http://localhost:5173`
- `/api/health` and `/api/admin/_debug/seed-check` return JSON
- Citizen OTP login still works end-to-end

**Commit:** `refactor: convert codebase from TypeScript to plain JavaScript (JSX)`

---

### STEP 2 — Increment 1.5: Real Authentication (JWT + bcrypt + middleware) (in Plain JS)

**Goal:** Replace base64 token with JWT; hash passwords; gate protected routes.

**Tasks**
1. Add deps: `bcrypt`, `jsonwebtoken` (no `@types/*` needed for plain JS).
2. New `server/src/services/auth/jwt.js` (`signToken`, `verifyToken`).
3. New `server/src/middleware/auth.js`:
   - `requireAuth` (parses `Authorization: Bearer ...`, attaches `req.user`)
   - `requireRole(...roles)` (403 on mismatch)
4. Update `routes/auth/citizen.js`:
   - On `/verify`: upsert `User` (role: CITIZEN), sign JWT `{ sub, role, lang }`, return it.
5. Update `routes/auth/staff.js`:
   - On `/register`: hash password with bcrypt, persist user.
   - On `/login`: compare bcrypt hash, store 2FA OTP keyed by user id.
   - On `/verify-otp`: sign JWT with role: STAFF.
6. New `routes/auth/me.js` returning current user from token.
7. Add `JWT_SECRET` to `server/.env.example` and a dev default.

**Verification**
- `POST /auth/staff/register` then `POST /auth/staff/login` → `POST /auth/staff/verify-otp` returns a JWT
- `GET /api/auth/me` with `Authorization: Bearer <jwt>` returns the user
- Same without token → 401
- Citizen OTP flow still works end-to-end

**Commit:** `feat(auth): replace base64 with JWT, add bcrypt password hashing`

---

### STEP 3 — Increment 1.5: Frontend auth state + protected routes

**Goal:** Citizens/staff stay signed in across reloads; protected pages redirect to login.

**Tasks**
1. New `client/src/auth/AuthContext.tsx`:
   - Stores JWT in `localStorage` (mirrors current `CitizenOTP` behavior)
   - `useAuth()` → `{ user, login, logout, isAuthenticated }`
2. New `client/src/components/ProtectedRoute.tsx` (wraps children, redirects to `/login` if no user, role-check optional).
3. Wrap `App` with `<AuthProvider>` in `client/src/main.tsx`.
4. Update `CitizenOTP` and `Login` to call `login(token, user)` from context instead of raw `localStorage.setItem`.
5. Persist user via `localStorage` and hydrate on app load.
6. Update `AppRoutes.tsx`: add stub `/dashboard` (citizen) and `/staff/dashboard` (staff) protected by role.

**Verification**
- After `/citizen-login` flow, reload → still authenticated
- Visit `/dashboard` while signed out → redirected to `/login`
- Logout button (later step adds UI) clears storage

**Commit:** `feat(auth): add auth context and protected routes`

---

### STEP 4 — Increment 1.6 (already in progress) + 1.5 closing

**Goal:** Close out the Increment 1 completion criteria from the roadmap.

**Tasks**
1. Add logout endpoint `POST /api/auth/logout` (no-op stateless) and a `Logout` button in `MainLayout` when authed.
2. Add `PUT /api/auth/me/language` to persist `preferredLanguage`.
3. Add Role enum + language enum to Prisma (already in Step 1, just wire API).
4. Document Increment 1 in `README.md`.

**Verification**
- All Increment 1 acceptance criteria from roadmap §1.5 pass: registration, OTP verify, login, JWT, RBAC, logout, EN/NE switch (already works).

**Commit:** `chore: complete increment 1 foundation`

---

### STEP 5 — Increment 2.1: Service Information (API + UI)

**Goal:** Citizens can browse and view services.

**Backend**
- `GET /api/services` (list, paginated, searchable, language-aware via `Accept-Language` or `?lang=`)
- `GET /api/services/:id` (full details with office + stages + docs)

**Frontend**
- New `client/src/pages/services/ServiceList.tsx` (grid of `ServiceCard`)
- New `client/src/pages/services/ServiceDetail.tsx`
- New route `/services` and `/services/:id`
- `client/src/components/ServiceCard.tsx`
- Add i18n keys: `services.list.*`, `services.detail.*`

**Verification**
- Visit `/services` → see seeded services
- Click a service → see details, office, hours
- Switch to Nepali → names flip

**Commit:** `feat(services): add service listing and detail pages`

---

### STEP 6 — Increment 2.2: Service Roadmap

**Goal:** Visualize the multi-stage flow per service.

**Frontend**
- `client/src/components/ServiceRoadmap.tsx` (vertical stepper reading `stageOrder`)
- Embed in `ServiceDetail.tsx`
- Status states: completed / current / upcoming / remaining (placeholder until Step 14)

**Backend**
- Roadmap comes from existing `ServiceStage` table — no new endpoint needed beyond what `/services/:id` returns.

**Verification**
- Detail page shows the 7-stage driving-license roadmap in correct order
- Stages render in EN or NE based on selected language

**Commit:** `feat(services): add service roadmap visualization`

---

### STEP 7 — Increment 2.3 & 2.4: Required Documents + Office/Stage Guidance

**Backend**
- `GET /api/services/:id/stages/:stageId/documents`
- Extend `GET /api/services/:id` to include `office`, `stages[].documents`, `stages[].location`

**Frontend**
- `client/src/components/RequiredDocumentsList.tsx` (rendered inside each stage in the roadmap)
- Office info block (location, hours, room/counter when available)

**Verification**
- Each stage shows its required documents with bilingual names
- Office address/hours visible on service detail

**Commit:** `feat(services): add required documents and office guidance`

---

### STEP 8 — Increment 3.1–3.3: Token data model + generation + QR

**Backend**
- New Prisma models: `Token` (id, tokenNumber, serviceId, currentStageId, userId, status enum {GENERATED, CHECKED_IN, SERVING, COMPLETED, SKIPPED, EXPIRED, CANCELLED, DEFERRED}, generatedAt, position)
- `POST /api/tokens` body `{ serviceId }` → reserve position (transactional `position = MAX(position)+1` for that service+stage), return `{ tokenNumber, position, status, qrPayload }`
- `GET /api/tokens/:id` (citizen polls for status; later, Socket.IO)
- `qrPayload` = signed JWT containing `{ tokenId, sig }` so QR doesn't leak service data

**Frontend**
- Replace random generation in `pages/token/TokenGeneration.tsx` with real `POST /api/tokens`
- `pages/token/TokenDisplay.tsx` shows tokenNumber, position, status, generatedAt
- Render QR via `qrcode` npm package (client-side, sized ~256px)

**Verification**
- Generate token A → position 1; generate again → position 2
- Refresh the display page, status persists
- QR code scans to a valid token lookup URL

**Commit:** `feat(tokens): add digital token generation with QR`

---

### STEP 9 — Increment 3.4–3.6: Check-in (QR + manual), no-show, cancellation

**Backend**
- `POST /api/staff/tokens/check-in` body `{ identifier: "<qrTokenId> | tokenNumber | phoneNumber }` → flips status to `CHECKED_IN`, sets `checkedInAt`
- New `services/queue/timeout.ts` — a simple in-process `setInterval` that flips `GENERATED` tokens older than N minutes (configurable) to `EXPIRED`
- `POST /api/tokens/:id/cancel` (citizen self-cancel before CHECKED_IN)

**Frontend**
- `pages/token/QRScanner.tsx` (uses `html5-qrcode` or browser `BarcodeDetector` fallback) → POSTs scanned payload
- New `pages/staff/CheckIn.tsx` (manual lookup by token/phone)
- `TokenDisplay` adds "Cancel" button before check-in

**Verification**
- Scenario A (remote token): A generates, B generates, A's position is still 1 even if B checks in first
- Scenario B (no-show): leave a `GENERATED` token, see it flip to `EXPIRED` after timeout
- Cancel works for `GENERATED` only

**Commit:** `feat(tokens): add check-in, cancellation, and no-show handling`

---

### STEP 10 — Increment 4.1–4.3: Stage-specific queues + staff operations + stage transfer

**Backend**
- Each `Token` already has `currentStageId`; queue lists filter by it
- `GET /api/staff/queues/:stageId` returns waiting list
- `POST /api/staff/tokens/:id/call` (status → SERVING), `/start`, `/skip`, `/recall`, `/complete`
- On `/complete` for a stage: increment `currentStageId` to the next stage per `stageOrder`; if no next stage, mark token COMPLETED. If next stage is different, status → `GENERATED` (so they rejoin the new queue).

**Frontend**
- New `pages/staff/QueueBoard.tsx` per stage: list of waiting tokens, call/skip/recall/complete buttons
- Routes: `/staff/queues/:stageId`
- Citizen `TokenDisplay` updates `currentStage` from polling (later, Socket.IO)

**Verification**
- Complete a stage → token moves to next stage's queue
- Final stage → token status COMPLETED

**Commit:** `feat(flow): add stage-specific queues and staff operations`

---

### STEP 11 — Increment 4.4: Multiple Counters

**Backend**
- New `Counter` model (id, stageId, name, isActive, currentTokenId?)
- `POST /api/staff/counters/:id/assign` body `{ tokenId }` — atomic claim; 409 if already serving
- `POST /api/staff/counters/:id/release`
- Modify `/call` to use the requesting staff's counter

**Frontend**
- Counter selector in `QueueBoard`
- Visual indicator for active counters per stage

**Verification**
- Two counters serving the same stage; calls distribute between them
- Deactivate a counter; ongoing service continues, queue is not affected

**Commit:** `feat(flow): add multiple counter management`

---

### STEP 12 — Increment 4.5: Citizen Stage Progress

**Frontend**
- `TokenDisplay` shows progress: ✓ Application → ✓ Medical → → Office Approval → ○ Trial …
- Display current room, current counter, current stage queue size, estimated wait (placeholder until Step 13)

**Commit:** `feat(flow): add citizen stage progress view`

---

### STEP 13 — Increment 5: Dynamic Waiting-Time Engine (deterministic, no AI yet)

**Backend**
- New `ServiceDurationHistory` model (serviceId, stageId, actualMinutes, completedAt) — written on stage complete
- `services/queue/estimator.ts`:
  - Base = median of last 50 service durations for that stage
  - For each citizen in queue, walk the active counters and project a service schedule; return `estimatedWaitMinutes` per token
  - Recalculated on call/start/skip/complete/counter change
- `GET /api/tokens/:id/wait` returns the live estimate

**Frontend**
- `TokenDisplay` shows "Estimated wait: 28 min" with timestamp; "Last updated 10:34" and an animation when it changes
- Polling every 30s on the citizen side (replaced by Socket.IO in Step 16)

**Verification (all roadmap scenarios in §17)**
- A: service finishes early → waiting time decreases
- B: service takes longer → waiting time increases
- C/D: counter unavailable/available → recalc
- E: token skipped → others move forward
- G: multi-counter → based on counter availability, not just `people × avg`

**Commit:** `feat(queue): add dynamic waiting-time engine`

---

### STEP 14 — Increment 6: Priority & Deferred + Audit Log

**Backend**
- New models: `PriorityRequest` (tokenId, reason enum, requestedBy, decidedBy, decision, createdAt), `AuditLog` (actor, action, target, metadata, createdAt)
- `POST /api/staff/tokens/:id/priority/request` (citizen-submitted, status PENDING)
- `POST /api/staff/priority-requests/:id/decide` (staff approves/rejects)
- Queue policy module (`services/queue/policy.ts`) with alternating policy: P, N, P, N…
- `POST /api/staff/queues/:stageId/defer-token` body `{ tokenId, reason }` → status `DEFERRED`
- Helper `recordAudit()` called on every staff action (call, skip, recall, complete, priority, defer, counter change)

**Frontend**
- Citizen: "Request priority" button on `TokenDisplay` (with reason picker)
- Staff: priority queue tab + audit log viewer per stage
- Deferred tokens visible to staff

**Verification**
- Scenario G: approved priority case enters, alternating policy applied, audit row written
- Scenario H: office-closure → deferred; next-day policy (configurable carry-over) works
- Audit log shows every action with actor + timestamp

**Commit:** `feat(flow): add priority, deferred, and audit logging`

---

### STEP 15 — Increment 10 (partial): Staff Dashboard

**Goal:** Bring staff from "no UI" to a working home screen.

**Frontend**
- `pages/staff/Dashboard.tsx`: current stage, current queue, current token, counter status, waiting count, priority requests, deferred cases — all from existing endpoints

**Commit:** `feat(staff): add staff dashboard`

---

### STEP 16 — Increment 7: Real-time (Socket.IO)

**Backend**
- Add `socket.io`, mount on existing Express server
- Rooms: `service:{id}`, `stage:{id}`, `counter:{id}`, `user:{id}`
- Emit on every queue mutation: `TOKEN_CALLED`, `SERVICE_STARTED`, `SERVICE_COMPLETED`, `TOKEN_SKIPPED`, `TOKEN_RECALLED`, `COUNTER_CHANGED`, `STAGE_CHANGED`, `QUEUE_UPDATED`, `WAITING_TIME_UPDATED`, `PRIORITY_UPDATED`
- Auth handshake accepts JWT in `auth.token`

**Frontend**
- New `client/src/services/socket.ts` (single shared client, auto-reconnect)
- `TokenDisplay` and `Monitor` swap polling for socket events

**Verification**
- Call next token in staff UI → citizen's "Estimated wait" updates without refresh

**Commit:** `feat(realtime): add Socket.IO events for queue updates`

---

### STEP 17 — Increment 8: AI Service-Duration Prediction (Python/FastAPI)

**Backend (new service)**
- `ai-service/` (new package, Python 3.11)
- Train from the existing 12k synthetic CSV (already in repo per §24)
- Two model candidates (RandomForest, HistGradientBoosting) — pick the lower MAE on a holdout set
- FastAPI: `POST /predict` input `{ service_type, hour, day_of_week, queue_length, active_counters, priority_case, complexity }` → `{ predicted_duration_minutes }`
- Dockerize: `Dockerfile` + `docker-compose.yml` service
- Save chosen model as `service_duration_model.joblib`

**Integration**
- Node server calls AI service before computing wait time (cache for 60s)
- Add `AI_SERVICE_URL` to `.env.example`
- Fallback to deterministic median if AI service is down

**Verification**
- `curl /predict` returns plausible numbers
- Node `estimator` uses AI value; offline mode falls back to median

**Commit:** `feat(ai): add Python FastAPI service-duration prediction`

---

### STEP 18 — Increment 9: Notifications

**Backend**
- New `Notification` model (userId, type, title, messageEn, messageNe, read, createdAt)
- Trigger from existing queue/stage/priority flows (token created, check-in, turn approaching, stage completed, etc.)
- `GET /api/notifications` + `POST /api/notifications/:id/read`

**Frontend**
- `NotificationBell` in `MainLayout` (badge with unread count)
- Dropdown with last 10 notifications
- Later (post-MVP): register service worker for browser push

**Verification**
- Generate token → notification "Token created"
- Stage completed → "Stage completed, proceed to room X"

**Commit:** `feat(notifications): add in-app notifications`

---

### STEP 19 — Increment 10 (continued): Admin Dashboard + Management

**Backend**
- CRUD endpoints for `GovernmentOffice`, `Service`, `ServiceStage`, `RequiredDocument`, `Counter`, `Staff`
- Queue policy config (priority, skip, deferred) stored per office
- All admin endpoints behind `requireRole(ADMIN)`

**Frontend**
- `pages/admin/*` with forms: office, service, stage, document, counter, staff
- Admin dashboard with summary cards
- Audit log viewer (already have data from Step 14)

**Commit:** `feat(admin): add management dashboard and CRUD`

---

### STEP 20 — Increment 11: Analytics & Reports

**Backend**
- `GET /api/admin/analytics/summary` (served, avg wait, avg duration, deferred, queue lengths, counter utilization, stage bottlenecks)
- `GET /api/admin/analytics/durations` (per service/stage trends)

**Frontend**
- `pages/admin/Analytics.tsx` with charts (use Recharts or Chart.js — keep one library)
- Filter by date range, service, office

**Commit:** `feat(analytics): add operational reports and admin dashboard`

---

### STEP 21 — Increment 12: PWA & Production Polish

**Tasks**
- Configure `vite-plugin-pwa` (already installed) — generate manifest, register service worker, set icons in `client/public/icons/`
- Add loading skeletons for every async page (the `Skeleton` component already exists)
- Empty states, error states, 404 page
- Lighthouse pass on Home, Monitor, TokenDisplay
- Accessibility: focus rings, aria-labels, keyboard nav for staff queue board

**Commit:** `chore(pwa): add manifest, service worker, and polish`

---

### STEP 22 — Increment 13: Full System Testing

**Tasks**
- Backend: Vitest or Jest unit tests for `estimator`, `policy`, `otpStore`, token lifecycle, stage transfer
- Backend: integration tests using `supertest`
- Frontend: Vitest + Testing Library for forms, navigation, language switch
- E2E: Playwright covering the full journey in roadmap §13 (register → OTP → token → check-in → stages → complete)

**Commit:** `test: add backend, frontend, and E2E test suites`

---

## Critical Files Reference

> **Convention:** all source files are `.js` (server) or `.jsx` (client). No `.ts`/`.tsx` anywhere. No `tsconfig.json` in either package.

**To create (server, plain JS)**
- `server/prisma/schema.prisma` *(unchanged — Prisma schema is its own language)*
- `server/prisma/seed.js` *(converted from `.ts`)*
- `server/src/db.js` *(converted)*
- `server/src/middleware/auth.js`
- `server/src/services/auth/jwt.js`
- `server/src/services/queue/estimator.js`
- `server/src/services/queue/policy.js`
- `server/src/services/queue/timeout.js`
- `server/src/routes/services.js`
- `server/src/routes/tokens.js`
- `server/src/routes/notifications.js`
- `server/src/routes/admin/*.js`
- `server/src/routes/staff/tokens.js`
- `server/src/socket.js`

**To create (client, plain JSX)**
- `client/src/auth/AuthContext.jsx`
- `client/src/components/ProtectedRoute.jsx`
- `client/src/services/socket.js`
- `client/src/pages/services/ServiceList.jsx`
- `client/src/pages/services/ServiceDetail.jsx`
- `client/src/pages/staff/Dashboard.jsx`
- `client/src/pages/staff/QueueBoard.jsx`
- `client/src/pages/staff/CheckIn.jsx`
- `client/src/pages/admin/*.jsx`
- `client/src/components/ServiceCard.jsx`
- `client/src/components/ServiceRoadmap.jsx`
- `client/src/components/RequiredDocumentsList.jsx`
- `client/src/components/NotificationBell.jsx`

**To convert (existing `.ts`/`.tsx` → `.js`/`.jsx`)**
- Server: `server.ts`, `app.ts`, `db.ts`, `routes/auth/citizen.ts`, `staff.ts`, `queue.ts`, `routes/admin/debug.ts`, `services/auth/otp.ts`, `otpStore.ts`
- Client: `main.tsx`, `App.tsx`, `routes/AppRoutes.tsx`, `layouts/{MainLayout,AuthLayout}.tsx`, `components/ui/*.tsx`, `components/{Footer,LanguageSwitcher}.tsx`, `services/{api,health}.ts`, `i18n/index.ts`, all `pages/**/*.tsx`

**To create (AI service)**
- `ai-service/app.py`
- `ai-service/train.py`
- `ai-service/Dockerfile`
- `ai-service/requirements.txt`

**To modify (already exist, in plain JS)**
- `server/src/app.js` — mount new routers, add socket.io
- `server/src/server.js` — initialize socket
- `server/src/routes/auth/citizen.js` & `staff.js` — JWT/bcrypt
- `server/src/routes/queue.js` — already DB-driven
- `client/src/main.jsx` — wrap with `AuthProvider`
- `client/src/routes/AppRoutes.jsx` — add new routes + protected wrappers
- `client/src/pages/token/TokenGeneration.jsx` & `TokenDisplay.jsx` — real API
- `client/src/pages/token/QRScanner.jsx` — real check-in API
