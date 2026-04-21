# Performance, Optimization & Security Recommendations

## 1. Security 🔒

### 1.1 Cookie Security (HIGH PRIORITY)

**Issue**: In `src/lib/auth.ts`, the `secure` flag is set based on `NODE_ENV`.

```typescript
secure: process.env.NODE_ENV === "production",
```

**Problem for Production**: If this app runs behind a reverse proxy (e.g., nginx, Traefik, Caddy), TLS terminates at the proxy, so the Next.js server sees an HTTP connection (`req.url` starts with `http://`). This causes `secure` to be `false` in production if `NODE_ENV` is not exactly `"production"`, or if you are using a staging/development URL that still uses HTTPS.

**Recommendation**:
1. Add an explicit env variable to override:
   ```typescript
   secure: process.env.COOKIE_SECURE === "true" || process.env.NODE_ENV === "production",
   ```
2. Set `COOKIE_SECURE=true` in your production `.env.local`.
3. Consider adding `__Host-` prefix to cookie names for additional browser security guarantees (browsers enforce `Secure`, `Path=/`, and no `Domain` attribute for `__Host-` prefixed cookies).

**Also**:
- Add `expires` to the cookie options alongside `maxAge` for older browser compatibility, or rely solely on `maxAge` (the code already has this). Ensure `maxAge` is explicitly an integer in seconds (the code uses `60 * 60 * 24 * 7 // 7 days` which is correct).

### 1.2 Rate Limiting (HIGH PRIORITY)

**Issue**: No rate limiting on `/api/login` or `/api/headscale/*`.

**Risk**: Brute-force attacks on login credentials or API keys.

**Recommendation**:
Implement a simple in-memory rate limiter for Login:
```typescript
// src/lib/rate-limit.ts
const attempts = new Map<string, { count: number; resetAt: number }>();

export function rateLimit(key: string, max = 5, windowMs = 60_000) {
  const now = Date.now();
  const record = attempts.get(key);
  if (!record || now > record.resetAt) {
    attempts.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true };
  }
  if (record.count >= max) {
    return { allowed: false, retryAfter: Math.ceil((record.resetAt - now) / 1000) };
  }
  record.count++;
  return { allowed: true };
}
```

For production, use Redis-backed rate limiting (e.g., `@upstash/ratelimit`) if deployed across multiple instances.

### 1.3 API Key Exposure in Client-Side Storage

**Issue**: API keys are stored in cookies (`headscale_api_key`) accessible to JavaScript (`httpOnly: false` is NOT set — actually in the current code `httpOnly: true` is set, which is good).

**Current State (GOOD)**:
- `httpOnly: true` — JavaScript cannot read the cookie.
- `sameSite: "strict"` — prevents CSRF in most modern browsers.

**Potential Issue**: `sameSite: "strict"` can be overly restrictive for some deployment patterns (e.g., if you have a separate auth domain). For same-origin deployment, it is perfect.

**Recommendation**: Keep `sameSite: "strict"` as is, but document that if users deploy the UI on a different origin from Headscale, they need to understand cookie implications.

### 1.4 Input Validation

**Issue**: In `src/app/api/login/route.ts`:
```typescript
const { headscaleUrl, apiKey } = body as Record<string, string>;
```

**Problem**: `apiKey` is asserted as `string` but `body` could be anything. A malicious payload could pass `apiKey` as a number or object, causing downstream issues.

**Recommendation**: Use Zod for runtime validation:
```typescript
import { z } from "zod";

const loginSchema = z.object({
  headscaleUrl: z.string().url(),
  apiKey: z.string().min(1),
});

const parsed = loginSchema.safeParse(body);
if (!parsed.success) {
  return NextResponse.json({ error: "Invalid input" }, { status: 400 });
}
const { headscaleUrl, apiKey } = parsed.data;
```

### 1.5 API Key Visibility (Leakage Prevention)

**Issue**: When creating an API key via `create-apikey-dialog.tsx`, the raw key string is displayed in plaintext in the UI.

**Recommendation**: After displaying the API key **once**, ensure it is never shown again in any component. The current code already does this (shows once, then user clicks "Done"). However, ensure there is no console logging anywhere.

### 1.6 Path Traversal

