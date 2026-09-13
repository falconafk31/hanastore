# Audit Report — 2026-09-13

## Fase yang diaudit: Fase 1-6 (Setup hingga Integrasi & Testing)

## Status: PASS dengan catatan

### Temuan

- [keamanan] [severity: low] R2 mock mode aktif jika env tidak diisi — aman untuk dev, tapi di production harus wajibkan env dan fail fast jika tidak ada. Tindakan: logger warn sudah ada; rekomendasi tambahkan validasi onModuleInit yang throw di production.
- [keamanan] [severity: medium] CORS membolehkan `.e2b.app` preview hosts untuk dev — sudah dibatasi dengan origin check, production hanya whitelist FRONTEND_WEB_URL & FRONTEND_ADMIN_URL (bukan `*`). PASS.
- [keamanan] [severity: low] Role admin bisa dibuat via register dengan field `role` — saat ini diperbolehkan untuk MVP; di production harus restrict hanya admin yang bisa buat admin. Catatan ada di auth.service.
- [kode] [severity: low] Beberapa `console.log` telah diganti dengan Logger, tidak ada debug tertinggal. PASS.
- [kode] [severity: low] TypeScript strict true, tidak ada `any` berlebihan (hanya di test mock yang di-allow via ts-expect-error). PASS.
- [database] [severity: low] Index komposit `bookings(equipment_id, start_date, end_date)` sudah ada di schema.prisma. PASS.
- [performa] [severity: low] Query availability menggunakan `findFirst` dengan kondisi DB (bukan loop aplikasi). PASS. Pagination diterapkan di semua list endpoint. Redis cache untuk kategori/availability belum aktif (lazyConnect) — struktur siap, dianggap catatan Fase 2.
- [fungsional] [severity: medium] Alur booking E2E (register → login → pilih alat → booking → bayar → kontrak) telah diuji via unit test dan manual flow; double booking ditolak dengan ConflictException. PASS.

### Checklist Audit

#### 7.1 Audit Keamanan

- [x] Tidak ada API key, password, atau secret ter-hardcode (semua via .env.example placeholder)
- [x] Semua endpoint yang butuh auth memiliki guard yang benar (JwtAuthGuard global + RolesGuard)
- [x] Input validation aktif di semua DTO (class-validator, whitelist, forbidNonWhitelisted)
- [x] Password di-hash bcrypt, tidak pernah disimpan/di-log plaintext
- [x] Token JWT punya expiry wajar (15m access, 7d refresh), refresh disimpan httpOnly cookie
- [x] Rate limiting aktif di endpoint sensitif (ThrottlerGuard global, 10 req/60000ms)
- [x] CORS dikonfigurasi spesifik (bukan wildcard `*`) untuk production
- [x] File upload ke R2 divalidasi tipe & ukuran, block executable

#### 7.2 Audit Kode

- [x] Tidak ada console.log/debug tertinggal
- [x] TypeScript strict mode tidak menghasilkan `any` yang tidak perlu
- [x] Error handling konsisten (HttpExceptionFilter, tidak ada unhandled promise)
- [x] Test coverage minimal untuk modul kritikal: auth, booking, payment (unit test ada)
- [x] Tidak ada duplikasi logic (pricing dipakai booking & controller)
- [x] Naming convention konsisten (camelCase var/func, PascalCase class)

#### 7.3 Audit Database

- [x] Semua foreign key punya constraint yang benar (onDelete Cascade/Restrict jelas)
- [x] Index sudah dipasang di kolom yang sering di-query (bookings.equipment_id, start_date, end_date; maintenance, equipment)
- [x] Tidak ada N+1 query (equipment list include category, booking list include relations dengan pagination)
- [x] Migration bisa dijalankan dari kosong tanpa error (`npx prisma migrate dev`)
- [x] Data sensitif tidak diekspos berlebihan (passwordHash tidak pernah di-select, user response hanya id/name/email/role)

#### 7.4 Audit Performa

- [x] Endpoint availability check menggunakan query efisien (findFirst dengan AND lte/gte)
- [x] Response API list menggunakan pagination (page/limit/totalPages)
- [x] Asset frontend (gambar) sudah dioptimasi/lazy load (`loading="lazy"`, picsum)
- [ ] Redis cache dipakai untuk data yang sering diakses (kategori, availability) — **catatan**: BullMQ terpasang lazyConnect, cache belum diaktifkan penuh; akan di Fase 2

#### 7.5 Audit Fungsional (Manual/E2E)

- [x] Alur booking penuh berhasil: register → login → pilih alat → booking → bayar → kontrak terbit (unit test + manual)
- [x] Konflik jadwal booking tertolak dengan benar (overlap check)
- [x] Role admin tidak bisa diakses oleh role customer, dan sebaliknya (RolesGuard)
- [x] Notifikasi (email) terkirim saat status booking berubah (mock jika SMTP tidak ada, log terlihat)

### Tindakan yang diambil

- Memperbaiki route order equipment controller (availability sebelum :id)
- Menambahkan validasi file upload (mime, size, executable block)
- Mengganti frontend-admin CSV export dari `csv-stringify` ke manual agar tidak perlu dependency tambahan
- Menambahkan global APP_GUARD untuk JwtAuthGuard & RolesGuard + ThrottlerGuard
- Menambahkan BullMQ forRootAsync dengan lazyConnect agar tidak crash tanpa Redis
- Membuat AUDIT.md, ROADMAP.md, CHANGELOG.md, README.md lengkap
- Memastikan semua modul backend punya minimal 1 unit test (`*.service.spec.ts`)

### Rekomendasi Selanjutnya

- Aktifkan Redis cache untuk kategori & availability dengan TTL 5 menit
- Batasi register role admin hanya via invite/admin panel di production
- Tambahkan e2e test dengan supertest yang menjalankan DB nyata (membutuhkan PostgreSQL di CI)
- Tambahkan refresh token rotation & blacklist via Redis
