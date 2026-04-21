import { NextRequest, NextResponse } from "next/server";
import { getAuthFromCookies, REQUEST_TIMEOUT_MS, MAX_BODY_SIZE } from "@/lib/auth";

const PREFIX = "/api/headscale/";

/** Verify that the request Origin matches the host (simple CSRF mitigation). */
function verifyOrigin(req: NextRequest): boolean {
  const origin = req.headers.get("origin");
  if (!origin) return true; // Allow non-browser clients (no origin header)
  const host = req.headers.get("host");
  if (!host) return false;
  try {
    const originHost = new URL(origin).host;
    return originHost === host;
  } catch {
    return false;
  }
}

async function proxyRequest(req: NextRequest, method: string) {
  // CSRF: reject cross-origin mutation requests
  if (method !== "GET" && method !== "HEAD" && !verifyOrigin(req)) {
    return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
  }

  const auth = await getAuthFromCookies();
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Safely extract the Headscale API path, preventing path-traversal
  const rawPath = req.nextUrl.pathname.slice(PREFIX.length);
  if (!rawPath || rawPath.includes("..") || rawPath.includes("%2e%2e")) {
    return NextResponse.json({ error: "Invalid path" }, { status: 400 });
  }
  const apiPath = `/api/v1/${rawPath}`;
  const search = req.nextUrl.search;
  const targetUrl = `${auth.headscaleUrl}${apiPath}${search}`;

  const headers: Record<string, string> = {
    Authorization: `Bearer ${auth.apiKey}`,
  };

  let body: string | undefined;
  if (method !== "GET" && method !== "HEAD") {
    const rawBody = await req.text();
    if (rawBody && rawBody.length > MAX_BODY_SIZE) {
      return NextResponse.json({ error: "Request body too large" }, { status: 413 });
    }
    body = rawBody || undefined;
    if (body) {
      headers["Content-Type"] = "application/json";
    }
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  let res: Response;
  try {
    res = await fetch(targetUrl, { method, headers, body, signal: controller.signal });
  } catch (err) {
    clearTimeout(timer);
    const message = err instanceof DOMException && err.name === "AbortError"
      ? "Headscale server request timed out"
      : "Failed to reach Headscale server";
    return NextResponse.json({ error: message }, { status: 502 });
  } finally {
    clearTimeout(timer);
  }

  const responseHeaders = new Headers();
  responseHeaders.set("Content-Type", res.headers.get("Content-Type") || "application/json");

  const responseBody = await res.text();
  return new NextResponse(responseBody, {
    status: res.status,
    headers: responseHeaders,
  });
}

export async function GET(req: NextRequest) { return proxyRequest(req, "GET"); }
export async function POST(req: NextRequest) { return proxyRequest(req, "POST"); }
export async function PUT(req: NextRequest) { return proxyRequest(req, "PUT"); }
export async function DELETE(req: NextRequest) { return proxyRequest(req, "DELETE"); }
export async function PATCH(req: NextRequest) { return proxyRequest(req, "PATCH"); }
