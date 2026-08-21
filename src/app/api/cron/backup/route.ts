import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const dbUrl = process.env.DATABASE_URL || "";
  const pgDump = process.env.BACKUP_PG_DUMP || "pg_dump";
  const dir = process.env.BACKUP_DIR || "backups";

  const { mkdir } = await import("fs/promises");
  await mkdir(dir, { recursive: true });

  const url = new URL(dbUrl);
  const host = url.hostname;
  const port = url.port;
  const db = url.pathname.slice(1);
  const user = decodeURIComponent(url.username);
  const pass = decodeURIComponent(url.password || "");

  const date = new Date();
  const stamp = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}_${String(date.getHours()).padStart(2, "0")}-${String(date.getMinutes()).padStart(2, "0")}`;
  const fileName = `yetena_auto_${stamp}.dump`;
  const filePath = `${dir}/yetena_auto_${stamp}.dump`;

  const { execFile } = await import("child_process");
  const { promisify } = await import("util");
  const execFileAsync = promisify(execFile);

  try {
    await execFileAsync(pgDump, ["-h", host, "-p", port, "-U", user, "-Fc", "-f", filePath, db], { env: { ...process.env, PGPASSWORD: pass } });
    const { stat } = await import("fs/promises");
    const st = await stat(filePath);
    await prisma.backupLog.create({ data: { fileName, sizeBytes: BigInt(st.size), kind: "auto" } });
    return Response.json({ ok: true, fileName, sizeBytes: st.size });
  } catch (err) {
    return Response.json({ ok: false, error: String(err) }, { status: 500 });
  }
}