# Plan: Tune ServiceRoadmap (visual / layout / info density)

## Context
Step 6 (Service Roadmap) just merged. User wants "all three": visual polish, layout/structure, and information density. Documents should be collapsible with count badges. Read-only view (no `currentStageOrder` prop) shows all stages equally.

## Changes to `client/src/components/ServiceRoadmap.jsx`

### Visual / design
- Larger stage-circle (10 -> 12) with ring-2 glow for completed/current
- Connector line stays 2px but uses `rounded-full` for smoother curves
- Card wrapper (bg-gradient + border) around the full stepper for stronger visual grouping
- Subtle left-border color accent (primary-700) for completed, teal-300 for current
- Font: `font-heading` for stage titles (already used); add `font-semibold` to stage-order numbers

### Layout / grouping
- Add header row inside card: service name (EN/NE via prop or context) + stage count badge
- Stage content: 2-column split (left: stage info; right: document list) when space allows (lg:)
- Documents shown as collapsible with small count pill (`3 docs` / `No docs`)
- Expand/collapse uses local `useState` (no server needed)

### Information density
- Per stage: stage order number, name (EN/NE), location (when present), baselineMinutes (when present from DB — but schema has it, so pass through if in stage object)
- Documents: list with icon; count badge; collapsible
- Keep the existing status derivation (completed/current/upcoming) based on `currentStageOrder`; if absent, all stages `remaining` (equal, neutral)

No server changes; no prop changes to `ServiceDetail.jsx` except passing `service.nameEn`/`nameNe` for the header.
