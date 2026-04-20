import type { User, Node, PreAuthKey, ApiKey } from "./types";

class HeadscaleError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "HeadscaleError";
    this.status = status;
  }
}

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

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const url = `${getBaseUrl()}${path}`;
  const res = await fetch(url, {
    ...init,
    headers: {
      "Authorization": `Bearer ${getApiKey()}`,
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });
  if (!res.ok) {
    const body = await res.text();
    throw new HeadscaleError(body || res.statusText, res.status);
  }
  return res.json();
}

export const headscale = {
  health: {
    check: () => request<{ databaseConnectivity: boolean }>("/api/v1/health"),
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
      request<void>(`/api/v1/user/${id}`, { method: "DELETE" }),
    rename: (oldId: string, newName: string) =>
      request<{ user: User }>(`/api/v1/user/${oldId}/rename/${newName}`, { method: "POST" }),
  },

  nodes: {
    list: (user?: string) => {
      const qs = user ? `?user=${user}` : "";
      return request<{ nodes: Node[] }>(`/api/v1/node${qs}`);
    },
    get: (nodeId: string) =>
      request<{ node: Node }>(`/api/v1/node/${nodeId}`),
    delete: (nodeId: string) =>
      request<void>(`/api/v1/node/${nodeId}`, { method: "DELETE" }),
    expire: (nodeId: string, expiry?: string, disableExpiry?: boolean) => {
      const params = new URLSearchParams();
      if (expiry) params.set("expiry", expiry);
      if (disableExpiry) params.set("disableExpiry", "true");
      const qs = params.toString();
      return request<{ node: Node }>(`/api/v1/node/${nodeId}/expire${qs ? `?${qs}` : ""}`, { method: "POST" });
    },
    rename: (nodeId: string, newName: string) =>
      request<{ node: Node }>(`/api/v1/node/${nodeId}/rename/${newName}`, { method: "POST" }),
    setTags: (nodeId: string, tags: string[]) =>
      request<{ node: Node }>(`/api/v1/node/${nodeId}/tags`, {
        method: "POST",
        body: JSON.stringify({ tags }),
      }),
    setApprovedRoutes: (nodeId: string, routes: string[]) =>
      request<{ node: Node }>(`/api/v1/node/${nodeId}/approve_routes`, {
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
      request<void>(`/api/v1/preauthkey?id=${id}`, { method: "DELETE" }),
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
      request<void>(`/api/v1/apikey/${prefix}${id ? `?id=${id}` : ""}`, { method: "DELETE" }),
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

export { HeadscaleError };
