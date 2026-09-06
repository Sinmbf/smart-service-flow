# Counter-Level Check-In and No-Show Queue Policy

## Purpose

This document defines how citizen queue tokens, arrival, check-in, calling, no-shows, grace periods, skipping, and recall should work in the Smart Service Flow Management System.

Key design principle:

> **Queue position is reserved by token generation. Physical presence is confirmed at the assigned service counter.**

There is **no separate check-in counter, kiosk, reception desk, or dedicated check-in station**.

---

# 1. Counter-Level Check-In

Citizen check-in takes place **at the respective service counter**.

When a citizen reaches the assigned counter, the staff member serving that stage verifies the citizen's token using either:

- QR code scanning, or
- Manual token verification.

The same staff member can then start the service.

Check-in should not be treated as an independent physical stage.

```text
Token Generated
      ↓
Waiting / Monitoring Queue
      ↓
Turn Approaching
      ↓
Citizen Goes to Assigned Service Counter
      ↓
Staff Scans QR / Verifies Token
      ↓
Check-In Confirmed
      ↓
Service Starts
      ↓
Service Completed
```

Suitable citizen-facing message:

> **Your turn is approaching. Please proceed to Service Counter 2.**

Avoid wording such as:

> "Please check in at the office."

because there is no separate check-in point.

---

# 2. Token Generation Reserves Queue Position

Generating a token creates the citizen's position in the queue.

The queue position should be determined by the configured queue policy and token generation time, not simply by physical arrival at the office.

Example:

| Token | Generated | Position | Situation |
|------|-----------|----------|-----------|
| A001 | 10:00 | 1 | Already at office |
| A002 | 10:03 | 2 | Travelling to office |
| A003 | 10:05 | 3 | Already nearby |

A003 must **not automatically move ahead of A002 simply because A003 reaches the office earlier**.

Therefore:

> **Token creation reserves queue position.**
>
> **Counter-level check-in confirms that the citizen is physically ready to receive service.**

---

# 3. Remote Token and Arrival Problem

The system allows citizens to generate a token before physically reaching the office.

Example:

```text
A001 generates token at 9:00
A002 generates token at 9:05
A003 generates token at 9:10
```

The queue order remains:

```text
A001 → A002 → A003
```

Even if A003 physically reaches the office before A002, A003 does not jump ahead.

When A002's turn approaches, the system notifies A002 and instructs them to proceed to the assigned service counter.

If A002 has arrived, staff verifies the token and begins service.

If A002 has not arrived, the system must prevent A002 from blocking the queue indefinitely.

---

# 4. Token Status and Queue Lifecycle

Recommended lifecycle:

```text
GENERATED
   ↓
WAITING
   ↓
CALLED
   ↓
GRACE PERIOD
   ↓
CHECKED_IN
   ↓
SERVING
   ↓
COMPLETED
```

When the citizen does not appear:

```text
CALLED
   ↓
GRACE PERIOD
   ↓
SKIPPED
   ↓
OPTIONAL RECALL
   ↓
REJOIN QUEUE
```

Other statuses may also exist where needed:

- CANCELLED
- EXPIRED
- DEFERRED

Statuses should be retained as records rather than silently deleting tokens.

---

# 5. Calling the Citizen

When a citizen's turn approaches, notify them before the exact service turn.

Example:

> **Your turn is approaching.**
>
> Please proceed to Counter 2.

When their actual turn arrives, staff calls the token:

> **Token A003 — Please proceed to Counter 2.**

The staff then waits for the configured grace period.

---

# 6. Grace Period

The system should not immediately mark a citizen as absent the moment their token is called.

Provide a short, configurable **grace period**.

Example:

```text
Token A003 has been called.

Grace period remaining:
02:30
```

The exact duration should be configurable by the administrator because different offices may have different operational requirements.

For the prototype, a starting value of around **3 minutes** is reasonable, but it should remain a configurable policy rather than a universal fixed rule.

---

# 7. If the Citizen Arrives During the Grace Period

If the citizen reaches the counter during the grace period:

```text
CALLED
   ↓
Citizen arrives
   ↓
Staff scans QR / verifies token
   ↓
CHECKED_IN
   ↓
SERVING
```

The staff starts the service normally.

The token retains its original queue position.

---

# 8. If the Citizen Does Not Arrive

If the grace period expires and the citizen is still absent:

