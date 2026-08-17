# Backlog PERIANG

Daftar fitur/task yang **belum** ada di plan NgodingPakeAI (plan saat ini
sudah `done: true` — semua 36 task Fase 4 + Fase 1-3 selesai), dikumpulkan
dari diskusi & kebutuhan yang muncul setelah plan pertama rampung. File ini
adalah sumber untuk PRD/task batch berikutnya.

Status per 2026-08-14: **belum dikirim ke server NgodingPakeAI.** CLI
`ngodingpakeai` tidak punya perintah untuk membuat task/PRD baru (hanya
bisa pull task yang sudah ada) — jadi pengiriman **wajib manual**: salin
prompt di bagian bawah file ini ke chat/PRD-input di aplikasi
NgodingPakeAI. File ini akan selalu dijaga up-to-date setiap ada temuan
task baru, dan di-push ke GitHub setiap perubahan.

---

## Epic 1 — Pendaftaran Akun Kader

**Kenapa:** saat ini kader baru cuma bisa dibuat manual lewat
`php artisan tinker`/seeder — tidak ada jalur self-service. Ditemukan saat
user bertanya "bagaimana mekanisme pendaftaran akun" (2026-08-14) dan
ternyata `POST /api/register` belum ada sama sekali (`php artisan
route:list` dicek, kosong).

- [ ] **Buat API pendaftaran akun kader baru** — endpoint `POST
      /api/register` di `AuthController`, terima `name`, `email`,
      `password`, `posyandu`, validasi email unik, simpan ke tabel `users`,
      balikin token Sanctum (langsung login setelah daftar, sama seperti
      alur `/api/login`).
- [ ] **Buat halaman Daftar Akun di frontend** — halaman baru `/daftar`
      (mirip `/masuk`), form nama/email/posyandu/kata sandi, panggil
      `POST /api/register`, redirect ke halaman utama setelah berhasil.
      Tambahkan link "Belum punya akun? Daftar" di halaman `/masuk`.

## Epic 2 — Notifikasi & Email Nyata

**Kenapa:** `MAIL_MAILER=log` di `.env` backend saat ini — endpoint
`lupa-kata-sandi`/`reset-kata-sandi` sudah ada tapi emailnya **cuma
ditulis ke file log**, tidak benar-benar terkirim ke inbox user.
Ditemukan saat user tanya soal email (2026-08-14).

- [ ] **Sambungkan pengiriman email ke layanan SMTP asli** — ganti
      `MAIL_MAILER` dari `log` ke layanan nyata (rencana: SMTP Google
      Workspace di domain `periang.id`, atau Resend/Mailgun sebagai
      alternatif), isi kredensial di `.env` produksi, pastikan template
      email lupa-kata-sandi terkirim & linknya valid.
- [ ] **(Opsional) Notifikasi email tambahan** — mis. email selamat datang
      setelah daftar akun (tergantung Epic 1), atau notifikasi ke kader
      saat ada balita berstatus gizi buruk/kurang setelah pemeriksaan
      tersimpan.

## Epic 3 — Model Prediksi Risiko (Champion ML Algorithm) ⭐ SELESAI (MVP)

**Status 2026-08-17: implementasi inti SELESAI & diverifikasi end-to-end**
di sesi lokal (bukan lewat NgodingPakeAI — dikerjakan langsung atas
instruksi user). Detail teknis lengkap:
[docs/champion-model-integration.md](docs/champion-model-integration.md),
PRD: [docs/prd/prd-v10-2026-08-14.md](docs/prd/prd-v10-2026-08-14.md).

- **Sumber model:** `disertasi-ita-2022-2024/model/champion_model_2022_2024.pkl`
  — Gradient Boosting (scikit-learn 1.7.2), hasil riset disertasi Ropitasari
  (SSGI 2022+2024, Time-Shift Validation). Recall 0.86, AUC 0.68, threshold
  klasifikasi 0.16 (bukan 0.5 — sengaja rendah demi sensitivitas skrining).
  **Sudah diverifikasi bisa di-load & prediksi** dengan `scikit-learn==1.7.2`
  + `joblib`.
