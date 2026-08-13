# PERIANG — Status Proyek

Tracking manual progres proyek untuk dipakai saat tidak terhubung ke
NgodingPakeAI. Setelah reconnect, sinkronkan checklist ini dengan hasil
`npx ngodingpakeai task list` / `task next`.

- **Plan ID**: `5f5d37d3-7777-429e-875c-284a13404106`
- **Repo**: https://github.com/bangjamz/periang-v1
- **Tech stack**: Next.js (frontend) · Laravel + PostgreSQL (backend) · deploy VPS

## Setup lokal

### Frontend
```bash
cd frontend
npm install
npm run dev   # http://localhost:3000
```

### Backend
```bash
cd backend
composer install
cp .env.example .env   # lalu sesuaikan DB_* jika perlu
php artisan key:generate
php artisan migrate
php artisan serve
```

Database PostgreSQL lokal: `periang` (dibuat via `createdb periang`,
Postgres 15 via Homebrew — `brew services start postgresql@15`).
Kredensial default di `.env`: `DB_USERNAME=bangjamz`, tanpa password
(sesuaikan dengan user Postgres lokal masing-masing).

## Progres per Fase

### Fase 1 — Cek Status Gizi

**Frontend** (selesai semua):
- [x] Buat halaman cek status gizi dengan dummy
- [x] Buat daftar balita dan pilihan balita (dialog picker + pencarian)
- [x] Buat form input ukuran dan tanggal pemeriksaan (umur otomatis dari tgl lahir)
- [x] Buat kartu hasil status gizi terperinci (progress bar + rekomendasi)
- [x] Buat alur simpan hasil riwayat lokal (localStorage)
- [x] Buat halaman riwayat dari data lokal (`/riwayat`)

**Backend** (berjalan):
- [x] Buat tabel riwayat pemeriksaan gizi dan migrasi (`pemeriksaan` table +
      model `Pemeriksaan`; `balita_id` belum ada FK constraint — menunggu
      tabel `balita` dibuat di task berikutnya)
- [ ] *(sisa task backend fase 1 lainnya — cek `task next` untuk urutan resmi)*

### Fase 2 — Data, Riwayat, Grafik, Prediksi
Belum dimulai.

### Fase 3 — Login & Pengaturan
Belum dimulai.

## Catatan implementasi penting

- Data balita di frontend masih **dummy** (`frontend/src/lib/dummy-data.ts`) —
  8 balita contoh. Perlu diselaraskan dengan seeder backend saat tabel
  `balita` & endpoint API dibuat.
- Perhitungan status gizi di frontend (`hitung-status-gizi.ts`) adalah
  **placeholder sederhana**, bukan standar WHO/KMS resmi — harus diganti
  logika resmi di backend Laravel.
- Nama tabel di database backend memakai singular non-plural gaya Indonesia
  (`pemeriksaan`, bukan `pemeriksaans`) — ikuti konvensi ini untuk tabel lain
  (`balita`, `faktor_risiko`, `prediksi`).
- PRD sempat diperbarui beberapa kali selama pengerjaan (v1 → v6): tambahan
  requirement mobile-first + bottom navigation, responsive tablet/PC, dan
  visual ceria dengan Font Awesome. Semua sudah diadopsi di frontend.
