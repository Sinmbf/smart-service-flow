# Graph Report - smart-service-flow  (2026-09-06)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 264 nodes · 546 edges · 16 communities (11 shown, 1 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 4 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `c1f4c176`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- AppRoutes.jsx
- app.js
- devDependencies
- Card
- dependencies
- dependencies
- ServiceDetail.jsx
- server/package.json
- server.js
- package.json
- main.jsx
- seed.js

## God Nodes (most connected - your core abstractions)
1. `useAuth()` - 25 edges
2. `Card()` - 18 edges
3. `MainLayout()` - 13 edges
4. `Button()` - 12 edges
5. `prisma` - 12 edges
6. `api` - 11 edges
7. `useActiveToken()` - 9 edges
8. `scripts` - 9 edges
9. `AuthLayout()` - 8 edges
10. `fetchMyActiveTokens()` - 7 edges

## Surprising Connections (you probably didn't know these)
- `SmartRedirect()` --calls--> `useAuth()`  [EXTRACTED]
  client/src/routes/AppRoutes.jsx → client/src/auth/AuthContext.jsx
- `ServiceSelection()` --calls--> `fetchServices()`  [EXTRACTED]
  client/src/pages/token/ServiceSelection.jsx → client/src/services/services.js
- `LanguageSwitcher()` --calls--> `useAuth()`  [EXTRACTED]
  client/src/components/LanguageSwitcher.jsx → client/src/auth/AuthContext.jsx
- `ProtectedRoute()` --calls--> `useAuth()`  [EXTRACTED]
  client/src/components/ProtectedRoute.jsx → client/src/auth/AuthContext.jsx
- `useActiveToken()` --calls--> `useAuth()`  [EXTRACTED]
  client/src/hooks/useActiveToken.js → client/src/auth/AuthContext.jsx

## Import Cycles
- None detected.

## Communities (16 total, 1 thin omitted)

### Community 0 - "AppRoutes.jsx"
Cohesion: 0.11
Nodes (32): AuthContext, TOKEN_KEY, useAuth(), Footer(), LanguageSwitcher(), ProtectedRoute(), useActiveToken(), MainLayout() (+24 more)

### Community 1 - "app.js"
Cohesion: 0.12
Nodes (23): adapter, prisma, requireAuth(), requireRole(), router, NOTE: Do NOT return the OTP in response for security, router, router (+15 more)

### Community 2 - "devDependencies"
Cohesion: 0.07
Nodes (26): devDependencies, eslint, @eslint/js, eslint-plugin-react-hooks, eslint-plugin-react-refresh, globals, vite, vite-plugin-pwa (+18 more)

### Community 3 - "Card"
Cohesion: 0.24
Nodes (8): Button(), Card(), Input, PasswordInput, AuthLayout(), CheckIn(), api, checkInToken()

### Community 4 - "dependencies"
Cohesion: 0.08
Nodes (25): axios, dependencies, axios, framer-motion, i18next, lucide-react, qrcode, react (+17 more)

### Community 5 - "dependencies"
Cohesion: 0.10
Nodes (21): bcrypt, cors, dotenv, express, helmet, jsonwebtoken, pg, prisma (+13 more)

### Community 6 - "ServiceDetail.jsx"
Cohesion: 0.18
Nodes (10): OfficeInfoBlock(), RequiredDocumentsList(), ServiceCard(), ServiceRoadmap(), STATUS_STYLES, Skeleton(), ServiceDetail(), ServiceList() (+2 more)

### Community 7 - "server/package.json"
Cohesion: 0.11
Nodes (17): author, description, keywords, license, main, name, scripts, db:migrate (+9 more)

### Community 8 - "server.js"
Cohesion: 0.27
Nodes (7): app, checkDatabaseConnection(), shutdown(), start(), startNoShowSweeper(), stopNoShowSweeper(), sweepNoShows()

### Community 9 - "package.json"
Cohesion: 0.18
Nodes (10): author, description, keywords, license, main, name, scripts, test (+2 more)

### Community 10 - "main.jsx"
Cohesion: 0.33
Nodes (4): App(), AuthProvider(), savedLanguage, AppRoutes()

## Knowledge Gaps
- **73 isolated node(s):** `AuthContext`, `TOKEN_KEY`, `STATUS_LABEL`, `STATUS_FALLBACK_LABEL`, `adapter` (+68 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 85 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **1 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `dependencies` connect `dependencies` to `devDependencies`?**
  _High betweenness centrality (0.026) - this node is a cross-community bridge._
- **Why does `dependencies` connect `dependencies` to `server/package.json`?**
  _High betweenness centrality (0.016) - this node is a cross-community bridge._
- **What connects `AuthContext`, `TOKEN_KEY`, `STATUS_LABEL` to the rest of the system?**
  _73 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `AppRoutes.jsx` be split into smaller, more focused modules?**
  _Cohesion score 0.1110204081632653 - nodes in this community are weakly interconnected._
- **Should `app.js` be split into smaller, more focused modules?**
  _Cohesion score 0.1241565452091768 - nodes in this community are weakly interconnected._
- **Should `devDependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.07407407407407407 - nodes in this community are weakly interconnected._
- **Should `dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.08 - nodes in this community are weakly interconnected._