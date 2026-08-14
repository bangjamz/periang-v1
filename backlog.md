# Backlog PERIANG

Daftar fitur/task yang **belum** ada di plan NgodingPakeAI (plan saat ini
sudah `done: true` — semua 36 task Fase 4 + Fase 1-3 selesai), dikumpulkan
dari diskusi & kebutuhan yang muncul setelah plan pertama rampung. File ini
adalah sumber untuk PRD/task batch berikutnya.

Status per 2026-08-14: **belum dikirim ke server NgodingPakeAI.** Kirim
lewat prompt di bagian bawah file ini (atau versi yang sudah diedit sesuai
prioritas terbaru), lalu update status di sini jadi "Sudah dikirim ke
server — lihat [docs/prd/](docs/prd/)".

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
2026-08-14 di [STATUS.md](STATUS.md), sengaja belum dikirim ke server
supaya tidak bentrok dengan 36 task Fase 4 yang saat itu masih berjalan —
sekarang plan itu sudah selesai, jadi ini kandidat utama batch berikutnya).

- **Kondisi saat ini:** `backend/app/Services/PrediksiRisikoService.php`
  masih rule-based placeholder (skor berbobot manual per faktor risiko,
  bukan model ML asli).
- **Rencana sesuai PRD v9 (bagian Architecture):** backend memanggil model
  champion ML milik user lewat **InsForge Model Gateway** (atau gateway
  lain) untuk menghitung tingkat risiko gizi kurang dari faktor risiko
  balita.
- **Kontrak yang harus dipertahankan:** endpoint `GET
  /api/balita/{id}/prediksi` — response `skor`, `tingkat_risiko`,
  `faktor_kontribusi`, `rekomendasi_umum`, `rekomendasi` — supaya frontend
  (`prediksi/page.tsx`, `prediksi-risiko.ts`) tidak perlu berubah.

- [ ] **Integrasikan model prediksi risiko champion ML ke
      `PrediksiRisikoService`** — ganti/bungkus logika rule-based dengan
      pemanggilan ke InsForge Model Gateway (atau gateway lain yang
      ditentukan user), pertahankan kontrak response endpoint
      `GET /api/balita/{id}/prediksi` di atas.
- [ ] **Tangani fallback saat model/gateway tidak tersedia** — kalau
      panggilan ke gateway gagal/timeout, tentukan perilaku (fallback ke
      rule-based lama, atau pesan error yang jelas ke frontend) supaya
      fitur Cek Status Gizi & Prediksi Risiko tidak ikut rusak.

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
   Saat ini backend/app/Services/PrediksiRisikoService.php masih
   rule-based placeholder. Ganti dengan pemanggilan ke InsForge Model
   Gateway (atau gateway lain) untuk menghitung tingkat risiko gizi
   kurang dari faktor risiko balita, memakai model champion ML milik
   saya. Pertahankan kontrak response endpoint
   GET /api/balita/{id}/prediksi (skor, tingkat_risiko,
   faktor_kontribusi, rekomendasi_umum, rekomendasi) supaya frontend
   tidak perlu berubah. Sertakan penanganan fallback kalau
   gateway/model gagal atau timeout.

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
