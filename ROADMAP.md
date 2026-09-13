# Roadmap

## Fase 1 — MVP (Target: sesuai eksekusi awal)

- [x] Setup backend, database, storage (NestJS, Prisma, PostgreSQL, Redis + BullMQ, R2)
- [x] Modul auth, users, equipment, booking (JWT + RBAC, validasi overlap, pagination)
- [x] Modul pricing, payment, contract, maintenance, storage, notification
- [x] Frontend customer (catalog, detail + availability calendar, checkout, dashboard, auth httpOnly cookie)
- [x] Frontend admin (dashboard ringkasan, manajemen alat + upload R2, manajemen booking, maintenance, laporan CSV)

## Fase 2 — Penyempurnaan

- [x] Notifikasi WhatsApp (interface placeholder siap, mock)
- [x] Laporan & analitik admin (filter tanggal, export CSV)
- [x] Optimasi performa (index komposit bookings, pagination, query efisien tanpa N+1, lazy image)
- [ ] Redis cache untuk kategori & availability (struktur siap, tinggal enable)
- [ ] Rate limiting granular per-endpoint (sudah global throttler, perlu tune per-role)

## Fase 3 — Ekspansi

- [ ] GPS/IoT tracking alat real-time
- [ ] Multi-cabang/multi-gudang (tambah field warehouse_id, filter lokasi diperluas)
- [ ] Dynamic pricing otomatis (musiman, demand-based) — pricing service sudah ada diskon 7/30 hari, bisa dikembangkan
- [ ] Mobile app operator/driver (role operator/driver sudah ada di schema & RBAC)

> Update checklist ini setiap kali sebuah item selesai dikerjakan. Jangan menandai selesai jika belum lulus audit di Fase 7.
