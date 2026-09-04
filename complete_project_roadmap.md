# Complete Project Roadmap
## AI-Based Smart Service Flow Management System for Government Offices in Nepal

> **Academic context:** BIM 6th Semester Individual IT Project  
> **Project duration:** Approximately 3–4 months / one semester  
> **Development methodology:** Incremental Waterfall Model  
> **Primary demonstration domain:** Department of Transportation Management (DoTM) / driving-license-style government service workflow  
> **Platform:** Progressive Web Application (PWA)

---

# 1. Project Direction

The project evolved from a **Smart Queue Management System** into an **AI-Based Smart Service Flow Management System**.

The system is not intended to replace existing online government application portals. Instead, it focuses on improving the **remaining physical/in-person stages** of government service delivery.

The system addresses problems such as:

- Citizens not knowing the complete service process.
- Citizens not knowing where to go next.
- Uncertainty about required documents at each stage.
- Repeatedly asking staff or other citizens for guidance.
- Having to remain near physical queue displays.
- Uncertain waiting times.
- Inefficient multi-stage queue management.
- Poor visibility into bottlenecks and service-stage workload.

---

# 2. High-Level System Architecture

```text
Citizens / Staff / Administrators
              |
              v
        React PWA Frontend
              |
              v
      Node.js + Express API
              |
       +------+------+
       |             |
       v             v
 PostgreSQL       AI Service
   + Prisma       Python / ML
       |
       v
Service Flow + Queue Engine
```

Real-time communication will later use:

```text
Node.js + Socket.IO
```

The AI component will primarily predict **service duration**. The deterministic queue engine will use those predictions to calculate dynamic waiting time.

---

# 3. Development Principles

The entire project must be developed **feature by feature**.

Do not build the whole system at once.

For each feature:

```text
Define Requirements
       |
       v
Design Database / API
       |
       v
Build Backend
       |
       v
Test Backend
       |
       v
Build / Update Frontend
       |
       v
Integrate
       |
       v
Test Complete Feature
       |
       v
Commit to Git
       |
       v
Move to Next Feature
```

AI should mainly assist with frontend implementation. The project owner should understand and implement the backend, database, business logic, queue engine, authentication, and AI integration.

---

# 4. INCREMENT 1 — PROJECT FOUNDATION

## Goal

Create a clean technical foundation and authentication-ready structure.

### Phase 1.1 — Repository and Development Setup

Tasks:

- Create Git repository.
- Create root project.
- Create client and server folders.
- Configure Git.
- Create root `.gitignore`.
- Create README.
- Configure development scripts.

### Phase 1.2 — Frontend Foundation

Technology:

- React
- TypeScript
- Vite
- Tailwind CSS
- React Router
- Axios
- TanStack Query
- i18next
- react-i18next
- Lucide icons
- PWA foundation

Tasks:

- Establish frontend structure.
- Configure routing.
- Configure API client.
- Configure reusable design system.
- Establish responsive layout foundation.

### Phase 1.3 — Backend Foundation

Technology:

- Node.js
- TypeScript
- Express

Tasks:

- Configure Express.
- Configure environment variables.
- Configure CORS.
- Add Helmet.
- Add centralized error handling.
- Add `/api/health`.
- Establish controller/service/route structure.

### Phase 1.4 — Database Foundation

Technology:

- PostgreSQL
- Prisma

Initial models:

- User
- GovernmentOffice
- Service
- ServiceStage
- RequiredDocument
- OTP verification
- Role enum
- Language enum

### Phase 1.5 — Authentication

Citizen:

- Registration
- Mobile OTP verification
- Login
- Logout
- Language preference

Staff/Admin:

- Admin-created accounts
- Login
- Role-based authorization

Security:

- bcrypt
- JWT
- OTP expiry
- OTP attempt limits
- OTP single use
- Input validation
- Protected routes

### Phase 1.6 — Bilingual Foundation

Support:

- English
- Nepali

Implement:

- Language selector
- Translation files
- Persistent language preference
- Bilingual authentication UI

### Increment 1 Completion Criteria

The following should work:

```text
React starts
Backend starts
Database connects
Prisma migration works
Registration works
OTP verification works
Login works
JWT works
RBAC works
Logout works
English/Nepali switching works
```

### Suggested Git commits

```text
chore: initialize project repository
chore: initialize React TypeScript frontend
chore: configure frontend development stack
chore: establish frontend architecture
chore: initialize Express TypeScript backend
feat: add backend health check
feat: connect frontend to backend API
feat: add English and Nepali internationalization
chore: configure PWA foundation
feat: add shared UI design system
feat: add Prisma database schema
feat: add citizen registration
feat: add phone OTP verification
feat: add JWT authentication
feat: add role based authorization
feat: add protected frontend routes
docs: add project setup documentation
chore: complete increment 1 foundation
```

---

# 5. INCREMENT 2 — SERVICE INFORMATION & CITIZEN GUIDANCE

## Goal

Allow citizens to understand a government service before and during their visit.

This increment is central to the project's identity.

---

## Feature 2.1 — Government Services

Citizen can:

- Browse available government services.
- Search/filter services.
- Select a service.
- View the responsible office.
- View office information and service hours.

Backend:

- Service listing API.
- Service details API.

Frontend:

- Service list page.
- Service cards.
- Service details page.

---

## Feature 2.2 — Service Roadmap

For each service, display the complete sequence.

Example:

```text
Application
    ↓
Medical Verification
    ↓
Office Approval
    ↓
Written Exam
    ↓
Trial
    ↓
License Fee
    ↓
License Generation
```

The roadmap must show:

- Completed stage.
- Current stage.
- Upcoming stages.
- Remaining stages.

The stage order must come from the database.

Do not hard-code the sequence in React.

---

## Feature 2.3 — Required Documents

Each stage can contain required documents.

Example:

```text
Medical Verification

Required:
- Citizenship / NID
- Application Receipt
- Medical Report
```

Support:

- English document name.
- Nepali document name.
- Description.
- Document type.
- Active/inactive status.

The citizen should be able to view documents associated with the current stage.

---

## Feature 2.4 — Office and Stage Guidance

Display:

- Office location.
- Room number where relevant.
- Counter number where relevant.
- Current stage instructions.
- Next stage instructions.

Later, these values may become configurable by staff/admin.

### Increment 2 Completion Criteria

Citizen can:

```text
Login
  ↓
Browse Service
  ↓
Open Service Details
  ↓
See Complete Roadmap
  ↓
See Required Documents
  ↓
Understand Current/Next Stage
```

### Suggested Git commits

```text
feat: add service information API
feat: add service listing UI
feat: add service details UI
feat: add service roadmap
feat: add required document management
feat: add bilingual service content
feat: add office and stage guidance
test: validate service information flow
chore: complete increment 2 service guidance
```

---

# 6. INCREMENT 3 — DIGITAL TOKEN & CHECK-IN

## Goal

Introduce the first complete digital queue functionality.

---

## Feature 3.1 — Digital Token Generation

Citizen:

```text
Select Service
      ↓
Generate Token
      ↓
Receive Same-Day Token
```

Token should contain:

- Unique token number.
- Service.
- Current stage.
- Generated date/time.
- Queue position.
- Status.

### Critical rule

**Token generation time determines queue position.**

Check-in does not determine queue position.

---

## Feature 3.2 — Queue Position Reservation

When token is generated:

```text
Token A001 → Position 1
Token A002 → Position 2
Token A003 → Position 3
```

The queue position remains associated with the token.

A citizen arriving later does not receive a new position based on check-in time.

---

## Feature 3.3 — QR Code

Generate a secure QR code associated with the token.

QR should identify the token but should not expose unnecessary sensitive information.

---

## Feature 3.4 — Check-in

Two methods:

### QR Check-in

Staff scans citizen QR code.

