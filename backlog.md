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

## Epic 3 — Model Prediksi Risiko (Champion ML Algorithm) ⭐ PRIORITAS

**Kenapa:** ini prioritas paling penting menurut user (dicatat sejak
2026-08-14 di [STATUS.md](STATUS.md)). **Diriset penuh 2026-08-14** — model
asli ditemukan & diverifikasi bisa jalan (bukan lagi rencana abstrak). Detail
teknis lengkap: [docs/champion-model-integration.md](docs/champion-model-integration.md).

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

- [ ] **Putuskan skema Faktor Risiko: fidelitas penuh (21 field) atau
      mapping perkiraan (5 field + default)** — keputusan user, menentukan
      scope 2 task di bawah.
- [ ] **Migration + form Faktor Risiko diperluas ke field granular** (kalau
      pilih fidelitas penuh) — kolom baru di tabel `faktor_risiko` sesuai
      21 fitur model, form `faktor-risiko-form.tsx` diperluas dengan
      dropdown berbahasa manusia (bukan kode SSGI mentah).
- [ ] **Bangun microservice Python untuk serving model** — FastAPI/Flask,
      load `champion_model_2022_2024.pkl` (pin `scikit-learn==1.7.2` +
      `joblib`), endpoint `POST /predict` terima 21 fitur → balikin
      probabilitas + klasifikasi risiko (threshold 0.16).
- [ ] **Integrasikan `PrediksiRisikoService` ke microservice** — ganti
      logika rule-based dengan pemanggilan HTTP ke microservice,
      pertahankan kontrak response endpoint
      `GET /api/balita/{id}/prediksi` di atas. Tangani fallback kalau
      microservice tidak terjangkau (mis. fallback ke rule-based lama +
      log error) supaya fitur Prediksi Risiko tidak ikut rusak total.
- [ ] **Deploy microservice ke VPS** — jalan sebagai service terpisah
      (systemd/pm2/docker) di samping Laravel & Next.js, lihat Epic 4.

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
