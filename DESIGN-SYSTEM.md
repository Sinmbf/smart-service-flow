# Design System - Smart Service Flow

## Overview

**Project:** Smart Service Flow - Government/Public Service Management System  
**Design Direction:** Accessible & Ethical + Minimalism & Swiss Style  
**Based on:** UI/UX Pro Max Skill (Government/Public Service Product)

---

## Typography

### Font Family: Lexend + Source Sans 3 (Corporate Trust)

**Rationale:** Lexend is designed specifically for readability, making it ideal for government/citizen-facing services where accessibility is paramount. Source Sans 3 provides excellent body text readability.

```css
/* Google Fonts Import */
@import url('https://fonts.googleapis.com/css2?family=Lexend:wght@300;400;500;600;700&family=Source+Sans+3:wght@300;400;500;600;700&display=swap');

/* CSS Variables */
:root {
  --font-heading: 'Lexend', sans-serif;
  --font-body: 'Source Sans 3', sans-serif;
  
  /* Font Sizes - WCAG Accessible (16px+ base) */
  --text-xs: 0.875rem;    /* 14px - minimum for non-essential */
  --text-sm: 1rem;        /* 16px - body minimum */
  --text-base: 1.125rem;  /* 18px - default body */
  --text-lg: 1.25rem;     /* 20px */
  --text-xl: 1.5rem;      /* 24px */
  --text-2xl: 1.875rem;   /* 30px */
  --text-3xl: 2.25rem;    /* 36px */
  --text-4xl: 3rem;       /* 48px */
}
```

---

## Color System

### Primary Palette: Professional Blue (Government Trust)

```css
:root {
  /* Primary Blue - Trust & Authority */
  --color-primary-50: #EFF6FF;
  --color-primary-100: #DBEAFE;
  --color-primary-200: #BFDBFE;
  --color-primary-300: #93C5FD;
  --color-primary-400: #60A5FA;
  --color-primary-500: #3B82F6;
  --color-primary-600: #2563EB;
  --color-primary-700: #1D4ED8;
  --color-primary-800: #1E40AF;
  --color-primary-900: #1E3A8A;
  
  /* Neutral - High Contrast */
  --color-neutral-50: #FAFAFA;
  --color-neutral-100: #F5F5F5;
  --color-neutral-200: #E5E5E5;
  --color-neutral-300: #D4D4D4;
  --color-neutral-400: #A3A3A3;
  --color-neutral-500: #737373;
  --color-neutral-600: #525252;
  --color-neutral-700: #404040;
  --color-neutral-800: #262626;
  --color-neutral-900: #171717;
  
  /* Semantic Colors */
  --color-success: #059669;
  --color-warning: #D97706;
  --color-error: #DC2626;
  --color-info: #0284C7;
  
  /* Background - Light Theme for Accessibility */
  --color-bg-primary: #FFFFFF;
  --color-bg-secondary: #F5F5F5;
  --color-bg-tertiary: #EFF6FF;
  
  /* Text - High Contrast */
  --color-text-primary: #171717;
  --color-text-secondary: #404040;
  --color-text-muted: #737373;
  --color-text-inverse: #FFFFFF;
}
```

---

## Accessibility Requirements (WCAG AAA)

### Contrast Ratios
- **Normal text:** 7:1 minimum (enhanced target)
- **Large text (18px+ or 14px bold):** 4.5:1 minimum
- **UI components & graphics:** 3:1 minimum

### Touch Targets
- **Minimum size:** 44x44px (WCAG requirement)
- **Recommended:** 48x48px for primary actions

### Focus States
- **Focus ring:** 3-4px solid with high contrast
- **Offset:** 2px from element edge
- **Must be visible on all interactive elements**

---

## Component Specifications

### Buttons

```css
.btn {
  /* Base */
  font-family: var(--font-body);
  font-size: var(--text-base); /* 18px minimum */
  font-weight: 600;
  min-height: 48px;
  min-width: 44px;
  padding: 12px 24px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 200ms ease;
  
  /* Focus - WCAG Visible */
  focus-visible: {
    outline: 3px solid var(--color-primary-500);
    outline-offset: 2px;
  }
}

/* Primary Button */
.btn-primary {
  background: var(--color-primary-600);
  color: var(--color-text-inverse);
  border: 2px solid transparent;
}
.btn-primary:hover {
  background: var(--color-primary-700);
}

/* Secondary Button */
.btn-secondary {
  background: transparent;
  color: var(--color-primary-700);
  border: 2px solid var(--color-primary-600);
}
.btn-secondary:hover {
  background: var(--color-primary-50);
}
```

### Form Inputs

```css
.input {
  /* Base */
  font-family: var(--font-body);
  font-size: var(--text-base);
  min-height: 48px;
  padding: 12px 16px;
  border: 2px solid var(--color-neutral-300);
  border-radius: 8px;
  background: var(--color-bg-primary);
  
  /* Focus */
  focus-visible: {
    border-color: var(--color-primary-500);
    outline: 3px solid var(--color-primary-200);
    outline-offset: 2px;
  }
}
```

### Cards

```css
.card {
  background: var(--color-bg-primary);
  border: 1px solid var(--color-neutral-200);
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}
```

---

## Layout System

### Grid
- **Columns:** 12-column grid (Swiss Style)
- **Gutter:** 24px (3 units of 8px base)
- **Max width:** 1280px
- **Breakpoints:**
  - Mobile: < 640px
  - Tablet: 640px - 1024px
  - Desktop: > 1024px

### Spacing Scale (8px Base)
```css
:root {
  --space-1: 0.5rem;   /* 8px */
  --space-2: 1rem;      /* 16px */
  --space-3: 1.5rem;    /* 24px */
  --space-4: 2rem;      /* 32px */
  --space-6: 3rem;      /* 48px */
  --space-8: 4rem;      /* 64px */
  --space-12: 6rem;      /* 96px */
}
```

---

## Motion & Animation

### Principles
- **Duration:** 150-300ms for micro-interactions
- **Easing:** ease-out for entries, ease-in for exits
- **Reduced motion:** Respect `prefers-reduced-motion`

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## Implementation Notes

### Files to Update
1. `client/src/index.css` - Design tokens & global styles
2. `client/src/components/ui/Button.tsx` - Accessible button component
3. `client/src/components/ui/Input.tsx` - Accessible input component
4. `client/src/components/ui/Card.tsx` - Card component
5. `client/src/layouts/AuthLayout.tsx` - Auth pages layout
6. `client/src/layouts/MainLayout.tsx` - Main app layout
7. `client/src/pages/Home.tsx` - Home page
8. `client/src/pages/auth/Login.tsx` - Login page
9. `client/src/pages/auth/Register.tsx` - Register page
10. `client/src/pages/token/*` - Token flow pages

### Design Tokens
All design tokens should be defined as CSS custom properties in `index.css` for easy theming and maintenance.
