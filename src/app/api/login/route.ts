import { NextRequest, NextResponse } from "next/server";
import { setAuthCookies, validateApiKey, validateHeadscaleUrl } from "@/lib/auth";

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { headscaleUrl, apiKey } = body as Record<string, string>;

  if (!headscaleUrl || !apiKey) {
    return NextResponse.json({ error: "Server URL and API key are required" }, { status: 400 });
  }

  // Prevent SSRF: validate the user-supplied URL before making any request to it
  const urlCheck = validateHeadscaleUrl(headscaleUrl);
  if (!urlCheck.valid) {
    return NextResponse.json({ error: urlCheck.error }, { status: 400 });
  }

  const normalizedUrl = headscaleUrl.replace(/\/$/, "");
  const valid = await validateApiKey(apiKey, normalizedUrl);
  if (!valid) {
    return NextResponse.json({ error: "Invalid API key or unreachable server" }, { status: 401 });
  }

  await setAuthCookies(apiKey, normalizedUrl);
  return NextResponse.json({ ok: true });
}