### Manual Check-in

Staff searches by:

- Token number.
- Mobile number.
- Other approved identifier.

Both methods lead to:

```text
Generated
   ↓
Checked-in
```

Check-in confirms physical arrival.

---

## Feature 3.5 — No-Show Handling

If the citizen is not checked in when their turn arrives:

```text
Not checked in
      ↓
Skipped / Expired
```

The token must not block the queue forever.

Exact timeout rules can be configured later.

---

## Feature 3.6 — Cancellation

Citizen can cancel an active token before service according to the rules defined by the system.

### Increment 3 Completion Criteria

```text
Generate Token
      ↓
Reserve Queue Position
      ↓
Receive QR
      ↓
Visit Office
      ↓
QR or Manual Check-in
      ↓
Active Queue
```

### Suggested Git commits

```text
feat: add token data model
feat: implement digital token generation
feat: implement queue position reservation
feat: add token details UI
feat: add QR token generation
feat: add QR check-in
feat: add manual check-in
feat: add token no-show handling
feat: add token cancellation
test: validate token and check-in flow
chore: complete increment 3 token and check-in
```

---

# 7. INCREMENT 4 — MULTI-STAGE SERVICE FLOW

## Goal

Turn the queue system into a true service-flow management system.

---

## Feature 4.1 — Stage-Specific Queues

Each service stage can have its own queue.

Example:

```text
Medical Queue
Approval Queue
Written Exam Queue
Trial Queue
Fee Queue
```

A citizen only joins the queue for the stage they are currently eligible for.

---

## Feature 4.2 — Staff Queue Operations

Staff should be able to:

- View current stage queue.
- Call next token.
- Start service.
- Skip token.
- Recall skipped token.
- Complete service.

Token lifecycle:

```text
Generated
    ↓
Checked-in
    ↓
Serving
    ↓
Completed
```

Alternative:

```text
Skipped
Cancelled
Expired
Deferred
```

---

## Feature 4.3 — Stage Transfer

After completion:

```text
Current Stage Completed
        ↓
Next Stage Activated
        ↓
Citizen Notified
        ↓
Citizen Eligible For Next Queue
```

Example:

```text
Medical Completed
        ↓
Office Approval Activated
        ↓
Room 204
```

The next stage must come from the configured `stageOrder`.

---

## Feature 4.4 — Multiple Counters

Each stage/department can have multiple counters.

Example:

```text
Counter 1 → A042
Counter 2 → A043
Counter 3 → Available
```

Support:

- Counter activation/deactivation.
- Current token.
- Assigned staff.
- Counter status.
- Multiple counters serving simultaneously.

---

## Feature 4.5 — Citizen Stage Progress

Citizen sees:

```text
✓ Application
✓ Medical
→ Office Approval
○ Written Exam
○ Trial
○ Fee
○ Generation
```

Also display:

- Current room.
- Current counter.
- Current queue.
- Estimated wait.

### Increment 4 Completion Criteria

A citizen can move through multiple stages:

```text
Stage 1
 ↓
Stage 2
 ↓
Stage 3
 ↓
...
 ↓
Final Completion
```

### Suggested Git commits

```text
feat: add stage queue model
feat: add staff queue operations
feat: add service stage transitions
feat: add multiple counter management
feat: add citizen stage progress
feat: add staff queue interface
test: validate multi-stage service flow
chore: complete increment 4 service flow
```

---

# 8. INCREMENT 5 — DYNAMIC WAITING-TIME ENGINE

## Goal

Solve the panel's concern about fixed waiting-time estimates.

Do not integrate AI yet.

First build a correct deterministic estimation engine.

---

## Feature 5.1 — Service Duration History

Record actual service duration:

```text
serviceStartTime
serviceCompletedTime
actualDuration
```

Maintain recent service-duration history.

Initial basic estimate can use recent average service duration.

---

## Feature 5.2 — Current Service Progress

Track:

- Expected duration.
- Elapsed time.
- Remaining estimated time.

