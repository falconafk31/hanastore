# HanaStore — Platform Sewa Alat Berat

Platform scalable untuk penyewaan heavy equipment dengan 3 aplikasi: **Backend API (NestJS)**, **Frontend Customer (Next.js)**, **Frontend Admin (Vite React)**.

## Arsitektur

```
hanastore/
├── backend/           # NestJS + Prisma + PostgreSQL + Redis + BullMQ + R2
├── frontend-web/      # Next.js 14 App Router + Tailwind + Zustand
├── frontend-admin/    # React Vite + Tailwind + Zustand
├── shared/            # Shared types/constants
├── .env.example
├── README.md
├── ROADMAP.md
├── CHANGELOG.md
└── AUDIT.md
```

## Stack

- **Backend:** Node.js 22 + NestJS 11 + TypeScript strict, Prisma 5, PostgreSQL, Redis + BullMQ, Cloudflare R2 (@aws-sdk/client-s3), JWT (access+refresh httpOnly cookie), RBAC, Throttler
- **Frontend Customer:** Next.js 14 App Router, Tailwind, Zustand, fetch API
- **Frontend Admin:** Vite 5 + React 18 + Tailwind + Zustand + React Router
- **Storage:** Cloudflare R2 (S3-compatible)
- **Payment:** Midtrans Sandbox (mock + webhook)

## Prasyarat

- Node.js >= 20
- PostgreSQL 14+
- Redis 7+ (opsional untuk dev, BullMQ lazyConnect)
- Akun Cloudflare R2 (opsional, mock mode jika tidak dikonfigurasi)
- Akun Midtrans Sandbox (opsional)

## Setup Environment

1. Clone & install:
```bash
git clone <repo>
cd hanastore
cp .env.example .env
cp backend/.env.example backend/.env
cp frontend-web/.env.example frontend-web/.env.local
cp frontend-admin/.env.example frontend-admin/.env
# Edit .env files isi placeholder kamu
```

2. Isi variabel penting di `backend/.env`:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/hanastore?schema=public"
REDIS_HOST=localhost
REDIS_PORT=6379
JWT_ACCESS_SECRET=change-this-access-secret-at-least-32-chars
JWT_REFRESH_SECRET=change-this-refresh-secret-at-least-32-chars
R2_ACCOUNT_ID=xxx
R2_ACCESS_KEY_ID=xxx
R2_SECRET_ACCESS_KEY=xxx
R2_BUCKET=hanastore-bucket
R2_ENDPOINT=https://<account>.r2.cloudflarestorage.com
MIDTRANS_SERVER_KEY=SB-Mid-server-xxxx
```

3. Setup Database:
```bash
cd backend
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run seed   # atau npx ts-node prisma/seed.ts
```

Seed membuat:
- 3 kategori: Excavator, Bulldozer, Crane
- 10 alat
- 2 user: admin@hanastore.local / customer@hanastore.local (password: password123)

4. Jalankan aplikasi:

**Backend:**
```bash
cd backend
npm run start:dev   # http://localhost:3000/api
```

**Frontend Customer:**
```bash
cd frontend-web
npm install
npm run dev         # http://localhost:3001
# env: NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

**Frontend Admin:**
```bash
cd frontend-admin
npm install
npm run dev         # http://localhost:5173
# env: VITE_API_URL=http://localhost:3000/api
```

## API Ringkas

| Method | Endpoint | Auth | Deskripsi |
|--------|----------|------|-----------|
| POST | /api/auth/register | public | Register |
| POST | /api/auth/login | public | Login (set httpOnly cookie) |
| POST | /api/auth/refresh | public | Refresh token |
| GET | /api/equipment | public | List alat + filter, pagination, search |
| GET | /api/equipment/:id | public | Detail alat |
| GET | /api/equipment/:id/availability | public | Cek konflik jadwal |
| POST | /api/equipment | admin/operator | Tambah alat |
| POST | /api/bookings | customer | Create booking (cek overlap) |
| GET | /api/bookings/my | customer | Booking milik user |
| GET | /api/bookings | admin | List semua booking |
| PATCH | /api/bookings/:id/status | admin | Approve/reject |
| GET | /api/pricing/calculate | public | Hitung biaya |
| POST | /api/payments | customer | Buat payment (Midtrans mock) |
| POST | /api/payments/webhook | public | Webhook Midtrans |
| POST | /api/contracts/generate/:bookingId | admin | Generate kontrak → R2 |
| PATCH | /api/contracts/:id/sign | admin/customer | Tandai signed |
| CRUD | /api/maintenance | admin | Log perawatan |
| POST | /api/storage/upload | admin | Upload ke R2 |
| GET | /api/users/me | auth | Profil |

Semua response seragam:
```json
{ "success": true, "statusCode": 200, "message": "Success", "data": { ... } }
```
Error konsisten via HttpExceptionFilter.

## Validasi & Keamanan

- DTO menggunakan `class-validator` (whitelist, forbidNonWhitelisted)
- Password di-hash bcrypt (10 rounds)
- JWT access 15m, refresh 7d, refresh disimpan httpOnly cookie
- RBAC via @Roles guard
- Throttler di login/register/webhook (10 req/menit)
- CORS spesifik (bukan wildcard) + preview .e2b.app allowed untuk dev
- Upload validasi mime & size 5MB, block executable
- No hardcode secret, semua via env

## Testing

```bash
cd backend
npm test              # unit test (auth, booking, payment, etc)
npm run test:e2e      # (jika ada)
```

Alur E2E tercakup di `backend/test/booking.e2e-spec.ts` (create booking → payment → contract).

## Asumsi

- Payment gateway default: **Midtrans Sandbox** (mock token jika key tidak diisi, webhook tetap memproses status)
- Email via **nodemailer** SMTP; jika tidak dikonfig, di-mock dan log ke console (siap integrasi)
- WhatsApp API placeholder (interface `sendWhatsApp` siap sambung ke provider seperti Fonnte/Wablas)
- Redis BullMQ dikonfigurasi lazyConnect sehingga backend tetap jalan tanpa Redis di local dev (queue akan connect saat Redis tersedia)

## Audit

Lihat `AUDIT.md` untuk laporan audit keamanan/kode/database/performa/fungsional per fase.

## Lisensi

Internal / Private
