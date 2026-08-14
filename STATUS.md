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

**Riwayat Cek** (frontend, selesai semua):
- [x] Halaman daftar riwayat cek balita (`/riwayat`, dikelompokkan per balita)
- [x] Halaman detail pemeriksaan balita (`/riwayat/[id]`)
- [x] Alur ubah & hapus pemeriksaan (dialog ubah dengan hitung ulang status
      otomatis + field catatan; hapus dengan konfirmasi)

**Grafik Pertumbuhan** (frontend, selesai semua):
- [x] Halaman grafik pertumbuhan dengan data tiruan (`/grafik`, recharts +
      shadcn chart wrapper)
- [x] Grafik berat badan per umur (label sumbu, legend)
- [x] Grafik tinggi badan per umur (label sumbu, legend)
- [x] Legenda + pita "rentang normal" (Area range antara batas kurang &
      batas atas visual) di kedua grafik
- [x] Pesan kosong untuk 3 skenario: belum ada balita sama sekali, belum
      pilih balita, balita terpilih belum punya riwayat (dengan CTA ke
      halaman terkait)

**Prediksi Risiko** (frontend, selesai semua):
- [x] Halaman prediksi risiko dengan pilihan balita (`/prediksi`, form faktor
      risiko: riwayat lahir, imunisasi, ASI eksklusif, sanitasi, pendapatan
      keluarga opsional — `faktor-risiko-store.ts` localStorage)
- [x] Logika skor risiko sederhana (`prediksi-risiko.ts`, placeholder
      pengganti model AI — bobot per faktor + status gizi terakhir balita,
      skor maks 11, ambang rendah/sedang/tinggi)
- [x] Tampilkan hasil skor + faktor yang berkontribusi + badge tingkat risiko
- [x] Tampilkan rekomendasi sesuai tingkat risiko (banner umum per tingkat
      risiko + daftar rekomendasi per faktor)

**Backend** (selesai semua):
- [x] Data Balita: migrasi tambahan kolom `posyandu` di tabel `balita`
      (tabel & sebagian kolom sudah ada dari Fase 1), model & seeder
      diselaraskan; CRUD penuh (`GET/POST /api/balita`,
      `GET/PUT/DELETE /api/balita/{id}`) dengan validasi bahasa Indonesia;
      pencarian `?q=` case-insensitive (nama & posyandu, aman untuk
      PostgreSQL maupun SQLite lewat `LOWER(...) LIKE`)
- [x] Riwayat Cek: tabel `pemeriksaan` sudah lengkap dari Fase 1; tambah
      endpoint detail (`GET /api/pemeriksaan/{id}`), ubah & hapus
      (`PUT`/`DELETE /api/pemeriksaan/{id}` — status gizi dihitung ulang
      otomatis saat ubah)
- [x] Grafik Pertumbuhan: tabel baru `standar_who` (median berat/tinggi WHO
      per bulan usia 0–60, per jenis kelamin) + seeder + endpoint
      `GET /api/standar-who?jenis_kelamin=`; titik referensi WHO
      diekstrak ke `App\Support\StandarPertumbuhanWho` (dipakai bareng oleh
      `StatusGiziService` & seeder, tidak ada duplikasi data)
- [x] Prediksi Risiko: tabel & model `FaktorRisiko` (satu baris per balita,
      upsert lewat `PUT /api/balita/{id}/faktor-risiko`); service
      `PrediksiRisikoService` — port 1:1 dari logika skor frontend
      (`prediksi-risiko.ts`) ke PHP; endpoint
      `GET /api/balita/{id}/prediksi` menghitung skor dari faktor risiko +
      status gizi pemeriksaan terakhir balita

49 test (unit + feature) lolos. Jalankan `php artisan test` dari `backend/`.

**Backend Fase 2 selesai.** Frontend masih pakai data localStorage (belum
di-wiring ke API backend — lihat catatan implementasi). Task berikutnya:
**Fase 3 — Login & Pengaturan** (frontend, dimulai dari layout utama
aplikasi).

### Fase 3 — Login & Pengaturan
Sedang berjalan.

**Frontend** (selesai semua):
- [x] Layout utama dengan data kader tiruan (`kader-data.ts` +
      `kader-store.ts` localStorage; `KaderChip` avatar+nama di `TopNav`
      desktop & `MobileHeader` mobile)
- [x] Halaman masuk dengan validasi tiruan (`/masuk`, kredensial demo
      `ratna.dewi@posyandu.id` / `posyandu123` — `auth-store.ts`)
- [x] Proteksi route halaman utama (`RouteGuard` di root layout: redirect ke
      `/masuk` kalau belum login, redirect ke `/` kalau sudah login tapi
      buka halaman publik)