If a service takes longer than expected, the estimation must adapt.

---

## Feature 5.3 — Dynamic Recalculation

Recalculate waiting time when:

- Service starts.
- Service completes.
- Service takes longer.
- Service finishes early.
- Token is skipped.
- Token is recalled.
- Priority token is added.
- Counter becomes unavailable.
- Counter becomes available.
- Citizen moves to another stage.

---

## Feature 5.4 — Multiple Counter Estimation

Do not use only:

```text
people ahead × average duration
```

Instead:

```text
Counter availability
+
Expected service durations
+
Queue order
+
Current active services
        ↓
Projected service schedule
        ↓
Estimated waiting time
```

---

## Feature 5.5 — Citizen Waiting-Time Display

Example:

```text
Your Token
A042

Position
5

Estimated Wait
28 minutes

Last Updated
10:34 AM
```

When conditions change:

```text
28 min → 35 min
```

Show a clear update indicator.

---

## Real-World Test Scenarios

The engine must handle:

### Scenario A — Service finishes early
Waiting time decreases.

### Scenario B — Service takes longer
Waiting time increases.

### Scenario C — Counter unavailable
Waiting time increases.

### Scenario D — Counter available again
Waiting time can decrease.

### Scenario E — Token skipped
People behind move forward.

### Scenario F — Priority token enters
Affected estimates change according to policy.

### Scenario G — Multiple counters
Estimate is based on projected counter availability.

### Increment 5 Completion Criteria

Demonstrate:

```text
Queue Changes
      ↓
Engine Detects Change
      ↓
Estimate Recalculated
      ↓
Citizen Sees New Estimate
```

### Suggested Git commits

```text
feat: record service durations
feat: add initial waiting time estimator
feat: add dynamic queue recalculation
feat: add multi-counter waiting time calculation
feat: add waiting time UI
test: simulate dynamic waiting time scenarios
chore: complete increment 5 waiting time engine
```

---

# 9. INCREMENT 6 — PRIORITY & DEFERRED SERVICE

## Goal

Handle real-world exceptional cases fairly.

---

## Feature 6.1 — Priority Requests

Possible categories:

- Senior citizen.
- Person with disability.
- Pregnant woman.
- Emergency.

System does not independently decide eligibility.

Staff verifies according to office rules.

Flow:

```text
Priority Requested
        ↓
Staff Verification
        ↓
Approved / Rejected
        ↓
Queue Policy Applied
```

Record:

- Reason.
- Staff ID.
- Timestamp.
- Decision.

---

## Feature 6.2 — Alternating Priority Policy

Current default:

```text
Priority
Normal
Priority
Normal
```

when both queues contain eligible citizens.

If one queue is empty:

```text
Continue with available queue
```

Design the queue engine so more policies can be added later.

---

## Feature 6.3 — Deferred Service

If service cannot be completed before office closure:

```text
Service not completed
        ↓
Deferred
        ↓
Recorded
        ↓
Next-day treatment
```

A valid citizen should not repeatedly lose service just because they were last in the queue.

The exact carry-over/deferred policy can be configurable.

---

## Feature 6.4 — Audit Logging

Record:

- Token creation.
- Check-in.
- Token called.
- Token skipped.
- Recall.
- Priority approval/rejection.
- Stage completion.
- Stage transfer.
- Counter changes.
- Deferral.
- Queue modifications.

### Increment 6 Completion Criteria

The system can handle:

```text
Normal Queue
Priority Queue
Skipped Tokens
Deferred Citizens
Audit Records
```

### Suggested Git commits

```text
feat: add priority request handling
feat: add priority verification
feat: implement alternating queue policy
feat: add deferred service handling
feat: add queue audit logging
test: validate priority and deferred scenarios
chore: complete increment 6 fairness and audit
```

---

# 10. INCREMENT 7 — REAL-TIME COMMUNICATION

## Goal

Remove the need for page refreshes.

Technology:

**Socket.IO**

