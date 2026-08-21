import type { NextRequest } from "next/server";
import { createHmac } from "crypto";
import { prisma } from "@/lib/prisma";

const SECRET = process.env.SESSION_SECRET || "dev-secret";
const COOKIE = "ym_auth";

function sign(value: string) {
  return createHmac("sha256", SECRET).update(value).digest("base64url");
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const pin = String(body.pin ?? "");

  const setting = await prisma.setting.findUnique({ where: { key: "pin" } });
  const validPin = setting?.value ?? "0000";

  if (pin !== validPin) {
    return Response.json({ error: "invalid_pin" }, { status: 401 });
  }

  const payload = Buffer.from(JSON.stringify({ pin, exp: Math.floor(Date.now() / 1000) + 60 * 60 * 12 })).toString("base64url");
  const token = `${payload}.${sign(payload)}`;

  return Response.json(
    { ok: true },
    {
      headers: {
        "Set-Cookie": `${COOKIE}=${token}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${60 * 60 * 12}`,
      },
    }
  );
}

export async function POST_LOGOUT() {
  return Response.json({ ok: true });
}