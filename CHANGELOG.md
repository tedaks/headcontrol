# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [Unreleased]

### Security

- Removed `.env.local` from git tracking and created `.env.example` template to prevent accidental credential leaks.

### Fixed

- Fixed `AbortController` timeout leak in `headscale-client.ts` by using a `finally` block to always clear timers.
- Fixed build failure when `HEADSCALE_URL` is unset by lazy-initialising the legacy `getHeadscaleClient()` export.
- Fixed stale-closure risk in `useConfirm` hook by storing the `onConfirm` callback in a `useRef`.
- Fixed portal nesting issue by rendering `<ConfirmDialog>` as a sibling instead of inside another `<Dialog>`.

### Changed

- Replaced all native `window.confirm()` calls with a reusable `<ConfirmDialog>` component and `useConfirm()` hook across Users, Nodes, API Keys, and Pre-Auth Keys tables.
- Replaced all error page native `<button>` elements with shadcn `<Button>` component for UI consistency.
- Extracted duplicate `getErrorMessage()` utility into shared `src/lib/utils.ts`.
- Removed unnecessary `useMemo` from `policy-editor.tsx` JSON validation.
- Added 30-second client-side cache to `dashboard-stats.tsx` to reduce redundant API calls.

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