---

## Real-Time Events

Examples:

```text
TOKEN_CALLED
SERVICE_STARTED
SERVICE_COMPLETED
TOKEN_SKIPPED
TOKEN_RECALLED
COUNTER_CHANGED
STAGE_CHANGED
QUEUE_UPDATED
WAITING_TIME_UPDATED
PRIORITY_UPDATED
```

Citizen screen should update automatically.

Staff screen should update automatically.

Admin monitoring should update automatically.

### Increment 7 Completion Criteria

```text
Queue changes
     ↓
Backend event
     ↓
Connected clients receive update
     ↓
UI updates automatically
```

### Suggested Git commits

```text
feat: configure Socket.IO
feat: add real-time queue events
feat: add real-time citizen updates
feat: add real-time staff updates
test: validate real-time queue synchronization
chore: complete increment 7 real-time communication
```

---

# 11. INCREMENT 8 — AI SERVICE-DURATION PREDICTION

## Goal

Use machine learning to improve service-duration estimation.

The AI must predict:

> **Expected service duration**

It should not control queue fairness.

---

## Feature 8.1 — Dataset

Initial prototype uses simulated data.

Example features:

- Service type.
- Hour.
- Day of week.
- Queue length.
- Active counters.
- Priority status.
- Case complexity.
- Actual service duration.

The existing prototype contains a synthetic dataset of approximately 12,000 records.

---

## Feature 8.2 — Model Training

Initial candidate models:

- Random Forest Regressor.
- HistGradientBoosting Regressor.

The current synthetic prototype showed HistGradientBoosting performing best on the simulated test set.

Current synthetic prototype metrics:

- MAE ≈ 1.51 minutes.
- RMSE ≈ 1.90 minutes.
- R² ≈ 0.854.

These metrics apply ONLY to the synthetic data.

Do not present them as real DoTM performance.

---

## Feature 8.3 — Prediction API

Use a Python service, likely FastAPI.

Example:

```text
POST /predict
```

Input:

```text
service_type
hour
day_of_week
queue_length
active_counters
priority_case
complexity
```

Output:

```text
predicted_duration
```

---

## Feature 8.4 — Queue Engine Integration

```text
AI Model
   ↓
Predicted Duration
   ↓
Dynamic Queue Engine
   ↓
Waiting Time
   ↓
Citizen
```

The deterministic queue engine remains responsible for:

- Order.
- Priority.
- Skip.
- Recall.
- Deferral.
- Stage transition.

### Increment 8 Completion Criteria

AI successfully predicts service duration and feeds the result into the waiting-time engine.

### Suggested Git commits

```text
feat: prepare synthetic training dataset
feat: train service duration models
feat: evaluate prediction models
feat: create ai prediction service
feat: integrate ai duration prediction
test: validate ai prediction integration
chore: complete increment 8 ai prediction
```

---

# 12. INCREMENT 9 — NOTIFICATIONS

## Goal

Keep citizens informed without requiring continuous screen monitoring.

Initial implementation:

**In-app notifications**

Later enhancement:

**Browser push notifications**

Examples:

- Token created.
- Check-in successful.
- Turn approaching.
- Proceed to room/counter.
- Stage completed.
- Next stage activated.
- Waiting time changed significantly.
- Service deferred.

### Increment 9 Completion Criteria

Citizen receives relevant notifications at major service-flow events.

### Suggested Git commits

```text
feat: add notification model
feat: add in-app notifications
feat: add stage transition notifications
feat: add queue turn notifications
test: validate notification events
chore: complete increment 9 notifications
```

---

# 13. INCREMENT 10 — STAFF & ADMINISTRATION

## Goal

Complete administrative control of the platform.

---

## Staff Features

### Staff Dashboard

Show:

- Current stage.
- Current queue.
- Current token.
- Counter status.
- Waiting citizens.
- Priority requests.
- Deferred cases.

### Staff Operations

