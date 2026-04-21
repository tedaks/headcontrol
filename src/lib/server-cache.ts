import { unstable_cache } from "next/cache";
import { createHeadscaleClient } from "@/lib/headscale-client";

/** Cached user list — revalidated every 10s. */
export const getCachedUsers = unstable_cache(
  async (url: string, key: string) => {
    const client = createHeadscaleClient(url, key);
    return client.users.list();
  },
  ["headscale-users"],
  { revalidate: 10, tags: ["users"] }
);

/** Cached node list — revalidated every 10s. */
export const getCachedNodes = unstable_cache(
  async (url: string, key: string) => {
    const client = createHeadscaleClient(url, key);
    return client.nodes.list();
  },
  ["headscale-nodes"],
  { revalidate: 10, tags: ["nodes"] }
);

/** Cached API key list — revalidated every 10s. */
export const getCachedApiKeys = unstable_cache(
  async (url: string, key: string) => {
    const client = createHeadscaleClient(url, key);
    return client.apiKeys.list();
  },
  ["headscale-apikeys"],
  { revalidate: 10, tags: ["apikeys"] }
);

/** Cached pre-auth key list — revalidated every 10s. */
export const getCachedPreAuthKeys = unstable_cache(
  async (url: string, key: string) => {
    const client = createHeadscaleClient(url, key);
    return client.preAuthKeys.list();
  },
  ["headscale-preauthkeys"],
  { revalidate: 10, tags: ["preauthkeys"] }
);

/** Cached policy — revalidated every 10s. */
export const getCachedPolicy = unstable_cache(
  async (url: string, key: string) => {
    const client = createHeadscaleClient(url, key);
    return client.policy.get();
  },
  ["headscale-policy"],
  { revalidate: 10, tags: ["policy"] }
);