```text
CALLED
   ↓
Grace period expires
   ↓
SKIPPED
```

The token should **not be deleted**.

Instead, it becomes:

> **SKIPPED**

The next eligible token can then be called so the service counter does not remain idle and the absent citizen does not block the queue.

---

# 9. Why Skipping Is Better Than Cancellation

An absent citizen should normally not lose all information about their token immediately.

Preserve:

- Token number
- Original queue position
- Time token was called
- Counter
- Staff member
- Grace-period duration
- Time it was skipped
- Skip reason
- Any later recall action

Therefore:

> **Skipped ≠ Deleted**

A skipped token remains visible in citizen history and staff/admin records.

---

# 10. Recall / Rejoin Policy

After being skipped, a citizen may be given a controlled opportunity to receive service later.

Possible action:

> **Recall**

or

> **Rejoin Queue**

The citizen should **not regain the original queue position**.

Example:

```text
Original queue:

A001 → A002 → A003 → A004 → A005
                   ↑
                A003 absent

A003 is skipped.

Later:

A003 requests recall.
```

A003 should not return directly to position 3 because that could delay citizens who have already waited.

Instead, A003 enters an appropriate late/recall position according to the office's configured policy.

A simple initial policy is:

> **Skipped citizens rejoin at the end of the current eligible queue.**

The exact rule can later be configurable by administrators.

---

# 11. Limit on Recall

Unlimited recall should not be allowed.

A practical policy is:

```text
First absence
     ↓
Skip
     ↓
One recall opportunity
     ↓
If recalled but absent again
     ↓
Token expires / stage token closes
```

Suggested configurable settings:

```text
Grace Period: 3 minutes
Maximum Recalls: 1
Late Rejoin Policy: End of current queue
```

These are example defaults, not universal legal rules.

---

# 12. Distinguish Not Checked In vs Already Checked In

The system should distinguish between two situations.

## Case A — Citizen has not reached the counter

The citizen generated the token remotely but has not physically arrived.

```text
Token A003
Status: WAITING
Citizen has not arrived
```

When A003 reaches the front:

```text
WAITING
   ↓
CALLED
   ↓
Grace Period
   ↓
Citizen absent
   ↓
SKIPPED
```

A003 should not block everyone else.

## Case B — Citizen has reached the office but is not at the counter

A citizen may have reached the office but temporarily be away from the assigned counter.

Examples:

- moving between rooms,
- speaking with another staff member,
- temporarily away from the waiting area,
- handling another service stage.

In this situation:

```text
CALLED
   ↓
GRACE PERIOD
   ↓
Recall (optional)
   ↓
SKIPPED
```

Staff should not be forced to wait indefinitely.

---

# 13. Recommended Staff Interface

The staff queue screen should clearly show the currently called citizen.

Example:

```text
--------------------------------------------------
Token: A003

Status: Called

Counter: 2

Waiting for citizen...

Grace period remaining:
02:15

--------------------------------------------------

[ Start Service ]   [ Recall ]   [ Skip ]
```

Important behavior:

- **Start Service** becomes usable when the citizen is present and verified.
- **Recall** follows the configured recall policy.
- **Skip** should only be allowed after the grace period has expired, unless an administrator-configured exception exists.
- The system records which staff member performed the action and when.

Avoid giving staff an unrestricted "move to front" or arbitrary skip mechanism.

---

# 14. Citizen-Side Notifications

Citizen should not have to constantly watch the queue.

Suggested notification sequence:

### Early notice

> **Your turn is approaching.**
>
> Estimated wait: 10 minutes.

### Near turn

> **Please prepare to proceed to Counter 2.**

### Called

> **Your token A003 has been called.**
>
> Please proceed to Counter 2.

### Missed turn

> **Your token A003 was skipped because you did not arrive during the grace period.**

### Recall opportunity

> **You may request recall according to the office queue policy.**

Notification wording should be available in both English and Nepali.

---

# 15. Citizens Should Not Need to Wait Beside the Counter

One purpose of the digital queue is to reduce unnecessary crowding.

Citizen should be able to monitor:

- Current token being served
- Their token
- Number of eligible tokens ahead
- Estimated waiting time
- Assigned counter/room
- Turn-approaching notification

This allows the citizen to stay nearby rather than physically crowding around the service counter.

Estimated waiting time should be presented as an estimate, not an exact guarantee.

