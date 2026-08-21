import type { NextRequest } from "next/server";

const COOKIE = "ym_auth";

export async function POST(_req: NextRequest) {
  return Response.json(
    { ok: true },
    {
      headers: {
        "Set-Cookie": `${COOKIE}=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0`,
      },
    }
  );
}