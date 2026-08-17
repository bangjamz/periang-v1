# Changelog PRD PERIANG

Ringkasan perubahan antar versi PRD. Format: versi terbaru di paling atas.
Isi PRD lengkap per versi ada di file `prd-v{N}-{tanggal}.md` di folder
yang sama — file ini cuma ringkasan diff-nya.

---

## v9 (sebelum 2026-08-14) — baseline sebelum folder ini dibuat

- PRD v9 menambahkan 4 fitur Fase 4 di atas plan v1-v8 yang sudah ada:
  - Hubungkan Aplikasi ke Server (wiring frontend ⇄ backend Laravel)
  - Huruf Ramah dan Angka Menonjol (font & angka besar untuk keterbacaan)
  - Perbaiki Menu Bawah di HP
  - Pasang Gambar dan Maskot Aplikasi
- Total 36 task, seluruhnya **selesai** per 2026-08-14 (lihat
  [STATUS.md](../../STATUS.md)).
- File PRD v9 mentah tidak diarsipkan di sini (dibuat sebelum konvensi
  folder ini ada) — kalau masih ada salinannya, bisa ditambahkan belakangan
  sebagai `prd-v9-*.md` untuk melengkapi riwayat.

---

## v10 (2026-08-14)

- **Ditambahkan:** fitur baru "Integrasi Champion Model Prediksi Risiko" —
  mengganti `PrediksiRisikoService` rule-based dengan model ML asli hasil
  disertasi (`champion_model_2022_2024.pkl`, Gradient Boosting, scikit-learn
  1.7.2), lewat microservice Python (FastAPI) yang dipanggil dari Laravel.
- **Diubah:** skema Faktor Risiko diperluas dari 5 field ke 21 field
  granular sesuai kebutuhan model — kolom lama **dipertahankan** (tidak
  dihapus), sesuai keputusan user.
- **Alasan/konteks:** riset langsung ke
  `disertasi-ita-2022-2024/` (2026-08-14) menemukan model champion sudah
  siap pakai, bukan lagi rencana abstrak. Ini fitur prioritas utama user
  sejak sebelumnya (lihat catatan "Upcoming" di STATUS.md sebelum PRD ini
  dibuat).
- File PRD lengkap: [`prd-v10-2026-08-14.md`](prd-v10-2026-08-14.md).
- Materi tambahan (bukan bagian PRD, untuk kebutuhan akademik user):
  [`../bab4-implementasi-model-periang.md`](../bab4-implementasi-model-periang.md)
  — bahan Bab IV disertasi tentang penerapan praktis model ke PERIANG.

---

<!--
Template entri baru — salin & isi setiap kali ada PRD versi baru:

## v{N} ({YYYY-MM-DD})

- **Ditambahkan:** ...
- **Diubah:** ...
- **Dihapus:** ...
- **Alasan/konteks:** ...
- File PRD lengkap: `prd-v{N}-{YYYY-MM-DD}.md`
-->
