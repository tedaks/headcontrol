import { cookies } from "next/headers";

const API_KEY_COOKIE = "headscale_api_key";
const URL_COOKIE = "headscale_url";
const REQUEST_TIMEOUT_MS = 15_000;
const MAX_BODY_SIZE = 1024 * 1024; // 1 MB

/** Cloud metadata & link-local ranges that must never be reached from user-supplied URLs. */
const BLOCKED_HOSTS = [
  "169.254.169.254",       // AWS / GCP / Azure metadata
  "metadata.google.internal",
  "100.100.100.200",       // Alibaba Cloud metadata
];

export { REQUEST_TIMEOUT_MS, MAX_BODY_SIZE };

export async function getApiKeyFromCookie(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(API_KEY_COOKIE)?.value ?? null;
}

export async function getHeadscaleUrlFromCookie(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(URL_COOKIE)?.value ?? null;
}

/** Validate a URL supplied by the user to prevent SSRF attacks. */
export function validateHeadscaleUrl(raw: string): { valid: boolean; error?: string } {
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return { valid: false, error: "Invalid URL format" };
  }

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    return { valid: false, error: "URL must use http: or https: protocol" };
  }

  const hostname = url.hostname.toLowerCase();

  // Block cloud metadata endpoints
  if (BLOCKED_HOSTS.includes(hostname)) {
    return { valid: false, error: "URL resolves to a blocked metadata endpoint" };
  }

  // Block link-local / loopback ranges (optional — comment out if Headscale runs locally)
  if (
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname === "::1" ||
    hostname.startsWith("10.") ||
    hostname.startsWith("172.16.") ||
    hostname.startsWith("192.168.") ||
    hostname.startsWith("169.254.") ||
    hostname.startsWith("fc") ||
    hostname.startsWith("fd")
  ) {
    // Allow if HEADSCALE_ALLOW_PRIVATE_URLS is set (for local dev)
    if (process.env.HEADSCALE_ALLOW_PRIVATE_URLS !== "true") {
      return { valid: false, error: "Private/local URLs are not allowed. Set HEADSCALE_ALLOW_PRIVATE_URLS=true to override." };
    }
  }

  return { valid: true };
}

export async function setAuthCookies(apiKey: string, headscaleUrl: string): Promise<void> {
  const cookieStore = await cookies();
  const opts = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict" as const,
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  };
  cookieStore.set(API_KEY_COOKIE, apiKey, opts);
  cookieStore.set(URL_COOKIE, headscaleUrl.replace(/\/$/, ""), opts);
}

export async function clearAuthCookies(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(API_KEY_COOKIE);
  cookieStore.delete(URL_COOKIE);
}

export async function validateApiKey(apiKey: string, headscaleUrl: string): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    const res = await fetch(`${headscaleUrl.replace(/\/$/, "")}/api/v1/health`, {
      headers: { Authorization: `Bearer ${apiKey}` },
      signal: controller.signal,
    });
    clearTimeout(timer);
    return res.ok;
  } catch {
    return false;
  }
}

/**
 * Read both auth values from cookies. Returns nulls if not authenticated.
 * Used by server components and API routes.
 */
export async function getAuthFromCookies(): Promise<{ apiKey: string; headscaleUrl: string } | null> {
  const [apiKey, headscaleUrl] = await Promise.all([
    getApiKeyFromCookie(),
    getHeadscaleUrlFromCookie(),
  ]);
  if (!apiKey || !headscaleUrl) return null;
  return { apiKey, headscaleUrl };
}
