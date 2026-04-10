# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.

## Artifacts

### halyoon (react-vite, previewPath: /)
A full premium landing page for **Halyoon** — a data-driven social growth engine startup.

**Features:**
- Dark premium theme (deep space-black + electric blue + cyan accent)
- 12 full sections: Navbar, Hero, Problem, What It Does, How It Works, Tfole Kids Use Case, Features, Why Halyoon, Who It's For, Metrics, Final CTA, Footer
- Framer Motion animations with scroll-triggered reveals
- Glassmorphism card design
- Dashboard mockup in hero with animated trend signals
- Fully responsive (mobile + desktop)
- No backend required — pure frontend

**Component structure:**
- `src/pages/Home.tsx` — main page
- `src/components/sections/` — one file per section