- Check in.
- Call next.
- Start service.
- Skip.
- Recall.
- Complete.
- Transfer to next stage.

---

## Administrator Features

### Office Management

- Create/edit office.
- Location.
- Hours.
- Status.

### Service Management

- Create/edit service.
- English/Nepali content.
- Service category.

### Stage Management

- Add/remove/reorder stages.
- Stage descriptions.
- Baseline duration.
- Stage location.

### Required Document Management

- Add/edit documents.
- Attach documents to stages.
- English/Nepali content.

### Counter Management

- Create/edit counters.
- Activate/deactivate.
- Assign staff.
- Associate counter with stage.

### Staff Management

- Create staff.
- Assign office.
- Assign role.
- Activate/deactivate account.

### Queue Policy Management

- Queue order.
- Priority policy.
- Skip rules.
- Deferred policy.

---

# 14. INCREMENT 11 — ANALYTICS & REPORTS

## Goal

Provide operational decision support.

Do not overbuild this.

---

## Basic Analytics

- Citizens served.
- Average waiting time.
- Average service duration.
- Deferred cases.
- Queue lengths.
- Counter utilization.
- Stage bottlenecks.

---

## AI/Prediction Analytics

Potentially:

- Predicted workload.
- Service-duration trends.
- Peak-period analysis.

These can use accumulated system data.

Do not claim accurate forecasting until sufficient real data exists.

### Increment 11 Completion Criteria

Administrator can view meaningful operational information.

### Suggested Git commits

```text
feat: add operational analytics
feat: add queue performance reports
feat: add counter utilization reports
feat: add service duration reports
feat: add admin analytics dashboard
test: validate analytics calculations
chore: complete increment 11 analytics
```

---

# 15. INCREMENT 12 — PWA & PRODUCTION POLISH

## Goal

Make the system polished and practical across devices.

Tasks:

- PWA manifest.
- Service worker refinement.
- Installability.
- Responsive mobile UI.
- Desktop optimization.
- Browser notification support where appropriate.
- Performance improvements.
- Accessibility improvements.
- Loading states.
- Error states.
- Empty states.
- Security hardening.

Do not redesign the visual system at this stage.

---

# 16. INCREMENT 13 — COMPLETE SYSTEM TESTING

Test three levels.

## Backend Tests

- Authentication.
- Authorization.
- Service APIs.
- Token logic.
- Queue logic.
- Stage transitions.
- Priority logic.
- Deferred logic.
- Waiting-time engine.
- AI prediction API.

## Frontend Tests

- Forms.
- Navigation.
- Language switching.
- Responsive layouts.
- Loading states.
- Error states.
- Notifications.

## End-to-End Testing

Complete journey:

```text
Register
   ↓
OTP verification
   ↓
Login
   ↓
Select Service
   ↓
Read Documents
   ↓
View Roadmap
   ↓
Generate Token
   ↓
Check-in
   ↓
Join Queue
   ↓
Monitor Waiting Time
   ↓
Service
   ↓
Move to Next Stage
   ↓
Repeat
   ↓
Service Complete
```

---

# 17. IMPORTANT REAL-WORLD TEST SCENARIOS

Before final deployment, explicitly test:

## Scenario A — Remote Token

Citizen A generates token before Citizen B.

B arrives first.

B must NOT receive a higher queue priority merely because B checked in earlier.

---

## Scenario B — No-Show

Citizen generates token but never checks in.

Their token must not block the queue indefinitely.

---

## Scenario C — Long Service

Current service exceeds predicted duration.

Estimated waiting times behind it must update.

---

## Scenario D — Early Completion

Current service finishes earlier than expected.

Estimated waiting times should decrease where appropriate.

---

## Scenario E — Counter Failure

One active counter becomes unavailable.

Waiting times should recalculate.

---

## Scenario F — Counter Recovery

Counter becomes available again.

Waiting times should recalculate.

---

## Scenario G — Priority Case

Verified priority case enters the queue.

Queue policy is applied.

Affected estimates update.