- **Kondisi saat ini di PERIANG:**
  `backend/app/Services/PrediksiRisikoService.php` masih rule-based
  placeholder (skor berbobot manual, bukan model ML asli).
- **Temuan penting:** model butuh **21 fitur granular** (pekerjaan &
  pendidikan ortu, sanitasi rinci, berat/panjang/usia kandungan lahir,
  jenis imunisasi spesifik, dll — daftar lengkap di dokumen teknis). Tabel
  `faktor_risiko` PERIANG saat ini cuma punya **5 field kasar**. Perlu
  keputusan: perluas skema+form ke 21 field (akurat, form lebih panjang)
  atau isi field yang hilang dengan nilai default (form tetap sederhana,
  akurasi berkurang). Lihat dokumen teknis bagian 5 untuk detail opsi.
- **Model adalah file Python (`.pkl`) — Laravel tidak bisa menjalankannya
  langsung.** Rencana arsitektur: microservice Python kecil (FastAPI) yang
  load model & expose `POST /predict`, dipanggil dari
  `PrediksiRisikoService` lewat HTTP. Kontrak endpoint
  `GET /api/balita/{id}/prediksi` (skor, tingkat_risiko,
  faktor_kontribusi, rekomendasi_umum, rekomendasi) dipertahankan supaya
  frontend tidak perlu berubah.

- [x] **Putuskan skema Faktor Risiko: fidelitas penuh (21 field) atau
      mapping perkiraan (5 field + default)** — user pilih **fidelitas
      penuh**, 5 field lama dipertahankan (tidak dihapus).
- [x] **Migration + form Faktor Risiko diperluas ke field granular** — 16
      kolom baru ditambahkan (`add_model_fields_to_faktor_risiko_table`),
      `faktor-risiko-form.tsx` diperluas. Catatan: 13 dari 16 field masih
      berupa **input kode angka mentah** (bukan dropdown berlabel) karena
      buku kode kuesioner SSGI resmi belum ditemukan — lihat item baru di
      bawah.
- [x] **Bangun microservice Python untuk serving model** —
      `ml-service/main.py` (FastAPI), pin `scikit-learn==1.7.2`, endpoint
      `POST /predict` dengan imputasi median otomatis untuk field kosong.
- [x] **Integrasikan `PrediksiRisikoService` ke microservice** — rule-based
      diganti total, fallback 503 + pesan jelas kalau microservice mati
      (diverifikasi langsung: connection refused → 503, bukan 500 crash).
- [ ] **Cari/dapatkan buku kode (codebook) resmi kuesioner SSGI 2022/2024**
      — supaya 13 field kode mentah (pekerjaan/pendidikan ortu, jenis
      jamban, sumber air, dll — daftar lengkap di
      `docs/champion-model-integration.md`) bisa diganti jadi dropdown
      berlabel manusia, bukan angka kode tanpa keterangan. User perlu cari
      dokumen kuesioner SSGI resmi (BPS/Kemenkes/BKKBN) atau hubungi tim
      SSGI.
- [ ] **Deploy microservice ke VPS** — jalan sebagai service terpisah
      (systemd/pm2/docker) di samping Laravel & Next.js, lihat Epic 4.
- [ ] **(Opsional) Real SHAP per-instance untuk faktor_kontribusi** — saat
      ini `faktor_kontribusi` di response API cuma heuristik sederhana
      (BBLR, prematur, jumlah field kosong), bukan SHAP value asli per
      balita. Bisa ditingkatkan nanti kalau dibutuhkan penjelasan lebih
      detail per prediksi.

## Epic 5 — Redesign Form Faktor Risiko ML (UX lebih "asyik") ⭐ DAYA JUAL

**Kenapa:** fitur Prediksi Risiko (model ML) adalah nilai jual utama
aplikasi ini menurut user (2026-08-17), tapi form-nya saat ini (16 field
angka mentah dalam grid statis) terasa kaku, tidak interaktif, dan kurang
meyakinkan untuk fitur "andalan". User minta pengalaman pengisian yang
lebih menarik — dicontohkan seperti Typeform (satu pertanyaan per layar,
tombol next/back, pilihan berbentuk kartu/opsi, bukan cuma input angka).

