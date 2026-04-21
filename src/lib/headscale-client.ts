import type { User, Node, PreAuthKey, ApiKey } from "./types";
import { REQUEST_TIMEOUT_MS } from "./auth";

class HeadscaleError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "HeadscaleError";
    this.status = status;
  }
}

export { HeadscaleError };

/** Timeout helper – returns init with an abort signal and a clear callback. */
function withTimeout(init: RequestInit | undefined, ms: number): { init: RequestInit; clear: () => void } {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  const merged: RequestInit = {
    ...init,
    signal: init?.signal
      ? mergeSignals(init.signal, controller.signal)
      : controller.signal,
  };
  return { init: merged, clear: () => clearTimeout(timer) };
}

/** Merge two AbortSignals so that either can trigger abort. */
function mergeSignals(a: AbortSignal, b: AbortSignal): AbortSignal {
  const controller = new AbortController();
  if (a.aborted || b.aborted) controller.abort();
  a.addEventListener("abort", () => controller.abort());
  b.addEventListener("abort", () => controller.abort());
  return controller.signal;
}

/**
 * Create an authenticated Headscale API client bound to a specific
 * server URL and API key.
 *
 * Server components should obtain credentials from cookies via
 * `getAuthFromCookies()`.  The legacy default export (reading from
 * env vars) is kept only as a fallback for non-cookie scenarios.
 */
