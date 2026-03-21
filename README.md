# SheetAI — Full SaaS Spreadsheet Generator

> AI-powered spreadsheet generator with auth, dashboard, payments, and exports.

## Pages
| Route | Description |
|-------|-------------|
| `/` | Landing page + AI generator |
| `/login` | Sign in |
| `/signup` | Register (free account) |
| `/dashboard` | Saved sheets + account stats |
| `/pricing` | Plans + Razorpay payment |

## Quick Start (5 minutes)

### 1. Install
```bash
npm install
```

### 2. Setup environment
```bash
cp .env.local.example .env.local
```
Edit `.env.local`:
- `ANTHROPIC_API_KEY` → get free at https://console.anthropic.com/settings/api-keys
- `NEXTAUTH_SECRET` → run `openssl rand -base64 32` and paste result
- `NEXTAUTH_URL` → keep as `http://localhost:3000` for local dev

### 3. Setup database
```bash
npx prisma generate
npx prisma db push
```
This creates a local SQLite database (no external DB needed for dev!)

### 4. Run
```bash
npm run dev
```
Open http://localhost:3000 ✅

---

## Tech Stack
| Layer | Tech |
|-------|------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Auth | NextAuth.js (credentials) |
| Database | Prisma + SQLite (dev) / PostgreSQL (prod) |
| AI | Claude Haiku via Anthropic SDK |
| Payments | Razorpay |
| Exports | xlsx library |

---

## Deploy to Vercel

```bash
# 1. Push to GitHub
git init && git add . && git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/sheetai
git push -u origin main

# 2. Deploy
npx vercel

# 3. Set environment variables in Vercel dashboard:
# ANTHROPIC_API_KEY, NEXTAUTH_SECRET, NEXTAUTH_URL (your vercel URL), DATABASE_URL
```

### Production Database
For production, use a free PostgreSQL database:
- **Neon** (free): https://neon.tech — best for Vercel
- Change `DATABASE_URL` in .env to your PostgreSQL connection string
- Change `provider = "sqlite"` to `provider = "postgresql"` in `prisma/schema.prisma`
- Run `npx prisma db push`

### Payments (Razorpay)
1. Create account at https://dashboard.razorpay.com
2. Go to Settings → API Keys → Generate Test Key
3. Add `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `NEXT_PUBLIC_RAZORPAY_KEY_ID` to env

---

## Free Plan Limits
- 5 sheets/month
- CSV export only
- All templates included

## Upgrading Logic
- User hits limit → shown upgrade banner → redirected to `/pricing`
- On payment → Razorpay webhook verifies → user plan updated in DB
- Pro/Team users get unlimited sheets + XLSX + PDF export

---

Built with ❤️ for India 🇮🇳
