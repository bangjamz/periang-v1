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

**Backend** (selesai semua):
- [x] Buat tabel riwayat pemeriksaan gizi dan migrasi (`pemeriksaan` table + model `Pemeriksaan`)
- [x] Buat endpoint daftar balita pemeriksaan (`GET /api/balita`, + tabel `balita` + seeder selaras dummy frontend)
- [x] Buat service penentu status gizi (`StatusGiziService` — klasifikasi
      Gomez/Waterlow persen-median dari referensi WHO, bukan lagi formula
      linear dummy)
- [x] Buat endpoint simpan hasil pemeriksaan (`POST /api/pemeriksaan`)
- [x] Buat endpoint riwayat pemeriksaan balita (`GET /api/pemeriksaan`, filter `?balita_id=`)
- [x] Tambah validasi input pemeriksaan di backend (pesan bahasa Indonesia +
      validasi tanggal cek tidak boleh sebelum tanggal lahir)

17 test (unit + feature) lolos. Jalankan `php artisan test` dari `backend/`.

### Fase 2 — Data, Riwayat, Grafik, Prediksi
Sedang berjalan.

**Data Balita** (frontend, selesai semua):
- [x] Halaman daftar balita dengan data tiruan (`/balita`)
- [x] Form tambah balita dengan validasi (dialog, localStorage via `balita-store.ts`)
- [x] Form ubah balita dengan data terisi (dialog sama, mode `ubah`)
- [x] Tombol hapus balita dengan konfirmasi (cascade hapus riwayat terkait)
- [x] Pencarian balita dengan filter langsung (nama/posyandu + jenis kelamin + posyandu dropdown)
- [x] Aksi "Periksa Status Gizi" dari kartu balita → `/cek-status-gizi?balita={id}` (pre-select otomatis)

**Riwayat Cek** (frontend, berjalan):
- [x] Halaman daftar riwayat cek balita (`/riwayat`, dikelompokkan per balita)
- [x] Halaman detail pemeriksaan balita (`/riwayat/[id]`)
- [ ] *(sisa task — cek `task next`, kemungkinan "Koreksi riwayat")*

Backend untuk Data Balita & Riwayat Cek (CRUD balita, dsb.) belum dikerjakan —
menyusul setelah frontend fase ini selesai (frontend-first).

### Fase 3 — Login & Pengaturan
Belum dimulai.

## Catatan implementasi penting

- Data balita di frontend masih **dummy** (`frontend/src/lib/dummy-data.ts`) —
  8 balita contoh. Perlu diselaraskan dengan seeder backend saat tabel
  `balita` & endpoint API dibuat.
- Perhitungan status gizi di frontend (`hitung-status-gizi.ts`) masih
  **placeholder sederhana** (belum dipanggil ke API backend — frontend fase 1
  murni dummy sesuai strategi frontend-first). Backend sudah punya versi
  resminya di `StatusGiziService` (klasifikasi Gomez/Waterlow). Saat wiring
  API dilakukan (biasanya di fase lanjut atau task terpisah), frontend perlu
  diarahkan memanggil `POST /api/pemeriksaan` alih-alih hitung lokal.
- Nama tabel di database backend memakai singular non-plural gaya Indonesia
  (`pemeriksaan`, bukan `pemeriksaans`) — ikuti konvensi ini untuk tabel lain
  (`balita`, `faktor_risiko`, `prediksi`).
- PRD sempat diperbarui beberapa kali selama pengerjaan (v1 → v6): tambahan
  requirement mobile-first + bottom navigation, responsive tablet/PC, dan
  visual ceria dengan Font Awesome. Semua sudah diadopsi di frontend.
- Data balita & riwayat cek disimpan di **localStorage** (`balita-store.ts`,
  `riwayat-store.ts`), memakai pola `useSyncExternalStore` agar reaktif lintas
  komponen tanpa Context/refetch manual. Ini akan diganti pemanggilan API
  backend saat wiring dilakukan.
- Base UI (dipakai shadcn di project ini, bukan Radix): saat `Button`
  di-render sebagai elemen non-`<button>` (mis. `render={<Link .../>}`), wajib
  tambahkan prop `nativeButton={false}` — kalau lupa, muncul console error +
  badge "1 Issue" di dev overlay Next.js (sudah 2x kejadian, dicatat di sini
  supaya tidak terulang).