**Issue**: In `src/app/api/headscale/[...path]/route.ts`:
```typescript
const rawPath = req.nextUrl.pathname.slice(PREFIX.length);
if (!rawPath || rawPath.includes("..")) {
```

**Problem**: While `..` is blocked, other path traversal sequences like `%2e%2e` (URL-encoded dots) might slip through if `req.nextUrl.pathname` is decoded at a different layer.

**Recommendation**: Also check for URL-encoded dots and slashes:
```typescript
if (!rawPath || rawPath.includes("..") || rawPath.includes("%2e%2e") || rawPath.includes("%252e%252e")) {
```
Or, better yet, parse the path with `new URL()` and check segments.

### 1.7 `Content-Type` Strictness on Proxy

**Issue**: In the proxy, `req.text()` is used for body reading, but there is no validation that the incoming `Content-Type` is JSON.

**Recommendation**: For POST/PUT/PATCH, validate the request `Content-Type` is `application/json` before parsing proxying, and set `Content-Type: application/json` on the outgoing request only when appropriate (the current code does this for any non-empty body).

---

## 2. Performance ⚡

### 2.1 Server-Side Data Fetching Caching

**Issue**: All pages (`/users`, `/nodes`, `/apikeys`, `/preauthkeys`, `/policy`) use `export const dynamic = "force-dynamic"`, meaning Next.js re-renders them on every request with **zero caching**.

**Recommendation**:
- For mostly-static data (users, API keys), consider using `unstable_cache` (Next.js 16) or a React `cache()` wrapper around `headscale.users.list()`, `headscale.apiKeys.list()`, etc.
- If data updates infrequently, set `revalidate = 10` (Incremental Static Regeneration) or use `unstable_cache` with a TTL.

Example for `users/page.tsx`:
```typescript
import { unstable_cache } from "next/cache";

const getUsers = unstable_cache(
  async (url: string, key: string) => {
    const client = createHeadscaleClient(url, key);
    return client.users.list();
  },
  ["headscale-users"],
  { revalidate: 10, tags: ["users"] }
);
```

**Caveat**: Ensure you invalidate the cache when mutations happen (e.g., after a user is deleted).

### 2.2 Client-Side Fetching Inefficiencies

**Issue**: `dashboard-stats.tsx` fetches three endpoints (`/health`, `/node`, `/user`) without any client-side deduplication or optimistic updates. The 30-second cache recently added is good, but you also lack:
- Error retry logic
- Request deduplication across components

**Recommendation**: Introduce a lightweight data-fetching library (e.g., SWR or React Query). SWR is particularly small and works great with Next.js:
```typescript
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then(r => r.json());

function DashboardStats() {
  const { data: health } = useSWR("/api/headscale/health", fetcher, { refreshInterval: 30000 });
  const { data: nodes } = useSWR("/api/headscale/node", fetcher, { refreshInterval: 30000 });
  const { data: users } = useSWR("/api/headscale/user", fetcher, { refreshInterval: 30000 });
  // SWR handles deduplication, caching, revalidation automatically
}
```

### 2.3 Bundle Size Optimization

**Issue**: The `layout.tsx` imports `JetBrains_Mono` from Google Fonts via `next/font/google`. While `next/font` is optimized, the entire Latin subset of JetBrains Mono is still ~40-50KB (compressed) even if only used for a few monospace elements.

**Recommendation**:
- Check actual font usage. If it's only for `<code>` blocks and small bits, consider using a system monospace font stack instead (e.g., `font-mono` defaults to `ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas` which are all system fonts).
- If you must keep it, add `display: 'swap'` to the font loader to prevent FOIT (Flash of Invisible Text).

### 2.4 Tree-Shaking & Dead Code

**Issue**: `phosphor-icons/react` is used throughout. Ensure you are only importing the specific icons you need (the current code does this, e.g., `import { Trash } from "@phosphor-icons/react"`).

**Recommendation**: Verify tree-shaking is working by checking the production `.next/static` output or using `@next/bundle-analyzer`. If icons are bloating the bundle, consider dynamic imports for icon-heavy components:
```typescript
import dynamic from "next/dynamic";
const Trash = dynamic(() => import("@phosphor-icons/react").then(m => m.Trash));
```

