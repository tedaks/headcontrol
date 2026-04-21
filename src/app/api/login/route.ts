import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { setAuthCookies, validateApiKey, validateHeadscaleUrl } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";

const loginSchema = z.object({
  headscaleUrl: z.string().url(),
  apiKey: z.string().min(1),
});

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });
  }

  const { headscaleUrl, apiKey } = parsed.data;

  const forwarded = req.headers.get("x-forwarded-for");
  const ip = forwarded?.split(",")[0]?.trim() ?? req.headers.get("x-real-ip") ?? "unknown";
  const limit = rateLimit(`login:${ip}`, 5, 60_000);
  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Too many login attempts", retryAfter: limit.retryAfter },
      { status: 429 }
    );
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
