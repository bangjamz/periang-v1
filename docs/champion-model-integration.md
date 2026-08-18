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
| 1 | `jenis_kelamin` | 0=Laki-laki, 1=Perempuan | ✅ `balita.jenis_kelamin` (diremap L/P→0/1 di `PrediksiRisikoService`) |
| 2 | `umur_bulan` | umur balita saat diperiksa | ✅ dihitung dari `balita.tanggal_lahir` |
| 3 | `jumlah_art` | jumlah anggota rumah tangga | ✅ `faktor_risiko.jumlah_art` (input angka) |
| 4 | `jumlah_balita_rt` | jumlah balita dalam 1 rumah tangga | ✅ `faktor_risiko.jumlah_balita_rt` (input angka) |
| 5 | `pekerjaan_ayah` | kode SSGI pekerjaan ayah | ✅ dropdown berlabel (8 opsi, lihat bagian 2a) |
| 6 | `pekerjaan_ibu` | kode SSGI pekerjaan ibu | ✅ dropdown berlabel (8 opsi) |
| 7 | `pendidikan_ayah` | kode SSGI pendidikan ayah | ✅ dropdown berlabel (6 opsi) |
| 8 | `pendidikan_ibu` | kode SSGI pendidikan ibu | ✅ dropdown berlabel (6 opsi) |
| 9 | `kepemilikan_jamban` | kode SSGI jenis jamban | ⚠️ input kode mentah — sumber pasti belum ditemukan |
| 10 | `lokasi_air_minum` | kode SSGI lokasi sumber air | ⚠️ input kode mentah — sumber pasti belum ditemukan |
| 11 | `pembuangan_limbah_cair` | kode SSGI | ⚠️ input kode mentah — sumber pasti belum ditemukan |
| 12 | `pembuangan_tinja` | kode SSGI | ⚠️ input kode mentah — sumber pasti belum ditemukan |
| 13 | `sumber_air_minum` | kode SSGI jenis sumber air | ✅ dropdown berlabel (14 opsi, cocok persis dgn data) |
| 14 | `berat_badan_lahir_g` | berat lahir dalam **gram** | ✅ `balita.berat_lahir` (kg × 1000) |
| 15 | `panjang_badan_lahir_cm` | panjang lahir dalam cm | ✅ `balita.tinggi_lahir` |
| 16 | `usia_kandungan_minggu` | usia kandungan saat lahir | ✅ `faktor_risiko.usia_kandungan_minggu` (input angka) |
| 17 | `kepemilikan_buku_kia` | status buku KIA (kode multi-level, **bukan** 0/1) | ✅ dropdown berlabel (4 opsi) |
| 18 | `imunisasi_hb0` | status imunisasi Hepatitis B0 (kode multi-level, **bukan** 0/1) | ✅ dropdown berlabel (6 opsi) |
| 19 | `imunisasi_bcg` | status imunisasi BCG (kode multi-level, **bukan** 0/1) | ✅ dropdown berlabel (6 opsi) |
| 20 | `imunisasi_dpt_hb_hib_lanjutan` | status imunisasi DPT-HB-Hib lanjutan (kode multi-level, **bukan** 0/1) | ✅ dropdown berlabel (6 opsi) |
| 21 | `bblr` | Berat Badan Lahir Rendah, `berat_badan_lahir_g < 2500` (dihitung, bukan diinput) | turunan dari #14 |

> **Koreksi 2026-08-18**: dokumen versi awal salah menandai #17-20 sebagai
> biner (0/1) — data asli ternyata kode SSGI multi-level (mis. imunisasi:
> 1=ada catatan tanggal, 2=ada catatan tanpa tanggal, 3=berdasar ingatan,
> 4=tidak, 7=belum waktunya, 8=tidak tahu). Dikoreksi setelah cross-check ke
> `Kuesioner SSGI 2024.md` (lihat bagian 2a).

## 2a. Kode SSGI yang sudah dikonfirmasi (2026-08-18)

User memberikan 3 dokumen SSGI resmi (`Kuesioner SSGI 2024.pdf/md`,
`PEDOMAN ANALISIS DATA SSGI 2024.pdf`, `SSGI Dalam Angka 2024.md`), lokasi:
`~/Downloads/ClaudeOS/Disertasi/Ropitasari/Data/SSGI/`. Hasil cross-check:

- **Imunisasi (HB0/BCG/DPT-HB-Hib Lanjutan)** — ditemukan persis di
  `Kuesioner SSGI 2024.md` Blok X (P1002, kolom "Status & Sumber
  Informasi"): `1=Ya diimunisasi (ada tanggal)`, `2=Ya diimunisasi (tanpa
  tanggal)`, `3=Ya (berdasarkan ingatan)`, `4=Tidak imunisasi`,
  `7=Belum waktunya diberikan`, `8=Tidak Tahu`. **Cocok persis** dengan
  nilai unik yang ada di data training (`[1,2,3,7,8]`/`[1,2,3,8]`).
- **Kepemilikan Buku KIA** — `Kuesioner SSGI 2024.md` Blok X (P1001):
  `1=Terisi lengkap`, `2=Terisi tidak lengkap`, `3=Ada tidak terisi`,
  `4=Tidak punya`.
- **Sumber Air Minum** — `SSGI Dalam Angka 2024.md` Tabel 5.174 (14
  kategori resmi: Ledeng Meteran, Ledeng Eceran, Keran Umum, Hidran Umum,
  Terminal Air, PAH, Sumur Bor/Pompa, Sumur Terlindung, Mata Air
  Terlindung, Air Kemasan Bermerk, Air Isi Ulang, Sumur Tak Terlindungi,
  Mata Air Tak Terlindungi, Air Permukaan). **Cocok persis** — 14 kategori
  vs 14 nilai unik di data.
- **Pendidikan & Pekerjaan (ayah/ibu)** — **tidak** ditemukan di
  instrumen kuesioner mentah (dokumen yang diberikan hanya berisi
  kuesioner individu balita, Blok VIII-XVI; pertanyaan pendidikan/pekerjaan
  orang tua ada di kuesioner rumah tangga terpisah yang tidak tersedia).
  Label yang dipakai sekarang **diturunkan dari kategori agregat publikasi**
  `SSGI Dalam Angka 2024.md` (Pendidikan Ibu: 6 kategori Tidak
  Sekolah→Tamat D1/D2/D3/PT; Pekerjaan KRT: 8 kategori Tidak
  Bekerja→Lainnya) — **kemungkinan kecil urutan/pembagian berbeda** dari
  kode mentah asli. Verifikasi ulang kalau kuesioner rumah tangga resmi
  ditemukan.
- **Kepemilikan jamban, lokasi air minum, pembuangan limbah cair,
  pembuangan tinja** — belum ditemukan sumber yang cukup pasti (dokumen
  yang ada hanya berisi kategori HASIL KLASIFIKASI gabungan seperti "Akses
  Aman/Layak/Belum Layak", bukan kode mentah per pertanyaan) — **masih
  input kode angka mentah** di form, bukan dropdown.

Implementasi dropdown ada di `frontend/src/components/faktor-risiko-form.tsx`
(konstanta `OPSI_PENDIDIKAN`, `OPSI_PEKERJAAN`, `OPSI_SUMBER_AIR`,
`OPSI_STATUS_IMUNISASI`, `OPSI_BUKU_KIA`).

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