- [ ] **Rancang & bangun wizard pengisian faktor risiko bertahap** —
      ganti grid 16 input statis di `faktor-risiko-form.tsx` dengan alur
      step-by-step (1 pertanyaan per layar atau dikelompokkan per tema:
      kehamilan & kelahiran, rumah tangga, sanitasi, imunisasi), tombol
      Lanjut/Kembali, progress indicator, transisi halus.
  - Prasyarat: field kategorikal (pekerjaan, pendidikan, sanitasi, dll)
    perlu label pilihan asli (bukan angka kode) — tergantung penyelesaian
    task codebook SSGI di Epic 3 supaya opsinya bisa ditampilkan sebagai
    kartu pilihan berlabel, bukan angka.
  - Field numerik murni (usia kandungan, jumlah anggota rumah tangga, dll)
    bisa tetap input angka tapi dengan komponen yang lebih besar/nyaman
    (mis. stepper +/-, bukan `<input type=number>` polos).

## Epic 4 — Deployment Produksi ke VPS

**Kenapa:** user sudah punya VPS + domain `periang.id` + Google Workspace
di domain tersebut (dibahas 2026-08-14), siap deploy setelah fitur-fitur
di atas selesai.

- [ ] **Siapkan konfigurasi produksi backend** — `.env` produksi
      (`APP_DEBUG=false`, `APP_URL`, DB kredensial VPS, `MAIL_MAILER` SMTP
      Google Workspace — lihat Epic 2), `CORS` diarahkan ke domain
      frontend produksi (bukan `localhost`).
- [ ] **Siapkan konfigurasi produksi frontend** — `NEXT_PUBLIC_API_URL`
      mengarah ke `api.periang.id`, build produksi (`npm run build` +
      `pm2`/proses manager).
- [ ] **Setup domain & SSL di VPS** — DNS `periang.id` → VPS (A record)
      untuk web app, `api.periang.id` untuk backend, MX record tetap ke
      Google Workspace untuk email, pasang SSL (certbot) di kedua
      subdomain.

## Epic 6 — Redesign Tampilan Desktop

**Kenapa:** user tegas menyampaikan (2026-08-17) versi desktop aplikasi
ini "jelek" — PERIANG dibangun mobile-first, dan tampilan desktop terasa
seperti versi mobile yang dipaksa melebar, bukan dirancang khusus.
**Eksplisit diminta TIDAK dikerjakan sekarang** — dicatat sebagai rencana
redesign terpisah untuk nanti.

Keluhan konkret yang sudah ditemukan (jadi bahan redesign, bukan langsung
diperbaiki satu-satu):
- Gambar hero/ilustrasi yang sama dipakai mentah-mentah di mobile & desktop
  lewat `object-cover` crop otomatis — hasilnya kepala karakter terpotong
  di mobile, dan gambar jadi "tipis"/pipih tidak proporsional di desktop.
  Saran user: mobile boleh crop/tarik ke bawah, tapi desktop sebaiknya
  gambar ditampilkan utuh berbentuk kotak (persegi) di luar area
  header/nav, bukan dipaksa jadi strip tipis memanjang.
- Halaman-halaman internal (Cek Gizi, Balita, dst.) di desktop terlihat
  seperti card mobile yang di-center dengan banyak ruang kosong di
  kiri-kanan (`max-w-5xl` di `layout.tsx`) — perlu dipikirkan ulang: apakah
  tetap bounded-card ala mobile-app, atau desktop dapat layout khususnya
  sendiri (mis. sidebar nav, grid multi-kolom, dsb) alih-alih sekadar
  melebarkan versi mobile.
- Halaman Masuk sempat berkali-kali direvisi ad-hoc (hero dilepas total per
  2026-08-17 supaya cepat stabil) — perlu didesain ulang dengan sengaja
  untuk desktop, bukan tempelan dari versi mobile.

