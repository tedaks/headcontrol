<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

Key Next.js 16 changes:
- `middleware` → renamed to `proxy` (export `proxy` function instead of `middleware`)
- Use `next/server`'s `proxy` function, not `NextResponse` directly in middleware context
<!-- END:nextjs-agent-rules -->

## Code Style

- 300 line limit on all source code files
- Tailwind + shadcn only — no custom CSS, no inline styles, no third-party CSS
- Use shadcn primitives — `<Button>` over `<button>`, `<Input>` over `<input>`, etc.
- Never use native `confirm()` for destructive actions; use `useConfirm()` from `@/components/ui/confirm-dialog`

## Environment

- Copy `.env.example` to `.env.local` for local development. `.env.local` is gitignored.
- Set `COOKIE_SECURE=true` in production when behind a reverse proxy.
- Set `HEADSCALE_ALLOW_PRIVATE_URLS=true` for local development.

## Next.js Conventions

- Server Components by default — add `"use client"` only when needed
- Use `export const dynamic = "force-dynamic"` for pages that need server-side data at request time
- Use `unstable_cache` for server data that changes infrequently (see `src/lib/server-cache.ts`)
- API routes go in `src/app/api/` — the app proxies to Headscale via `/api/headscale/*`
- Auth handled in `proxy.ts` — redirect to `/login` if no cookie

## Component Patterns

- Table components should handle empty states with a centered "No X found" message
- Dialog components for create/edit forms
- Badge components for status indicators (online/offline, active/expired)
- All data mutations go through `headscaleApi` from `@/lib/api-client` (never raw `fetch`)
- Error boundaries should show a "Reload page" fallback after one failed `reset()`

## Testing

- Run full CI locally before committing: `npm run ci`
- Individual checks:
  - `npm run format` — Prettier format check
  - `npm run lint` — ESLint
  - `npm run test` — Vitest unit tests
  - `npx tsc --noEmit` — TypeScript strict check
  - `npm run build` — Production build
  - `npm audit --audit-level=high` — Security audit
- Unit tests live next to source files: `*.test.ts` / `*.test.tsx`
- Use `@testing-library/react` for component tests
