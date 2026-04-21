import { getErrorMessage } from "@/lib/utils";

/** Simple wrapper around the /api/headscale/* proxy with shared error handling. */
async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`/api/headscale${path}`, init);
  if (res.status === 401) {
    // Redirect to login if session expired
    window.location.href = "/login";
    throw new Error("Unauthorized");
  }
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(getErrorMessage(data, `Request failed: ${res.statusText}`));
  }
  const text = await res.text();
  if (!text) return undefined as unknown as T;
  return JSON.parse(text) as T;
}

export const headscaleApi = {
  health: {
    check: () => api<{ databaseConnectivity: boolean }>("/health"),
  },
  users: {
    list: () => api<{ users: import("@/lib/types").User[] }>("/user"),
    create: (body: { name: string; displayName?: string; email?: string }) =>
      api<{ user: import("@/lib/types").User }>("/user", { method: "POST", body: JSON.stringify(body) }),
    delete: (id: string) => api<void>(`/user/${encodeURIComponent(id)}`, { method: "DELETE" }),
  },
  nodes: {
    list: () => api<{ nodes: import("@/lib/types").Node[] }>("/node"),
    delete: (id: string) => api<void>(`/node/${encodeURIComponent(id)}`, { method: "DELETE" }),
    expire: (id: string) =>
      api<{ node: import("@/lib/types").Node }>(`/node/${encodeURIComponent(id)}/expire?disableExpiry=false`, { method: "POST" }),
    rename: (id: string, name: string) =>
      api<{ node: import("@/lib/types").Node }>(`/node/${encodeURIComponent(id)}/rename/${encodeURIComponent(name)}`, { method: "POST" }),
    setTags: (id: string, tags: string[]) =>
      api<{ node: import("@/lib/types").Node }>(`/node/${encodeURIComponent(id)}/tags`, { method: "POST", body: JSON.stringify({ tags }) }),
    setApprovedRoutes: (id: string, routes: string[]) =>
      api<{ node: import("@/lib/types").Node }>(`/node/${encodeURIComponent(id)}/approve_routes`, { method: "POST", body: JSON.stringify({ routes }) }),
  },
  apiKeys: {
    list: () => api<{ apiKeys: import("@/lib/types").ApiKey[] }>("/apikey"),
    create: (expiration?: string) =>
      api<{ apiKey: string }>("/apikey", { method: "POST", body: JSON.stringify({ expiration }) }),
    expire: (prefix: string) => api<void>("/apikey/expire", { method: "POST", body: JSON.stringify({ prefix }) }),
    delete: (prefix: string, id: string) =>
      api<void>(`/apikey/${encodeURIComponent(prefix)}?id=${encodeURIComponent(id)}`, { method: "DELETE" }),
  },
  preAuthKeys: {
    list: () => api<{ preAuthKeys: import("@/lib/types").PreAuthKey[] }>("/preauthkey"),
    create: (body: Record<string, unknown>) =>
      api<{ preAuthKey: import("@/lib/types").PreAuthKey }>("/preauthkey", { method: "POST", body: JSON.stringify(body) }),
    expire: (id: string) => api<void>("/preauthkey/expire", { method: "POST", body: JSON.stringify({ id }) }),
  },
  policy: {
    get: () => api<{ policy: string; updatedAt: string }>("/policy"),
    set: (policy: string) =>
      api<{ policy: string; updatedAt: string }>("/policy", { method: "PUT", body: JSON.stringify({ policy }) }),
  },
};