Action is recorded in audit log.

---

## Scenario H — Office Closure

Citizen cannot be served before closing.

Citizen becomes deferred according to policy.

Citizen must not repeatedly lose opportunity.

---

## Scenario I — Multi-Stage Transfer

Stage completes.

Citizen moves to next stage.

Citizen receives guidance and notification.

---

# 18. FINAL IMPLEMENTATION ORDER

Use this exact high-level order:

```text
1. Project Setup
2. Database Foundation
3. Authentication
4. UI Design System
5. Service Information
6. Service Roadmap
7. Required Documents
8. Token Generation
9. QR/Manual Check-in
10. One Complete Queue Stage
11. Multi-Stage Service Flow
12. Multiple Counters
13. Staff Queue Management
14. Dynamic Waiting-Time Engine
15. Priority & Deferred Handling
16. Real-Time Communication
17. AI Prediction
18. Notifications
19. Admin Management
20. Analytics & Reports
21. PWA Polish
22. Full Testing
23. Deployment
```

---

# 19. FRONTEND/BACKEND COLLABORATION WORKFLOW

For each feature:

### Step 1 — Define requirements

Decide exactly what the feature should do.

### Step 2 — Define backend contract

Decide:

- Database changes.
- API endpoint.
- Request format.
- Response format.
- Validation.
- Authorization.

### Step 3 — Backend

Project owner implements and tests the backend.

### Step 4 — Frontend

Claude builds/updates the frontend using the agreed API contract and existing UI reference.

### Step 5 — Integration

Connect the real API.

### Step 6 — Testing

Test the complete feature.

### Step 7 — Git

Commit and push.

---

# 20. GIT STRATEGY

## Main branch

```text
main
```

Only stable working code should be merged into `main`.

## Feature branches

Examples:

```text
feature/authentication
feature/service-information
feature/service-roadmap
feature/required-documents
feature/digital-token
feature/check-in
feature/queue-management
feature/waiting-time
feature/priority
feature/deferred-service
feature/realtime
feature/ai-prediction
feature/notifications
feature/admin
feature/analytics
```

Create branches only when the feature begins.

---

# 21. STANDARD GIT CYCLE

Before a new feature:

```powershell
git status
```

Make sure the working tree is clean.

Create branch:

```powershell
git checkout -b feature/<feature-name>
```

During implementation:

```text
Build
↓
Test
↓
Commit
```

At completion:

```powershell
git checkout main
git merge feature/<feature-name>
git push
```

The exact branching workflow can be simplified if desired, but stable `main` should always remain runnable.

---

# 22. COMMIT GUIDELINES

Use clear Conventional Commit-style messages:

```text
feat: add service information API
fix: correct queue position calculation
refactor: simplify token service
test: add queue estimation tests
docs: update setup instructions
chore: configure PWA
```

Do not make meaningless commits such as:

```text
update
changes
final
new
working
```

One commit should represent a logical unit of work.

---

# 23. UI DESIGN PRINCIPLES

The interface should look like:

**Modern government software**

not:

**AI-generated startup dashboard**

Preferred:

- Light theme.
- White/light-gray surfaces.
- Blue primary accent.
- Strong typography.
- Subtle borders.
- Subtle shadows.
- Simple line icons.
- Clear hierarchy.
- Functional layouts.
- Generous but purposeful whitespace.
- English/Nepali support.

Avoid:

- Glassmorphism.
- Neon.
- Excessive gradients.
- Huge rounded cards.
- Decorative 3D graphics.
- Excessive animations.
- Generic AI/SaaS aesthetic.

Use the approved UI reference image as a visual language reference.

---

# 24. CURRENT AI PROTOTYPE STATUS

A synthetic transportation-office dataset and initial machine-learning models already exist.

Files:

```text
synthetic_dotm_service_data.csv
service_duration_model.joblib
model_comparison.csv
sample_predictions.csv
actual_vs_predicted.png
```

