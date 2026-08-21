# Yetena Medhin — Expense & Patient Management System

Hospital management system for tracking Yetena Medhin (healthcare scheme) patient visits, medicine usage and expenses. Fully bilingual (English/Amharic) with the Ethiopian calendar across all logs and reports.

## Features
- Patient registration with year-long family case files
- Medicine inventory with Ethiopian prices (ETB)
- Daily medicine expense logging linked to patients/families
- Advanced search & filtering (patients, dates, medicine, family)
- Deep reports: daily / weekly / monthly / yearly / custom date ranges
- Charts, printable formal reports, and editable Excel (.xlsx) export
- Automatic + manual database backups
- White Neumorphism UI, works fully offline or online

## Tech Stack
- Next.js (App Router, TypeScript) + Prisma ORM
- PostgreSQL (local install or hosted: Neon / Supabase / Railway)
- ExcelJS for .xlsx export, Recharts for charts

## Run Locally (Development)
1. Start PostgreSQL (local or Docker)
2. Copy `.env.example` to `.env` and set `DATABASE_URL`
3. `npm install`
4. `npx prisma migrate dev` then `node prisma/seed.js` (default PIN: `0000`)
5. `npm run dev` → http://localhost:3000

## Deploy Online
### Option A: Vercel + Neon (recommended, free tier)
1. Create a Neon project → copy its connection string into `DATABASE_URL` (Vercel project env vars)
2. Set `SESSION_SECRET` env var (generate: `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"`)
3. Push schema: `npx prisma migrate deploy` (run locally against the remote DB URL)
4. Seed: `node prisma/seed.js` (run locally with remote DATABASE_URL)
5. Deploy: `vercel --prod`
6. Set a cron job (Vercel Cron or GitHub Actions) to call `/api/cron/backup` daily for automatic backups

### Option B: Railway / Render / Fly.io
Same steps; set the same env vars and run migrations against the hosted database.

### Backups
- Manual: Settings → Backup Now (creates a full database dump + downloadable Excel/CSV exports)
- Automatic: scheduled job calling `/api/cron/backup` (or your hosting provider's native DB backup feature)

## Data Safety
- The database provider (Neon/Supabase) provides daily backups natively
- Keep a copy of the backup folder on a USB drive for on-premise redundancy

## Default login
PIN: `0000` (change it in Settings → Security PIN)