- [x] Menu profil dengan opsi keluar (dropdown dari `KaderChip`, Base UI
      Menu — `dropdown-menu.tsx`)
- [x] Halaman profil dengan form nama & posyandu (`/akun`, reaktif ke
      `KaderChip` lewat `useSyncExternalStore`)
- [x] Bagian ganti kata sandi dengan validasi (di `/akun`, cek kata sandi
      lama sebelum simpan yang baru)
- [x] Halaman lupa kata sandi (`/lupa-kata-sandi`, simulasi kirim tautan —
      belum ada pengirim email asli)
- [x] Halaman reset kata sandi dari tautan (`/reset-kata-sandi?token=...`,
      tautan tanpa token → pesan tidak valid)

**Backend** (selesai semua):
- [x] Migrasi tabel `users` & model pengguna: tambah kolom `posyandu`
      (tabel `users` sudah ada dari scaffolding Laravel), seeder kader demo
      diselaraskan dengan `DUMMY_KADER` frontend (`ratna.dewi@posyandu.id` /
      `posyandu123`), relasi `User::balita()`
- [x] API login & logout: `POST /api/login` (Sanctum personal access
      token), `POST /api/logout` (cabut token aktif) — `AuthController`,
      trait `HasApiTokens` di model `User`
- [x] Middleware autentikasi API: semua endpoint data (`/balita`,
      `/pemeriksaan`, `/standar-who`, `/faktor-risiko`, `/prediksi`,
      `/profil`) dikelompokkan di bawah middleware `auth:sanctum`
- [x] API profil pengguna: `GET/PUT /api/profil` (lihat & ubah nama +
      posyandu kader yang sedang masuk) — `ProfilController`
- [x] API ganti kata sandi: `PUT /api/profil/kata-sandi` (validasi
      `current_password` bawaan Laravel + `confirmed`)
- [x] API lupa kata sandi dengan email: `POST /api/lupa-kata-sandi`
      (Laravel password broker, `MAIL_MAILER=log` di lokal — tautan email
      dibuat mengarah ke `FRONTEND_URL/reset-kata-sandi?token=&email=` lewat
      `ResetPassword::createUrlUsing()` di `AppServiceProvider`); selalu
      balas pesan generik supaya tidak bisa dipakai menebak email terdaftar
- [x] API atur ulang kata sandi: `POST /api/reset-kata-sandi` (konsumsi
      token password broker, token sekali pakai & kedaluwarsa 60 menit)

78 test (unit + feature) lolos. Jalankan `php artisan test` dari `backend/`.

**Backend Fase 3 selesai — seluruh plan PERIANG (Fase 1–3) selesai.**
Task berikutnya: **wiring frontend ke API backend** (ganti localStorage
`auth-store.ts`/`kader-store.ts`/`balita-store.ts`/dst. dengan pemanggilan
API asli + token Sanctum) — lihat catatan implementasi di bawah untuk daftar
titik yang perlu diganti. Ini belum termasuk task terpisah di plan
NgodingPakeAI; jalankan `task next` lagi setelah reconnect untuk konfirmasi
apakah ada task lanjutan yang baru muncul.

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
- Login masih **tiruan di frontend** (`auth-store.ts`, `kader-store.ts`,
  localStorage) — backend Sanctum (`POST /api/login`, `/api/logout`,
  `/api/profil`, dst.) sudah selesai & teruji, tapi frontend belum
  di-wiring untuk memanggilnya. Kredensial dummy frontend
  (`ratna.dewi@posyandu.id` / `posyandu123`) sengaja disamakan dengan
  seeder backend supaya wiring nanti tinggal ganti implementasi
  `auth-store.ts` tanpa perlu ubah UI.
- **Semua endpoint API kini butuh autentikasi** (`auth:sanctum`) kecuali
  `/api/login`, `/api/lupa-kata-sandi`, `/api/reset-kata-sandi`. Setelah
  wiring frontend, request ke `/api/balita`, `/api/pemeriksaan`, dll. wajib
  menyertakan header `Authorization: Bearer <token>` dari hasil login.
- **Bug penting yang sudah diperbaiki**: `RouteGuard` (`route-guard.tsx`)
  sempat salah redirect ke `/masuk` walau user sudah login, karena efeknya
  membaca nilai `isLoggedIn` dari render pertama `useSyncExternalStore` yang
  masih memakai `getServerSnapshot()` (selalu `false`) sesaat sebelum
  snapshot klien sinkron saat hydration. Perbaikan: di dalam `useEffect`,
  baca status auth langsung lewat `getAuthSnapshot()` (bukan variabel hasil
  render) sehingga selalu dapat nilai terkini. Kalau ada guard/efek serupa
  yang membaca `useSyncExternalStore` untuk keputusan redirect di halaman
  lain, terapkan pola yang sama.
