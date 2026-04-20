import { NextRequest, NextResponse } from "next/server";
import { getApiKeyFromCookie } from "@/lib/auth";

const HEADSCALE_URL = (process.env.HEADSCALE_URL || "").replace(/\/$/, "");

async function proxyRequest(req: NextRequest, method: string) {
  const apiKey = await getApiKeyFromCookie();
  if (!apiKey) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const path = req.nextUrl.pathname.replace("/api/headscale/", "/api/v1/");
  const search = req.nextUrl.search;
  const targetUrl = `${HEADSCALE_URL}${path}${search}`;

  const headers: Record<string, string> = {
    Authorization: `Bearer ${apiKey}`,
  };

  let body: string | undefined;
  if (method !== "GET" && method !== "HEAD") {
    body = await req.text();
    if (body) {
      headers["Content-Type"] = "application/json";
    }
  }

  const res = await fetch(targetUrl, { method, headers, body });

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