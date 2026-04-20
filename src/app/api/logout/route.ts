import { NextRequest, NextResponse } from "next/server";
import { clearAuthCookies } from "@/lib/auth";

/** Check that the request's Origin matches the host (simple CSRF mitigation). */
function verifyOrigin(req: NextRequest): boolean {
  const origin = req.headers.get("origin");
  if (!origin) return true; // Allow non-browser requests (no origin header)
  const host = req.headers.get("host");
  if (!host) return false;
  try {
    const originHost = new URL(origin).host;
    return originHost === host;
  } catch {
    return false;
  }
}

export async function POST(req: NextRequest) {
  if (!verifyOrigin(req)) {
    return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
  }
  await clearAuthCookies();
  return NextResponse.json({ ok: true });
}
