# Changelog

Semua perubahan penting dicatat di sini. Format mengikuti [Keep a Changelog](https://keepachangelog.com/).

## [Unreleased]

### Added
- N/A

## [0.3.0] - 2026-09-13

### Added
- Frontend admin: dashboard ringkasan, manajemen alat (CRUD + upload R2), manajemen booking approve/reject + kontrak, maintenance, laporan filter tanggal & export CSV
- Integrasi frontend → backend via env (NEXT_PUBLIC_API_URL, VITE_API_URL) tanpa hardcode

### Fixed
- Equipment controller route order (availability sebelum :id)

## [0.2.0] - 2026-09-13

### Added
- Modul pricing (hitung biaya + diskon 5%/10%)
- Modul payment (Midtrans sandbox mock, webhook handler, confirm manual)
- Modul contract (generate dokumen ke R2, signed)
- Modul maintenance (CRUD log perawatan)
- Modul storage (upload/delete/signed URL R2 dengan validasi mime & size)
- Modul notification (nodemailer email + WhatsApp placeholder)
- Frontend customer: catalog filter & search, detail alat dengan kalender availability, alur booking checkout, dashboard customer, auth httpOnly cookie

## [0.1.0] - 2026-09-13

### Added
- Inisialisasi monorepo (backend, frontend-web, frontend-admin, shared)
- Backend NestJS dengan modul kosong & struktur common (filters, guards, decorators, interceptors)
- Koneksi PostgreSQL via Prisma, schema 7 tabel (users, categories, equipment, bookings, payments, contracts, maintenance_logs) dengan index komposit
- Seed data dummy (3 kategori, 10 alat, 2 user)
- Redis + BullMQ base config (lazyConnect)
- Cloudflare R2 client di modul storage
- Modul auth (register, login, refresh, JWT + RBAC untuk customer/admin/operator/driver) dengan unit test
- Modul users (CRUD profil) dengan unit test
- Modul equipment (CRUD, filter kategori/status, cek availability efisien) dengan unit test
- Modul booking (create dengan validasi konflik overlap, update status) dengan unit test
- TypeScript strict mode, validasi class-validator, exception filter global, response interceptor seragam