### 2.5 Loading States & Streaming

**Issue**: Each page has a `loading.tsx` that renders `LoadingSkeleton`. This is good, but the skeleton itself is identical across pages except for the title.

**Recommendation**: This is fine as is, but consider using React Suspense boundaries within components (e.g., in `dashboard-stats.tsx`) to stream UI progressively instead of blocking the entire page.

---

## 3. Architecture & Maintainability 🏗️

### 3.1 Duplicate API Client Patterns

**Issue**: There are two ways to call Headscale:
1. Server-side: `createHeadscaleClient(auth.headscaleUrl, auth.apiKey)`
2. Client-side: Raw `fetch("/api/headscale/...")`

This creates two separate error-handling patterns and URL construction logic.

**Recommendation**: Create a thin client-side wrapper that mirrors the server-side API:
```typescript
// src/lib/api-client.ts
export const api = {
  users: {
    list: () => fetch("/api/headscale/user").then(r => r.json()),
    delete: (id: string) => fetch(`/api/headscale/user/${id}`, { method: "DELETE" }).then(r => r.json()),
    // ... etc
  },
  // ... etc
};
```
This centralizes error handling (e.g., redirecting to `/login` on 401).

### 3.2 Error Page Reset Functionality

**Issue**: Error boundaries (`error.tsx`) call `reset()`, but in Next.js, `reset()` only attempts to re-render the client component boundary. If the error originated in a server component (e.g., `headscale.users.list()` threw), `reset()` alone might not trigger a re-fetch.

**Recommendation**: Add a "Reload page" fallback button that triggers `window.location.reload()` if `reset()` doesn't resolve the issue after one attempt. Track reset attempts with `useState`.

### 3.3 Type Coercion Safety

**Issue**: Several `as` assertions are used (e.g., `body as Record<string, string>`, `data as ApiKey[]`).

**Recommendation**: Gradually replace with Zod schemas or runtime checks. Zod is the industry standard for TypeScript validation.

---

## 4. Deployment & Infrastructure 🚀

### 4.1 Health Check Endpoint

**Issue**: No custom health check endpoint for the Next.js app itself.

**Recommendation**: Add `/api/health` that returns `{ status: "ok", version: process.env.npm_package_version }` so container orchestrators (Docker, K8s) can verify the app is alive.

### 4.2 Docker & Environment Variables

**Issue**: No `Dockerfile` is present in the repo.

**Recommendation**: Add a production-optimized Dockerfile:
```dockerfile
FROM node:22-alpine AS base
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --only=production

FROM base AS builder
WORKDIR /app
COPY . .
COPY --from=deps /app/node_modules ./node_modules
RUN npm run build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
CMD ["node", "server.js"]
```
Enable standalone output in `next.config.ts`:
```typescript
const nextConfig = {
  output: "standalone",
};
```

### 4.3 Log Security

**Issue**: No logging strategy is visible.

**Recommendation**: Never log API keys, cookies, or user credentials. If you add structured logging (e.g., using `pino`), ensure sensitive headers (`authorization`, `cookie`) are redacted.

---

## Summary of High-Priority Actions

| Priority | Action | File |
|----------|--------|------|
| **P0** | Add `COOKIE_SECURE` env variable | `src/lib/auth.ts` |
| **P0** | Add rate limiting to `/api/login` | `src/app/api/login/route.ts` |
| **P1** | Add Zod validation to API routes | `src/app/api/*` |
| **P1** | Implement `api` client-side wrapper | `src/lib/api-client.ts` (new) |
| **P1** | Add `unstable_cache` to server data fetching | `src/app/*/page.tsx` |
| **P2** | Add `/api/health` endpoint | `src/app/api/health/route.ts` (new) |
| **P2** | Add production Dockerfile | `Dockerfile` (new) |
| **P2** | Add URL-encoded path traversal check | `src/app/api/headscale/[...path]/route.ts` |
| **P3** | Consider SWR for client-side fetching | `src/components/dashboard-stats.tsx` |
| **P3** | Add `display: 'swap'` to font loader | `src/app/layout.tsx` |
| **P3** | Add system font fallback for monospace | `tailwind.config.ts` or `globals.css` |

This list is ordered by security impact first, then performance. Start from the top.
