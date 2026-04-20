import { NextRequest, NextResponse } from "next/server";
import { setApiKeyCookie, validateApiKey } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const { headscaleUrl, apiKey } = await req.json();

  if (!headscaleUrl || !apiKey) {
    return NextResponse.json({ error: "Server URL and API key are required" }, { status: 400 });
  }

  const valid = await validateApiKey(apiKey, headscaleUrl);
  if (!valid) {
    return NextResponse.json({ error: "Invalid API key or unreachable server" }, { status: 401 });
  }

  await setApiKeyCookie(apiKey);
  return NextResponse.json({ ok: true });
}