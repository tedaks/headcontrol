# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [Unreleased]

### Security

- Added `COOKIE_SECURE` env variable to override cookie `Secure` flag for reverse-proxy deployments.
- Added in-memory rate limiting to `/api/login` — 5 attempts per minute per IP.
- Added Zod schema validation to `/api/login` endpoint (blocks malformed payloads).
- Added URL-encoded path traversal check (`%2e%2e`) to Headscale proxy.
- Removed `.env.local` from git tracking and created `.env.example` template.

### Added

- New `/api/health` endpoint for container orchestration.
- Centralized `api-client.ts` wrapper for all client-side data mutations with automatic 401 → redirect.
- `server-cache.ts` with `unstable_cache` wrappers (10s TTL) for users, nodes, API keys, pre-auth keys, and policy.
- `useConfirm()` hook and `<ConfirmDialog>` component to replace all native `window.confirm()` calls.
- SWR integration in `dashboard-stats.tsx` for automatic deduplication, caching, and revalidation.
- `display: "swap"` on JetBrains Mono font to prevent FOIT.
- Error page "Reload page" fallback button after one failed reset attempt.
- `vitest.config.ts`, `src/test/setup.ts`, and 9 unit tests (`rate-limit.test.ts`, `utils.test.ts`).
- Prettier configuration (`.prettierrc.json`) with Tailwind plugin.
- New npm scripts: `test`, `test:watch`, `format`, `format:write`, `ci`.

### Fixed

- Fixed `AbortController` timeout leak in `headscale-client.ts` by clearing timer in `finally`.
- Fixed build failure when `HEADSCALE_URL` is unset by lazy-initialising `getHeadscaleClient()`.
- Fixed stale-closure risk in `useConfirm` hook via `useRef` for callback storage.
- Fixed dialog portal nesting by rendering `<ConfirmDialog>` as sibling outside nested `<Dialog>`.

### Changed

- Migrated ALL components from raw `fetch("/api/headscale/*")` to `headscaleApi.*` wrapper.
- Extracted duplicate `getErrorMessage()` into shared `src/lib/utils.ts`.
- Removed unnecessary `useMemo` from `policy-editor.tsx`.
- Replaced error page native `<button>` elements with shadcn `<Button>`.
- Rewrote CI pipeline with parallel jobs, `concurrency`, `permissions`, and `timeout-minutes`.
- Added `unstable_cache` to server data fetching across all admin pages.

## [0.1.0] - 2025-04-20

### Added

- Initial release
- Dashboard with stats (nodes, users, DB health)
- Users management (list, create, delete)
- Nodes management (list, detail, rename, tags, routes)
- Pre-auth keys management (list, create, expire)
- API keys management (list, create, expire, delete)
- Policy/ACL editor with JSON validation
- Authentication with cookie-based sessions
- API proxy to Headscale backend
- GitHub Actions CI pipeline
- ESLint and TypeScript configuration
- Tailwind CSS v4 + shadcn/ui styling
