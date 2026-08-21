import { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { createHmac } from "crypto";

const SECRET = process.env.SESSION_SECRET || "dev-secret";
const COOKIE = "ym_auth";

function sign(value: string) {
  return createHmac("sha256", SECRET).update(value).digest("base64url");
}

export function verify(token: string): { pin: string; exp: number } | null {
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return null;
  const expected = sign(payload);
  if (sig !== expected) return null;
  const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
  if (Date.now() > data.exp * 1000) return null;
  return data;
}

export function middleware(req: NextRequest) {
  const token = req.cookies.get(COOKIE)?.value;
  const { pathname } = req.nextUrl;
  const isPublic = pathname === "/login" || pathname.startsWith("/api/login") || pathname.startsWith("/api/settings/hospital-name");

  if (isPublic) {
    if (token && verify(token)) {
      return Response.redirect(new URL("/", req.url));
    }
    return NextResponse.next();
  }

  if (!token || !verify(token)) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("next", pathname);
    return Response.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|ico|woff2?)$).*)"],
  runtime: "nodejs",
};