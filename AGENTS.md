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

## Next.js Conventions

- Server Components by default — add `"use client"` only when needed
- Use `export const dynamic = "force-dynamic"` for pages that need server-side data at request time
- API routes go in `src/app/api/` — the app proxies to Headscale via `/api/headscale/*`
- Auth handled in `proxy.ts` (formerly `middleware.ts`) — redirect to `/login` if no cookie

## Component Patterns

- Table components should handle empty states with a centered "No X found" message
- Dialog components for create/edit forms
- Badge components for status indicators (online/offline, active/expired)
- All data mutations go through the `/api/headscale/*` proxy

## Testing

- Run full CI locally before committing: `npm run lint && npx tsc --noEmit && npm run build`
- Always run `npm audit --audit-level=high` to check for vulnerabilities