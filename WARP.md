# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.
``

Project overview
- Stack: Next.js App Router, TypeScript, Playwright, Tailwind, Drizzle ORM with Postgres, Auth.js, Vercel services (Blob, Analytics, Functions), Redis.
- Package manager: pnpm (pnpm@9.12.3).
- Primary app code lives in app/, shared logic in lib/.

Core commands
- Install deps: pnpm install
- Start dev server (port 3000 by default): pnpm dev
- Build (runs DB migrate step, then Next build): pnpm build
- Start production build: pnpm start
- Lint: pnpm lint
- Lint + fix: pnpm lint:fix
- Format: pnpm format

Testing (Playwright)
- Run all tests: pnpm test
- Run a single file: pnpm exec playwright test tests/e2e/chat.test.ts
- Filter by project: pnpm exec playwright test --project=e2e
- Run a single test by name: pnpm exec playwright test -g "partial test name"
- Headed/debug: pnpm exec playwright test --headed or PWDEBUG=1 pnpm exec playwright test --project=e2e
Notes:
- Tests auto-start the dev server via webServer in playwright.config.ts (command: pnpm dev, url: http://localhost:${PORT}/ping).

Database workflows (Drizzle)
- Generate SQL from schema changes: pnpm db:generate
- Apply TypeScript migration script locally: pnpm db:migrate
- Check/push/pull: pnpm db:check, pnpm db:push, pnpm db:pull
- Studio (visual): pnpm db:studio
Build also runs tsx lib/db/migrate before next build.

Environment
- Copy .env.example to .env.local and fill required values.
- Common variables (see .env.example and CI): AUTH_SECRET, POSTGRES_URL, BLOB_READ_WRITE_TOKEN, REDIS_URL.
- Tests load .env.local (playwright.config.ts uses dotenv).

High-level architecture
- Routing (Next.js App Router)
  - app/(auth): Auth.js configuration and routes
    - app/(auth)/auth.ts, auth.config.ts
    - API routes under app/(auth)/api/auth/[...nextauth]/route.ts and guest route for unauthenticated flows
  - app/(chat): Chat experience (UI + API)
    - Pages: app/(chat)/chat/[id]/page.tsx, app/(chat)/page.tsx
    - Server Actions: app/(chat)/actions.ts
    - API routes under app/(chat)/api/* (chat, document, files/upload, history, suggestions, vote)
- Domain logic (lib/)
  - lib/ai: Model/provider selection, prompts, tool definitions
    - models.ts (+ models.test.ts), providers.ts, prompts.ts
    - lib/ai/tools/* implement tool calling (e.g., create/update-document, get-weather, request-suggestions)
  - lib/db: Drizzle schema, queries, and migration runner
    - schema.ts, queries.ts, migrate.ts, migrations/* and helpers/*
  - lib/artifacts/server.ts: artifact handling utilities used by chat flows/tests
  - lib/editor/*: rich text editor helpers, diffing, renderer
  - lib/constants.ts, lib/utils.ts, lib/types.ts: shared types and helpers
- Styling
  - Tailwind configured via tailwind.config.ts and postcss.config.mjs; globals in app/globals.css; shadcn/ui components
- Config
  - tsconfig.json: path alias @/* → repo root
  - next.config.ts for Next build/runtime tweaks

End-to-end tests (tests/)
- Structure:
  - tests/e2e/*: user flows
  - tests/routes/*: API route tests
  - tests/pages/* and tests/prompts/*: page objects and test helpers
- Playwright projects: e2e and routes (see playwright.config.ts)

CI notes
- Lint on push: .github/workflows/lint.yml runs pnpm install and pnpm lint on Node 20.
- Playwright on push/PR: .github/workflows/playwright.yml installs deps, caches browsers, and runs pnpm test with required secrets (AUTH_SECRET, POSTGRES_URL, BLOB_READ_WRITE_TOKEN, REDIS_URL).

Scripts for diagnostics (optional, local troubleshooting)
- scripts/ contains node scripts to validate DB and auth flows.
- Run examples:
  - node scripts/test-db-connection.js
  - node scripts/test-auth-flow.js
  - node scripts/debug-auth-error.js

References from README.md
- To run locally: pnpm install && pnpm dev
- Use vercel env pull (optional) to populate .env.local; see README for deployment links and supported model providers.

Conventions
- Use pnpm consistently.
- Use the @/* path alias for imports.
- Keep DB schema changes in lib/db/schema.ts and run pnpm db:generate/db:migrate accordingly.

