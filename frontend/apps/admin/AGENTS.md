# Admin Frontend Standards

This file provides guidance for AI agents working on the `admin/` Next.js application (Halyoon Studio + Parent Dashboard).

## Tech Stack

- Next.js 15+ with App Router
- React 18, TypeScript, Tailwind CSS
- shadcn/ui for components (to be installed)

## Layout & RTL

The app is **Arabic-first with RTL layout** by default. The root `<html>` tag uses `lang="ar" dir="rtl"`.

- Use logical CSS properties (`ps-4` not `pl-4`, `ms-2` not `ml-2`)
- Test both RTL (Arabic) and LTR (English) layouts
- Use Tailwind's `rtl:` and `ltr:` variants when direction-specific styles are needed

## Directory Structure

```
src/
├── app/              # Next.js App Router pages
│   ├── layout.tsx    # Root layout (RTL, global styles)
│   ├── page.tsx      # Dashboard home
│   ├── studio/       # Content workflow & production
│   ├── moderation/   # Review queue
│   ├── content/      # Video management
│   ├── trends/       # Trend signals board
│   ├── analytics/    # Metrics dashboard
│   └── parents/      # Parent controls & reports
├── components/
│   └── ui/           # shadcn/ui components
└── lib/
    └── api.ts        # Backend API client
```

## API Calls

All API calls go through the Next.js rewrite proxy — call `/api/...` paths, never `http://localhost:8080` directly.

```typescript
import { apiFetch } from "@/lib/api";

const videos = await apiFetch<Video[]>("/content/videos");
```

## Component Conventions

- Use shadcn/ui components from `@/components/ui/`
- Prefer `"use client"` only when needed (event handlers, hooks)
- Server Components by default for data fetching pages
- Extract reusable components to `@/components/`

## Import Convention

Use absolute `@/` imports — never relative paths.

```typescript
import { Button } from "@/components/ui/button";
import { apiFetch } from "@/lib/api";
```

## Data Fetching

- **Server Components:** Use `fetch()` directly or `apiFetch` for backend calls
- **Client Components:** Use `useSWR` for data that needs revalidation
- Prefer server-side fetching when possible

## Styling

- Tailwind CSS utility classes only — no inline styles, no CSS modules
- Follow shadcn/ui patterns for component styling
- Use `cn()` utility for conditional class names (from shadcn/ui)

## Testing

E2E tests use Playwright. See the Playwright skill at `/.claude/skills/playwright/SKILL.md` for full guidance.
