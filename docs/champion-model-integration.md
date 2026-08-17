# Integrasi Champion Model ML ke PERIANG

Catatan teknis hasil riset terhadap
`/Users/bangjamz/Documents/antigravity/disertasi-ita-2022-2024/` (disertasi
Ropitasari, SSGI 2022+2024) — sumber "champion model" yang disebut di
[STATUS.md](../STATUS.md) & [backlog.md](../backlog.md) Epic 3. Dibuat
2026-08-14 supaya riset ini tidak perlu diulang.

## 1. Apa isi model-nya

File: `disertasi-ita-2022-2024/model/champion_model_2022_2024.pkl`
(joblib-pickled dict, **dibuat dengan scikit-learn 1.7.2** — wajib versi
sama untuk load ulang, lihat bagian 4).

```python
{
  "model": <GradientBoostingClassifier>,   # scikit-learn, 150 estimators
  "model_name": "gradient_boosting",
  "threshold": 0.16,                        # ambang klasifikasi risiko (BUKAN 0.5!)
  "feature_cols": [ ... 21 nama kolom, urutan HARUS sama ... ],
  "training_year": 2022,
  "validation_year": 2024,
  "metrics_arah_A": {...},  # recall 0.86, precision 0.27, F1 0.42, AUC 0.68
  "shap_ranking": [...],    # ranking pentingnya fitur
}
```

Cara pakai: `proba = model.predict_proba(X)[:, 1][0]`, lalu
`risiko_tinggi = proba >= threshold` (0.16, bukan 0.5 — sengaja rendah
supaya recall/sensitivitas tinggi, prioritas tidak melewatkan balita
berisiko, konsekuensinya banyak false positive yang wajar untuk skrining).

**Sudah diverifikasi end-to-end** (2026-08-14): model berhasil di-load &
prediksi 1 baris contoh menghasilkan `proba=0.11` (risiko rendah), memakai
Python venv terpisah dengan `scikit-learn==1.7.2`.

## 2. 21 fitur yang dibutuhkan model (`feature_cols`, urutan penting)

| # | Kolom | Arti | Sumber di PERIANG saat ini |
|---|-------|------|------------------------------|
| 1 | `jenis_kelamin` | 0=Laki-laki, 1=Perempuan | ✅ `balita.jenis_kelamin` (perlu diremap L/P→0/1) |
| 2 | `umur_bulan` | umur balita saat diperiksa | ✅ dihitung dari `balita.tanggal_lahir` |
| 3 | `jumlah_art` | jumlah anggota rumah tangga | ❌ belum ada field |
| 4 | `jumlah_balita_rt` | jumlah balita dalam 1 rumah tangga | ❌ belum ada field |
| 5 | `pekerjaan_ayah` | kode SSGI pekerjaan ayah | ❌ belum ada field |
| 6 | `pekerjaan_ibu` | kode SSGI pekerjaan ibu | ❌ belum ada field |
| 7 | `pendidikan_ayah` | kode SSGI pendidikan ayah | ❌ belum ada field |
| 8 | `pendidikan_ibu` | kode SSGI pendidikan ibu | ❌ belum ada field |
| 9 | `kepemilikan_jamban` | kode SSGI jenis jamban | ⚠️ ada versi kasar (`sanitasi`: baik/kurang_baik) |
| 10 | `lokasi_air_minum` | kode SSGI lokasi sumber air | ❌ belum ada field |
| 11 | `pembuangan_limbah_cair` | kode SSGI | ❌ belum ada field |
| 12 | `pembuangan_tinja` | kode SSGI | ❌ belum ada field |
| 13 | `sumber_air_minum` | kode SSGI jenis sumber air | ❌ belum ada field |
| 14 | `berat_badan_lahir_g` | berat lahir dalam **gram** | ⚠️ ada versi kasar (`riwayat_lahir` enum) |
| 15 | `panjang_badan_lahir_cm` | panjang lahir dalam cm | ❌ belum ada field |
| 16 | `usia_kandungan_minggu` | usia kandungan saat lahir | ❌ belum ada field |
| 17 | `kepemilikan_buku_kia` | punya buku KIA atau tidak (0/1) | ❌ belum ada field |
| 18 | `imunisasi_hb0` | imunisasi Hepatitis B0 (0/1) | ⚠️ ada versi kasar (`imunisasi`: ya/tidak, digabung semua jenis) |
| 19 | `imunisasi_bcg` | imunisasi BCG (0/1) | ⚠️ sama seperti di atas |
| 20 | `imunisasi_dpt_hb_hib_lanjutan` | imunisasi DPT-HB-Hib lanjutan (0/1) | ⚠️ sama seperti di atas |
| 21 | `bblr` | Berat Badan Lahir Rendah, `berat_badan_lahir_g < 2500` (dihitung, bukan diinput) | turunan dari #14 |

