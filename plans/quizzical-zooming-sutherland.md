# Implementation Plan: Add Motion and Transitions

## Context
The current application UI is functional but static. Adding subtle, high-quality animations will improve the perceived quality, provide better visual feedback, and increase user engagement. The goal is to implement "non-slop" motion: accessible, subtle, high-performance transitions.

## Recommended Approach
We will use **Framer Motion** for React transitions because:
1. It is idiomatic within the React/Vite ecosystem.
2. It natively handles `prefers-reduced-motion` settings.
3. It simplifies layout animations and staggered entrances.

### Key Changes
1. **Install Framer Motion**: `npm install framer-motion` (in `client/`).
2. **Implement Staggered Entrances**: Apply to feature lists in `Home.tsx` and card lists in `Monitor.tsx`.
3. **Add Scroll-Triggered Reveals**: Wrap feature sections in motion wrappers.
4. **Interactive States**: Enhance card hover interactions (e.g., subtle scale on hover).
5. **Loading States**: Replace spinners with skeleton screens during data fetch in `Monitor.tsx`.

## Critical Files to Modify
- `client/src/pages/Home.tsx` (Staggered feature list, scroll reveals)
- `client/src/pages/token/Monitor.tsx` (Skeleton loading, staggered list entrance)
- `client/src/components/ui/` (Add new `Skeleton.tsx` component)

## Implementation Details

### 1. Staggered Entrance Pattern (Framer Motion)
```tsx
import { motion } from "framer-motion";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { staggerChildren: 0.05 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 }
};

// Wrap list items:
<motion.ul variants={containerVariants} initial="hidden" animate="visible">
  {features.map(f => (
    <motion.li variants={itemVariants}>...</motion.li>
  ))}
</motion.ul>
```

### 2. Monitor Loading Strategy
Replace the current spinner in `Monitor.tsx` with a skeleton grid that mirrors the final layout to prevent layout shift (CLS).

## Verification
- **Visual Check**: Open the app, trigger loading states (e.g., refresh queue).
- **Accessibility Check**: Enable `prefers-reduced-motion` in browser OS settings and confirm that animations are disabled/skipped.
- **Performance**: Verify no layout thrashing or stuttering during animations.