---

# 16. Waiting-Time Interaction

The waiting-time engine must account for citizens not arriving.

Example:

```text
A003 estimated to be served next

A003 absent
        ↓
Grace period
        ↓
A003 skipped
        ↓
A004 called
```

When A003 is skipped, waiting-time estimates should update immediately.

The queue engine should react to events such as:

- Service completion
- Service starting
- Long-running service
- Early completion
- Token skip
- Token recall
- Counter becoming unavailable
- Counter becoming available
- Priority handling
- Stage transfer

This keeps the displayed estimate dynamic.

---

# 17. Multiple Counters

Each counter may have its own active service.

Example:

```text
Counter 1 → A010
Counter 2 → A011
Counter 3 → A012
```

A citizen is assigned to the appropriate counter based on the service/stage and queue operation.

When a citizen's token is called:

> **Proceed to Counter 2**

The citizen goes directly to that counter.

There is no additional check-in queue before the counter.

---

# 18. Audit Logging

Every important queue action should be auditable.

For skipped tokens, record:

```text
Token: A003
Status: SKIPPED
Called At: 10:20
Grace Period: 3 minutes
Skipped At: 10:23
Counter: 2
Staff: Staff User ID
Reason: Citizen absent
```

For recall:

```text
Token: A003
Action: RECALL
Time: 10:35
Performed By: Staff User ID
```

This supports operational accountability and helps explain why one citizen was served before another.

---

# 19. Recommended Core Rules

The system should follow these rules:

1. **Token generation reserves queue position.**
2. **Physical arrival does not automatically change queue position.**
3. **Check-in happens at the assigned service counter.**
4. **Staff verifies the token using QR or manual verification.**
5. **A called citizen gets a configurable grace period.**
6. **An absent citizen is skipped instead of blocking the queue.**
7. **Skipped tokens are retained in the system.**
8. **A controlled recall/rejoin option may be provided.**
9. **Recalled citizens do not regain their original position.**
10. **Unlimited recalls should not be allowed.**
11. **Skip and recall actions must be auditable.**
12. **Queue and waiting-time estimates update after skips and recalls.**

---

# 20. Recommended Final Flow

Use this as the primary queue flow:

```text
Citizen
   ↓
Generates Same-Day Token
   ↓
Queue Position Reserved
   ↓
WAITING
   ↓
Queue Progresses
   ↓
Turn Approaching Notification
   ↓
Citizen Proceeds to Assigned Service Counter
   ↓
Token Called
   ↓
Grace Period
   │
   ├── Citizen Arrives
   │       ↓
   │   Staff Scans QR / Verifies Token
   │       ↓
   │   CHECKED_IN
   │       ↓
   │   SERVING
   │       ↓
   │   COMPLETED
   │
   └── Citizen Does Not Arrive
           ↓
        SKIPPED
           ↓
    Optional Recall/Rejoin
           ↓
   Rejoin According to Policy
```

---

# 21. Overall Design Principle

> **Reserve the position early, require physical presence at the assigned service counter, give a short grace period, skip rather than block the queue, and provide a controlled recall opportunity.**

This balances:

### Fairness
Citizens keep the queue position associated with their token generation.

### Efficiency
A missing citizen does not keep a service counter idle or block everyone behind them.

### Practicality
A citizen who misses their turn still has a controlled opportunity to receive service without unfairly moving ahead of citizens who have already waited.

---

# 22. Implementation Guidance

This policy should be implemented in the **queue-management backend**, not only in the frontend.

The backend should be the source of truth for:

- Queue position
- Token status
- Call timing
- Grace-period expiration
- Skip operation
- Recall eligibility
- Rejoin position
- Staff identity
- Audit history

The frontend should display the current state and provide only permitted actions.

The AI model should **not decide whether a citizen is skipped or recalled**.

The deterministic queue-management engine controls this logic.

AI is intended for the separate task of predicting expected service duration. The queue engine combines that prediction with live queue state to calculate dynamic waiting times.

---

# 23. Scope Boundary

For the current project, do not introduce a separate physical check-in kiosk or reception queue.

The intended model is:

> **Citizen gets a token → monitors queue → goes to assigned counter when called → staff verifies token → service begins.**

This keeps the system aligned with the multi-stage government service-flow concept and avoids creating another queue just to enter the queue system.
