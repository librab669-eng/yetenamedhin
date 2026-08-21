// Auto backup script - run via Windows Task Scheduler.
// Usage: node scripts/backup.js
const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");

require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

const { Client } = require("pg");

async function main() {
  const dbUrl = process.env.DATABASE_URL;
  const pgDump = process.env.BACKUP_PG_DUMP || "C:\\Program Files\\PostgreSQL\\18\\bin\\pg_dump.exe";
  const dir = process.env.BACKUP_DIR || "C:\\YetenaBackups";

  const url = new URL(dbUrl);
  const host = url.hostname;
  const port = url.port;
  const db = url.pathname.slice(1);
  const user = decodeURIComponent(url.username);
  const pass = decodeURIComponent(url.password || "");

  await fs.promises.mkdir(dir, { recursive: true });

  const date = new Date();
  const stamp = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}_${String(date.getHours()).padStart(2, "0")}-${String(date.getMinutes()).padStart(2, "0")}`;
  const fileName = `yetena_auto_${stamp}.dump`;
  const filePath = path.join(dir, fileName);

  await new Promise((resolve, reject) => {
    exec(`"${pgDump}" -h ${host} -p ${port} -U ${user} -Fc -f "${filePath}" ${db}`, { env: { ...process.env, PGPASSWORD: pass } }, (err, stdout, stderr) => {
      if (err) {
        console.error("Backup failed:", stderr);
        reject(err);
        return;
      }
      resolve(stdout);
    });
  });

  const stat = await fs.promises.stat(filePath);

  const client = new Client({ connectionString: dbUrl });
  await client.connect();
  await client.query(
    'INSERT INTO "BackupLog" ("fileName", "sizeBytes", "kind", "createdAt") VALUES ($1, $2, $3, NOW())',
    [fileName, BigInt(stat.size).toString(), "auto"]
  );
  await client.end();

  console.log("Backup created:", filePath);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});