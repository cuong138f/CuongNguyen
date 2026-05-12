# English AI Coach

A modern AI-powered English learning platform for Vietnamese learners — with gamification, AI chat, vocabulary flashcards, speaking practice, and progress tracking. Inspired by Duolingo + Notion + Discord aesthetics.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080)
- `pnpm --filter @workspace/english-ai-coach run dev` — run the frontend (port 18391)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string (auto-provisioned)
- Required env: `CLERK_SECRET_KEY`, `CLERK_PUBLISHABLE_KEY`, `VITE_CLERK_PUBLISHABLE_KEY` — Clerk auth (auto-provisioned)

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite + Tailwind CSS v4 + Framer Motion + shadcn/ui
- Backend: Express 5
- Auth: Clerk (via Replit-managed Clerk tenant)
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `lib/api-spec/openapi.yaml` — OpenAPI contract (source of truth)
- `lib/db/src/schema/` — DB tables: users, vocabulary, lessons, chat, speaking, gamification
- `artifacts/api-server/src/routes/` — Express route handlers (users, dashboard, vocabulary, lessons, chat, speaking, gamification, leaderboard)
- `artifacts/english-ai-coach/src/pages/` — React pages
- `artifacts/english-ai-coach/src/components/` — Shared components (Layout, sidebar, etc.)
- `artifacts/english-ai-coach/src/index.css` — Theme (dark midnight blue + electric blue + violet)

## Architecture decisions

- Contract-first OpenAPI: all API types derived from `openapi.yaml` → Orval generates React Query hooks + Zod schemas
- Spaced Repetition (SM-2 algorithm) built into vocabulary review system
- Clerk proxy path (`/api/__clerk`) is only active in production — dev uses Clerk CDN
- Mock AI responses for chat/speaking (no external LLM key required); real AI can be swapped in later
- Dark mode default via `document.documentElement.classList.add("dark")` in ThemeProvider

## Product

English AI Coach offers:
1. **AI Chat** — Practice English conversation with grammar correction and Vietnamese explanations
2. **Vocabulary** — Flashcards + quizzes with SM-2 spaced repetition
3. **Lessons** — Structured lessons (beginner → advanced) with exercises
4. **Speaking** — Record and score pronunciation, compare with native speaker
5. **Dashboard** — Streak, XP level, skill breakdown charts, activity feed
6. **Gamification** — Levels, badges (12 types), daily challenges, weekly leaderboard
7. **Marketing pages** — Landing, Pricing, Blog, About, Contact

## User preferences

- Dark mode default
- Vietnamese learner audience — AI explanations in Vietnamese
- Blue + violet color palette
- Duolingo + Notion + Discord design vibe

## Gotchas

- Always run codegen after editing `lib/api-spec/openapi.yaml`
- Clerk proxy (`proxyUrl`) is undefined in dev — only set in prod builds
- SM-2 algorithm: ease factor stored as integer × 100 (250 = 2.5)
- Lesson exercises stored as JSON in `lessons.exercises` column
- Never use console.log on server — use `req.log` or `logger`

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
- See the `clerk-auth` skill for auth configuration and login provider setup