- [ ] **Riset/rancang arahan desain desktop yang proper** — tentukan pola
      layout desktop yang disengaja (bukan derivasi otomatis dari mobile):
      breakpoint mana yang dapat treatment berbeda, bagaimana pola
      penempatan gambar/ilustrasi per breakpoint, dan bagaimana bounded
      card `max-w-5xl` diperlakukan (dipertahankan/diganti).
- [ ] **Terapkan ke seluruh halaman** setelah arahan desain disepakati
      (bukan per-halaman ad-hoc seperti yang terjadi di `/masuk`
      2026-08-17).

---

## Catatan

- **Welcome Tour** (spotlight/masking + tooltip + walkthrough) **sudah
  selesai dikerjakan langsung di sesi lokal** (2026-08-14), tidak perlu
  masuk backlog/PRD — lihat [STATUS.md](STATUS.md) bagian "Fitur tambahan
  (di luar plan server): Welcome Tour".
- Urutan pengerjaan yang disarankan: **Epic 3 (Model Prediksi) dulu**
  (prioritas utama user), lalu Epic 1 & 2 (saling terkait — daftar akun +
  email), baru Epic 4 (deployment, butuh Epic 1-3 selesai & stabil dulu).

---

## Prompt untuk NgodingPakeAI

Salin teks di bawah ini (atau versi yang sudah kamu sesuaikan) sebagai
update PRD/permintaan task baru ke server NgodingPakeAI, supaya dipecah
jadi task-task baru menyambung plan PERIANG yang sudah ada:

```
Update PRD PERIANG (Prediksi dan Analisis Balita Gizi Kurang) — tambahkan
4 fitur baru menyambung plan yang sudah selesai (36 task Fase 4 + Fase 1-3
sudah done, tech stack: Laravel + PostgreSQL + Next.js + VPS):

1. Model Prediksi Risiko (Champion ML Algorithm) — PRIORITAS UTAMA.
   Saya sudah punya model asli hasil riset disertasi (Gradient Boosting,
   scikit-learn 1.7.2, file champion_model_2022_2024.pkl, sudah
   diverifikasi bisa jalan). Model butuh 21 fitur granular yang belum
   semuanya ada di tabel faktor_risiko PERIANG (saat ini cuma 5 field
   kasar) — lihat docs/champion-model-integration.md untuk daftar
   lengkap & opsi implementasi. Karena model adalah file Python, buat
   microservice Python (FastAPI) yang load model & expose endpoint
   prediksi, lalu backend/app/Services/PrediksiRisikoService.php
   memanggilnya lewat HTTP menggantikan logika rule-based saat ini.
   Pertahankan kontrak response endpoint GET /api/balita/{id}/prediksi
   (skor, tingkat_risiko, faktor_kontribusi, rekomendasi_umum,
   rekomendasi) supaya frontend tidak perlu berubah. Sertakan
   penanganan fallback kalau microservice tidak terjangkau.

2. Pendaftaran Akun Kader (self-registration). Saat ini akun kader
   cuma bisa dibuat manual (seeder/tinker), belum ada API register.
   Buat endpoint POST /api/register (nama, email, kata sandi,
   posyandu, validasi email unik, langsung login/dapat token setelah
   daftar) dan halaman frontend /daftar (mirip halaman /masuk yang
   sudah ada), plus link "Belum punya akun? Daftar" di halaman masuk.

3. Notifikasi Email Nyata. Saat ini MAIL_MAILER masih "log" (email
   lupa-kata-sandi cuma ditulis ke file, tidak benar-benar terkirim).
   Sambungkan ke layanan SMTP asli (rencana: Google Workspace di
   domain periang.id) supaya email lupa-kata-sandi & (kalau relevan)
   notifikasi lain benar-benar terkirim ke inbox user.

4. Deployment Produksi ke VPS. Siapkan konfigurasi produksi backend
   (.env produksi, CORS ke domain frontend asli, bukan localhost) dan
   frontend (NEXT_PUBLIC_API_URL ke domain API produksi), serta
   panduan/setup domain periang.id + SSL di VPS milik saya.

Urutan prioritas: fitur 1 (Model Prediksi) paling penting duluan, lalu
fitur 2 & 3 (saling terkait), baru fitur 4 (deployment, di akhir setelah
1-3 stabil).
```