export function createHeadscaleClient(baseUrl: string, apiKey: string) {
  const base = baseUrl.replace(/\/$/, "");

  async function request<T>(path: string, init?: RequestInit): Promise<T> {
    const url = `${base}${path}`;
    const { init: timedInit, clear } = withTimeout(init, REQUEST_TIMEOUT_MS);
    try {
      const res = await fetch(url, {
        ...timedInit,
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          ...init?.headers,
        },
      });
      if (!res.ok) {
        const body = await res.text().catch(() => res.statusText);
        throw new HeadscaleError(body || res.statusText, res.status);
      }
      // Handle empty bodies (e.g. DELETE 200 OK with no content)
      const text = await res.text();
      if (!text) return undefined as unknown as T;
      return JSON.parse(text) as T;
    } finally {
      clear();
    }
  }

  return {
    health: {
      check: () =>
        request<{ databaseConnectivity: boolean }>("/api/v1/health"),
    },

    users: {
      list: (params?: { id?: string; name?: string; email?: string }) => {
        const search = new URLSearchParams();
        if (params?.id) search.set("id", params.id);
        if (params?.name) search.set("name", params.name);
        if (params?.email) search.set("email", params.email);
        const qs = search.toString();
        return request<{ users: User[] }>(`/api/v1/user${qs ? `?${qs}` : ""}`);
      },
      create: (body: { name: string; displayName?: string; email?: string; pictureUrl?: string }) =>
        request<{ user: User }>("/api/v1/user", {
          method: "POST",
          body: JSON.stringify(body),
        }),
      delete: (id: string) =>
        request<void>(`/api/v1/user/${encodeURIComponent(id)}`, { method: "DELETE" }),
      rename: (oldId: string, newName: string) =>
        request<{ user: User }>(`/api/v1/user/${encodeURIComponent(oldId)}/rename/${encodeURIComponent(newName)}`, { method: "POST" }),
    },

    nodes: {
      list: (user?: string) => {
        const qs = user ? `?user=${encodeURIComponent(user)}` : "";
        return request<{ nodes: Node[] }>(`/api/v1/node${qs}`);
      },
      get: (nodeId: string) =>
        request<{ node: Node }>(`/api/v1/node/${encodeURIComponent(nodeId)}`),
      delete: (nodeId: string) =>
        request<void>(`/api/v1/node/${encodeURIComponent(nodeId)}`, { method: "DELETE" }),
      expire: (nodeId: string, expiry?: string, disableExpiry?: boolean) => {
        const params = new URLSearchParams();
        if (expiry) params.set("expiry", expiry);
        if (disableExpiry) params.set("disableExpiry", "true");
        const qs = params.toString();
        return request<{ node: Node }>(`/api/v1/node/${encodeURIComponent(nodeId)}/expire${qs ? `?${qs}` : ""}`, { method: "POST" });
      },
      rename: (nodeId: string, newName: string) =>
        request<{ node: Node }>(`/api/v1/node/${encodeURIComponent(nodeId)}/rename/${encodeURIComponent(newName)}`, { method: "POST" }),
      setTags: (nodeId: string, tags: string[]) =>
        request<{ node: Node }>(`/api/v1/node/${encodeURIComponent(nodeId)}/tags`, {
          method: "POST",
          body: JSON.stringify({ tags }),
        }),
      setApprovedRoutes: (nodeId: string, routes: string[]) =>
        request<{ node: Node }>(`/api/v1/node/${encodeURIComponent(nodeId)}/approve_routes`, {
          method: "POST",
          body: JSON.stringify({ routes }),
        }),
    },

    preAuthKeys: {
      list: () =>
        request<{ preAuthKeys: PreAuthKey[] }>("/api/v1/preauthkey"),
      create: (body: { user: string; reusable?: boolean; ephemeral?: boolean; expiration?: string; aclTags?: string[] }) =>
        request<{ preAuthKey: PreAuthKey }>("/api/v1/preauthkey", {
          method: "POST",
          body: JSON.stringify(body),
        }),
      expire: (id: string) =>
        request<void>("/api/v1/preauthkey/expire", {
          method: "POST",
          body: JSON.stringify({ id }),
        }),
      delete: (id: string) =>
        request<void>(`/api/v1/preauthkey?id=${encodeURIComponent(id)}`, { method: "DELETE" }),
    },

    apiKeys: {
      list: () =>
        request<{ apiKeys: ApiKey[] }>("/api/v1/apikey"),
      create: (expiration?: string) =>
        request<{ apiKey: string }>("/api/v1/apikey", {
          method: "POST",
          body: JSON.stringify({ expiration }),
        }),
      expire: (prefix: string, id?: string) => {
        const body: Record<string, string> = { prefix };
        if (id) body.id = id;
        return request<void>("/api/v1/apikey/expire", {
          method: "POST",
          body: JSON.stringify(body),
        });
      },
      delete: (prefix: string, id?: string) =>
        request<void>(`/api/v1/apikey/${encodeURIComponent(prefix)}${id ? `?id=${encodeURIComponent(id)}` : ""}`, { method: "DELETE" }),
    },

    policy: {
      get: () =>
        request<{ policy: string; updatedAt: string }>("/api/v1/policy"),
      set: (policy: string) =>
        request<{ policy: string; updatedAt: string }>("/api/v1/policy", {
          method: "PUT",
          body: JSON.stringify({ policy }),
        }),
    },

    auth: {
      register: (user: string, authId: string) =>
        request<{ node: Node }>("/api/v1/auth/register", {
          method: "POST",
          body: JSON.stringify({ user, authId }),
        }),
      approve: (authId: string) =>
        request<void>("/api/v1/auth/approve", {
          method: "POST",
          body: JSON.stringify({ authId }),
        }),
      reject: (authId: string) =>
        request<void>("/api/v1/auth/reject", {
          method: "POST",
          body: JSON.stringify({ authId }),
        }),
    },
  };
}

/**
 * Legacy default export for convenience — reads from env vars.
 * Prefer `createHeadscaleClient()` with cookie-based credentials.
 * Lazy-initialised so the build does not fail if env vars are absent.
 */
let _headscaleClient: ReturnType<typeof createHeadscaleClient> | null = null;

export function getHeadscaleClient() {
  if (!_headscaleClient) {
    function getBaseUrl(): string {
      const url = process.env.HEADSCALE_URL;
      if (!url) throw new HeadscaleError("HEADSCALE_URL is not configured", 500);
      return url.replace(/\/$/, "");
    }
    function getApiKey(): string {
      const key = process.env.HEADSCALE_API_KEY;
      if (!key) throw new HeadscaleError("HEADSCALE_API_KEY is not configured", 500);
      return key;
    }
    _headscaleClient = createHeadscaleClient(getBaseUrl(), getApiKey());
  }
  return _headscaleClient;
}