**Kesimpulan penting:** tabel `faktor_risiko` PERIANG saat ini (migration
`2026_08_14_023612_create_faktor_risiko_table.php`) cuma punya **5 kolom
kasar** (`riwayat_lahir`, `imunisasi`, `asi_eksklusif`, `sanitasi`,
`pendapatan_keluarga`) — jauh lebih sederhana dari 21 fitur yang dibutuhkan
model. Supaya prediksi akurat (bukan cuma jalan tapi hasilnya asal), form
& skema Faktor Risiko **perlu diperluas** ke field granular sesuai tabel di
atas. Ini bukan pekerjaan kecil — lihat opsi di bagian 5.

Kode nilai pasti untuk kolom kategorikal (`pekerjaan_*`, `pendidikan_*`,
`kepemilikan_jamban`, `sumber_air_minum`, `lokasi_air_minum`,
`pembuangan_limbah_cair`, `pembuangan_tinja`) mengikuti kuesioner SSGI asli
— rujukan lengkap: `disertasi-ita-2022-2024/data/reference/koreksi_DOV.md`
dan `disertasi-ita-2022-2024/scripts/harmonize_map.py`. Perlu diterjemahkan
jadi pilihan dropdown berbahasa manusia di form (bukan angka kode mentah)
saat implementasi.

## 3. Kenapa tidak bisa langsung dipanggil dari Laravel

Model ini adalah objek Python scikit-learn (`GradientBoostingClassifier`)
di dalam file `.pkl` — **PHP/Laravel tidak bisa membaca/menjalankan file
ini langsung**. Tidak ada library PHP yang bisa load pickle scikit-learn.

**Solusi standar (dan yang direkomendasikan di sini):** bikin **microservice
Python kecil** (FastAPI/Flask) yang:
1. Load `champion_model_2022_2024.pkl` sekali saat start.
2. Expose 1 endpoint, mis. `POST /predict` — terima 21 fitur sebagai JSON,
   balikin `{ proba, risiko_tinggi, threshold }`.
3. Laravel (`PrediksiRisikoService::hitung()`) memanggil microservice ini
   lewat HTTP (`Http::post(...)`), lalu memetakan hasilnya ke response
   format yang sudah dipakai frontend (`skor`, `tingkat_risiko`,
   `faktor_kontribusi`, `rekomendasi_umum`, `rekomendasi`) — **kontrak
   endpoint `GET /api/balita/{id}/prediksi` tidak berubah**, jadi frontend
   tidak perlu disentuh.

Ini sama persis dengan rencana "InsForge Model Gateway" yang sudah dicatat
di PRD v9/STATUS.md — bedanya gateway-nya kali ini adalah microservice
sendiri (karena modelnya milik user, bukan model pihak ketiga).

## 4. Yang wajib diperhatikan soal versi

- **`scikit-learn` HARUS versi 1.7.2** persis untuk load pickle ini —
  environment lokal Mac ini defaultnya 1.2.2 (beda versi → error struktur
  internal tree, sudah dibuktikan langsung). Microservice Python nanti
  wajib pin `scikit-learn==1.7.2` di `requirements.txt`.
- Model juga butuh `joblib` (bukan `pickle` biasa) untuk load —
  `joblib.load(path)`, bukan `pickle.load()`.

## 5. Opsi implementasi (perlu keputusan user)

**Opsi A — Fidelitas penuh (21 fitur asli, akurasi sesuai riset
disertasi).** Perluas skema & form Faktor Risiko ke 21 field granular.
Paling akurat, tapi form jadi jauh lebih panjang untuk kader isi
(sekarang 5 pertanyaan → jadi ~17 pertanyaan baru, karena umur & jenis
kelamin sudah ada). Butuh migration baru + redesign
`faktor-risiko-form.tsx` + microservice Python.

**Opsi B — Mapping perkiraan (pertahankan 5 field, isi sisanya dengan nilai
default/median).** Field yang tidak dikumpulkan PERIANG (pekerjaan,
pendidikan ortu, sanitasi rinci, dll) diisi nilai default paling umum dari
data training. Form tidak berubah, tapi akurasi prediksi berkurang
signifikan karena fitur-fitur berbobot SHAP besar (`pekerjaan_ibu`,
`pendidikan_ibu`, dll) jadi konstan/tidak informatif per balita.

**Rekomendasi:** Opsi A untuk hasil yang benar-benar merepresentasikan
riset champion model — ini yang bikin PERIANG "V1.0 Final" secara utuh
sesuai visi disertasi. Opsi B hanya masuk akal sebagai langkah sementara
kalau user ingin demo cepat dulu sebelum commit ke form yang lebih
panjang.

## 6. Ringkasan task yang perlu masuk backlog/PRD

Lihat [backlog.md](../backlog.md) Epic 3 (sudah diperbarui dengan detail
ini) untuk daftar task konkretnya.