Initial dataset:
- Approximately 12,000 synthetic service records.

Current features:
- Service type
- Hour
- Day of week
- Queue length
- Active counters
- Priority status
- Complexity

Target:
- Actual service duration in minutes.

Important:
These are simulated data and prototype results only.

Real government data must be used for trustworthy production evaluation.

---

# 25. FEATURES THAT SHOULD NOT BE IMPLEMENTED AS CORE REQUIREMENTS

Unless the scope is explicitly changed, do not make these core features:

- Guest citizens.
- Appointment scheduling for the initial DoTM-style workflow.
- Automatic disability verification.
- National ID integration.
- Government database integration.
- Online payment.
- Biometric authentication.
- Native-only Android/iOS app.
- Reinforcement learning.
- Complex AI beyond project need.
- National-scale deployment.
- Cross-office shared live queue.
- Full SMS provider integration.

These can be future enhancements.

---

# 26. FINAL CORE FEATURE SET

## Citizen

- Account registration/login.
- English/Nepali.
- Government service information.
- Service roadmap.
- Required documents.
- Digital token.
- QR/manual check-in.
- Live queue status.
- Dynamic waiting time.
- Stage progress.
- Notifications.
- Service/queue history.

## Staff

- Staff login.
- Citizen check-in verification.
- Stage queue management.
- Multiple counters.
- Call/skip/recall/complete.
- Stage transfer.
- Priority handling.
- Deferred service handling.
- Operational monitoring.
- Audit logs.

## Administrator

- Office management.
- Service management.
- Stage management.
- Required documents.
- Counter management.
- Staff management.
- Queue policy configuration.
- Reports.
- Analytics.
- Audit logs.

## AI

- Service-duration prediction.
- Dynamic waiting-time support.
- Operational analytics where data is available.

---

# 27. FINAL SUCCESS CRITERIA

The complete project should demonstrate:

### Citizen problem solved

Citizen can understand:

```text
What service am I using?
        ↓
What steps are required?
        ↓
What documents do I need?
        ↓
Where do I go?
        ↓
How long might I wait?
        ↓
What is my current status?
        ↓
What happens next?
```

### Government-office problem solved

Staff/admin can understand:

```text
Who is waiting?
        ↓
Which stage is congested?
        ↓
Which counters are active?
        ↓
How long are services taking?
        ↓
Are priority cases being handled correctly?
        ↓
Which citizens were deferred?
        ↓
What is the overall service performance?
```

### Core technical demonstration

```text
Multi-stage Service Flow
          +
Queue Management
          +
Dynamic Waiting Time
          +
AI Service Prediction
          +
Citizen Guidance
          +
Operational Monitoring
          +
Auditability
```

---

# 28. PROJECT HANDOFF RULE

When another AI assistant is used:

1. Provide this roadmap/context.
2. Tell it the **current increment and feature**.
3. Attach the approved UI reference when frontend work is involved.
4. Tell it to inspect the existing repository before changing files.
5. Tell it exactly what is in scope.
6. Tell it not to implement future increments.
7. Preserve existing architecture unless there is a demonstrated reason to change it.
8. Keep backend API contracts consistent.
9. Do not fabricate government integrations or real government data.
10. Test before moving to the next feature.

---

# 29. CURRENT IMMEDIATE PLAN

The immediate development sequence is:

```text
PHASE 1 — PROJECT SETUP
        ↓
PHASE 2 — DATABASE SCHEMA
        ↓
PHASE 3 — AUTHENTICATION
```

After these are complete:

```text
Service Information
        ↓
Service Roadmap
        ↓
Required Documents
        ↓
Digital Token
        ↓
Check-in
        ↓
Queue
...
```

Do not skip ahead.

---

# 30. CORE PROJECT PRINCIPLE

The project is not merely a queue application.

The system's core purpose is:

> **To guide citizens through multi-stage government services while making the in-person service process more predictable, transparent, and efficiently manageable.**

AI is one supporting technology, not the entire product.
