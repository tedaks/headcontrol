# HeadControl

[![CI](https://github.com/headcontrol/headcontrol/actions/workflows/ci.yml/badge.svg)](https://github.com/headcontrol/headcontrol/actions/workflows/ci.yml)

Web UI for Headscale — manage users, nodes, API keys, pre-auth keys, and ACL policies.

## Tech Stack

- **Framework:** Next.js 16 (App Router, Turbopack)
- **Language:** TypeScript 5
- **Styling:** Tailwind CSS v4 + shadcn/ui
- **Icons:** Phosphor Icons
- **Testing:** Vitest + React Testing Library + jsdom
- **Linting:** ESLint 9 + Prettier
- **CI:** GitHub Actions (parallel jobs, fail-fast)

## Getting Started

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). You'll be redirected to login — configure your Headscale server URL and API key:

```
HEADSCALE_URL=http://localhost:8080
HEADSCALE_API_KEY=your-api-key
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `HEADSCALE_URL` | Headscale server URL (e.g., `https://headscale.example.com`) |
| `HEADSCALE_API_KEY` | Headscale API key for authentication |
| `HEADSCALE_ALLOW_PRIVATE_URLS` | Set to `true` to allow local/private URLs (development only) |
| `COOKIE_SECURE` | Set to `true` to force `Secure` cookie flag behind reverse proxies |

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run test` | Run unit tests (Vitest) |
| `npm run test:watch` | Run tests in watch mode |
| `npm run format` | Check Prettier formatting |
| `npm run format:write` | Auto-fix Prettier formatting |
| `npm run ci` | Run full CI pipeline locally |
| `npm audit` | Check for security vulnerabilities |

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   ├── headscale/     # Headscale proxy (all HTTP verbs)
│   │   ├── health/        # App health check endpoint
│   │   ├── login/         # Cookie-based auth
│   │   └── logout/        # Clear auth cookies
│   ├── login/             # Login page
│   ├── users/             # Users management
│   ├── nodes/             # Nodes management
│   ├── preauthkeys/       # Pre-auth keys management
│   ├── apikeys/           # API keys management
│   └── policy/            # ACL policy editor
├── components/            # React components
│   ├── layout/            # Layout components (sidebar, header)
│   ├── ui/                # shadcn/ui primitives + ConfirmDialog
│   ├── users/
│   ├── nodes/
│   ├── apikeys/
│   ├── preauthkeys/
│   └── policy/
├── lib/                   # Utilities and API clients
│   ├── auth.ts            # Auth helpers (SSRF protection, cookies)
│   ├── api-client.ts      # Centralized client-side API wrapper
│   ├── headscale-client.ts # Headscale API client
│   ├── server-cache.ts    # unstable_cache wrappers
│   ├── rate-limit.ts      # In-memory rate limiter
│   ├── types.ts           # TypeScript types
│   └── utils.ts           # Shared utilities
├── proxy.ts               # Next.js proxy (auth middleware)
└── test/                  # Test setup
```

## Features

- **Dashboard** — Overview with node/user counts and DB health (SWR auto-refresh)
- **Users** — Create and delete users
- **Nodes** — View, rename, tag, expire, and manage routes
- **Pre-Auth Keys** — Create and expire keys for node registration
- **API Keys** — Manage Headscale API keys
- **Policy** — Edit ACL JSON policy with live validation

## Security

- **SSRF Protection** — `validateHeadscaleUrl()` blocks cloud metadata endpoints and private IP ranges
- **CSRF Mitigation** — Origin verification on state-changing API routes
- **Path Traversal** — URL-encoded `..` sequences blocked in proxy
- **Rate Limiting** — `/api/login` limited to 5 attempts per minute
- **Zod Validation** — Runtime schema validation on all API inputs
- **Secure Cookies** — `httpOnly`, `sameSite: strict`, optional `Secure`
- **Centralized Error Handling** — `api-client.ts` redirects to `/login` on 401

## Adding shadcn/ui Components

```bash
npx shadcn@latest add [component]
```

## CI Pipeline

GitHub Actions runs on every push to `main` and on pull requests (parallelized):

1. **Format & Lint** (5 min timeout)
2. **TypeScript** (5 min timeout)
3. **Unit Tests** (Vitest, 5 min timeout)
4. **Security Audit** (npm audit, 5 min timeout)
5. **Production Build** (depends on all above, 10 min timeout)

Jobs have `concurrency` set to cancel stale runs and `permissions` locked to `contents: read`.

## Testing

```bash
# Unit tests (Vitest + jsdom)
npm run test

# Watch mode
npm run test:watch

# Full CI locally
npm run ci
```

## Architecture Decisions

- **Server Components by default** — pages fetch data server-side with `unstable_cache`
- **Client components** only for interactive forms and tables
- **Data mutations** go through `headscaleApi.*` wrapper (not raw `fetch()`)
- **Error boundaries** have a "Reload page" fallback after one failed reset

## License

[MIT](./LICENSE)
