import { cookies } from "next/headers";

const COOKIE_NAME = "headscale_api_key";

export async function getApiKeyFromCookie(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(COOKIE_NAME)?.value ?? null;
}

export async function setApiKeyCookie(apiKey: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, apiKey, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function clearApiKeyCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function validateApiKey(apiKey: string, headscaleUrl: string): Promise<boolean> {
  try {
    const res = await fetch(`${headscaleUrl.replace(/\/$/, "")}/api/v1/health`, {
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    return res.ok;
  } catch {
    return false;
  }
}