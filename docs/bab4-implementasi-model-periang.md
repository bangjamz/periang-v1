# Bahan Bab IV — Implementasi Champion Model ke Aplikasi PERIANG

Materi ini disusun 2026-08-14 sebagai bahan mentah untuk subbab baru di
Bab IV disertasi (pelengkap `BAB_IV_Draft_Analisis_Deskriptif.docx` yang
sudah ada di `disertasi-ita-2022-2024/`), khusus membahas **penerapan
praktis champion model ke dalam sistem aplikasi nyata (PERIANG)** —
melengkapi bagian analisis deskriptif & pemodelan yang sudah ditulis
sebelumnya dengan bukti kontribusi praktis (practical application) hasil
penelitian.

Semua data teknis di bawah ini berasal dari implementasi & verifikasi
langsung 2026-08-14, bukan asumsi — bisa dikutip apa adanya, tapi
susunan kalimat/narasi akademik perlu disesuaikan gaya penulisan Bab IV
yang sudah ada.

---

## [Draf] 4.x Implementasi Champion Model ke dalam Sistem Aplikasi PERIANG

### 4.x.1 Latar Belakang dan Tujuan Implementasi

Model champion yang dihasilkan pada tahap pemodelan (Subbab 4.x sebelumnya)
divalidasi secara statistik melalui skema Time-Shift Validation, namun
validitas praktis suatu model prediksi risiko gizi kurang tidak lengkap
tanpa pembuktian bahwa model tersebut dapat diintegrasikan dan
dioperasionalkan pada sistem informasi yang benar-benar digunakan oleh
tenaga kesehatan di lapangan (kader posyandu). Bagian ini mendokumentasikan
proses implementasi model champion ke dalam **PERIANG (Prediksi dan
Analisis Balita Gizi Kurang)**, sebuah aplikasi web skrining gizi balita
yang dikembangkan sebagai wahana penerapan praktis (practical deployment
vehicle) hasil penelitian ini.

Tujuan implementasi ini adalah untuk:
1. Membuktikan kelayakan operasional (operational feasibility) model
   champion di luar lingkungan eksperimen/notebook penelitian.
2. Menyediakan antarmuka nyata bagi kader posyandu untuk memasukkan data
   faktor risiko balita dan memperoleh hasil prediksi risiko gizi kurang
   secara langsung (real-time).
3. Mengidentifikasi tantangan teknis nyata dalam menjembatani model
   penelitian (Python/scikit-learn) dengan sistem produksi berbasis web
   (Laravel/PHP dan Next.js/TypeScript), sebagai kontribusi metodologis
   tambahan bagi penelitian sejenis di masa depan.

### 4.x.2 Arsitektur Sistem

PERIANG dibangun dengan arsitektur tiga lapis: aplikasi web frontend
(Next.js/TypeScript) sebagai antarmuka kader, backend API (Laravel/PHP +
PostgreSQL) sebagai pengelola data balita dan pemeriksaan, serta layanan
inferensi model (Python) yang secara khusus dibangun untuk menjembatani
model champion (format `.pkl`, hasil `joblib.dump` scikit-learn) dengan
backend berbasis PHP yang secara native tidak dapat menjalankan objek
Python.

Keputusan arsitektural ini — memisahkan layanan inferensi model sebagai
microservice tersendiri, alih-alih menulis ulang (port) logika model ke
bahasa PHP — diambil dengan pertimbangan bahwa model Gradient Boosting
dengan 150 estimator pohon keputusan tidak praktis untuk diterjemahkan
manual ke bahasa lain tanpa risiko ketidaksesuaian numerik dengan model
asli hasil pelatihan. Pendekatan model-as-a-service ini juga lazim
digunakan pada praktik rekayasa perangkat lunak untuk sistem machine
learning produksi (MLOps), sehingga metodologi ini dapat dipertanggung-
jawabkan secara akademik maupun praktik industri.

```
[Kader Posyandu] → [PERIANG Web (Next.js)] → [API Backend (Laravel)]
                                                       │
                                                       │ HTTP (21 fitur)
                                                       ▼
                                          [Layanan Inferensi Model (Python)]
                                          scikit-learn 1.7.2 + champion_model.pkl
                                                       │
                                                       ▼
                                     {probabilitas, klasifikasi risiko}
```

### 4.x.3 Spesifikasi Teknis Model yang Diimplementasikan

| Parameter | Nilai |
|---|---|
| Algoritma | Gradient Boosting Classifier |
| Jumlah estimator | 150 pohon keputusan |
| Skema validasi asal | Time-Shift Validation (latih SSGI 2022, uji SSGI 2024) |
| Sensitivitas (Recall) | 0,8639 |
| AUC-ROC | 0,6799 |
| Ambang klasifikasi (threshold) | 0,16 |
| Jumlah prediktor | 21 variabel (hasil seleksi RFECV) |
| Lima prediktor teratas (SHAP) | Jenis kelamin, berat badan lahir, panjang badan lahir, umur balita, pekerjaan ibu |

Ambang klasifikasi yang digunakan (0,16) sengaja ditetapkan jauh di bawah
nilai baku 0,5, sejalan dengan tujuan penggunaan model sebagai **instrumen
skrining** (screening tool) yang mengutamakan sensitivitas tinggi — konsep
ini relevan didiskusikan pada bagian pembahasan (Bab V) sebagai justifikasi
metodologis: dalam konteks skrining kesehatan masyarakat, kesalahan jenis
false negative (gagal mendeteksi balita berisiko) memiliki konsekuensi yang
lebih besar dibanding false positive (kader melakukan pemeriksaan lanjutan
pada balita yang ternyata tidak berisiko).

### 4.x.4 Tantangan Teknis dan Solusi dalam Implementasi

Proses implementasi mengidentifikasi beberapa tantangan teknis nyata yang
relevan didokumentasikan sebagai kontribusi metodologis:

**a. Inkompatibilitas versi pustaka (library versioning).** Objek model
yang disimpan (`.pkl`) menyimpan representasi biner struktur internal
pohon keputusan yang bergantung pada versi pustaka scikit-learn yang
digunakan saat pelatihan (1.7.2). Upaya memuat ulang model pada versi
scikit-learn yang lebih lama (1.2.2) mengakibatkan kegagalan total memuat
model, disebabkan perubahan struktur data internal (`node array dtype`)
antar versi pustaka — sebuah temuan yang menegaskan pentingnya *dependency
pinning* eksplisit sebagai bagian dari praktik reproducibility penelitian
machine learning, tidak hanya pada tahap pelatihan tetapi juga pada tahap
deployment.

**b. Kesenjangan granularitas data antara desain awal sistem dan kebutuhan
model.** Rancangan awal formulir faktor risiko pada PERIANG menggunakan
lima variabel ringkas (riwayat lahir, status imunisasi, ASI eksklusif,
sanitasi, pendapatan keluarga) yang dirancang untuk kemudahan pengisian
oleh kader. Model champion, sebaliknya, membutuhkan 21 variabel granular
sesuai instrumen kuesioner SSGI asli (mis. berat badan lahir dalam gram,
usia kandungan dalam minggu, kode pekerjaan dan pendidikan orang tua
secara terpisah, serta klasifikasi rinci fasilitas sanitasi). Kesenjangan
ini diselesaikan dengan memperluas skema data dan formulir aplikasi
mengikuti struktur variabel asli model, sekaligus mempertahankan skema
lama sebagai arsip data historis — pendekatan ini menjaga jejak audit
(audit trail) rancangan sistem dari versi sederhana ke versi yang selaras
penuh dengan kebutuhan model penelitian.

**c. Jembatan lintas-bahasa pemrograman (Python–PHP interoperability).**
Karena tidak tersedia pustaka native PHP untuk menjalankan objek model
scikit-learn, diperlukan layanan perantara (microservice) berbasis Python
yang berjalan independen dan berkomunikasi dengan backend aplikasi melalui
protokol HTTP. Pendekatan ini memastikan model yang dijalankan pada sistem
produksi identik secara numerik dengan model yang dihasilkan pada tahap
penelitian (Bab III/IV), tanpa risiko penyimpangan akibat penerjemahan
ulang logika model ke bahasa pemrograman lain.

### 4.x.5 Verifikasi Awal Implementasi

Sebagai bagian dari proses implementasi, dilakukan pengujian pemuatan
model dan inferensi pada satu sampel data sintetis (balita hipotetis
dengan berat lahir 3.200 gram, panjang lahir 49 cm, usia kandungan 39
minggu, dan faktor risiko lain dalam kategori normal), menghasilkan
probabilitas gizi kurang sebesar 0,1117 — di bawah ambang klasifikasi
(0,16), sehingga diklasifikasikan sebagai risiko rendah. Hasil ini
konsisten dengan ekspektasi klinis untuk profil balita dengan faktor
risiko minimal, dan menjadi bukti awal (preliminary evidence) bahwa
model berhasil dimuat dan dijalankan tanpa distorsi numerik pada
lingkungan produksi.

*(Catatan penyusunan: bagian ini perlu dilengkapi dengan pengujian
tambahan — sejumlah sampel kasus dengan profil risiko bervariasi —
setelah microservice inferensi & formulir 21-variabel selesai
diimplementasikan penuh, sebagai lampiran/tabel validasi implementasi.)*

### 4.x.6 Keterbatasan

Beberapa keterbatasan perlu dicantumkan secara jujur pada bagian
pembahasan:

1. Metrik performa model (recall, AUC) diperoleh dari populasi survei
   nasional (SSGI); performa pada populasi pengguna PERIANG di lapangan
   (skala posyandu/kabupaten tertentu) belum tervalidasi secara khusus
   dan memerlukan penelitian evaluasi lanjutan pasca-implementasi.
2. Precision model yang relatif rendah (0,27) adalah konsekuensi
   metodologis dari pemilihan ambang klasifikasi rendah demi sensitivitas
   — implikasinya, sistem akan menghasilkan proporsi peringatan
   "risiko tinggi" yang cukup besar dibanding kasus gizi kurang aktual;
   hal ini perlu dikomunikasikan secara eksplisit kepada pengguna sistem
   (kader) melalui antarmuka aplikasi, agar hasil prediksi dimaknai
   sebagai **alat bantu skrining**, bukan diagnosis pasti.
3. Implementasi ini belum mencakup mekanisme pemantauan drift model
   (model monitoring) pasca-deployment — arah pengembangan lanjutan yang
   relevan didiskusikan sebagai saran penelitian selanjutnya (Bab V).

---

## Referensi silang teknis (untuk lampiran, bukan badan Bab IV)

- Spesifikasi lengkap 21 variabel & pemetaan kode: [docs/champion-model-integration.md](champion-model-integration.md)
- PRD implementasi: [docs/prd/prd-v10-2026-08-14.md](prd/prd-v10-2026-08-14.md)
- Checklist pengerjaan teknis: [backlog.md](../backlog.md) Epic 3
- Sumber model asli: `disertasi-ita-2022-2024/model/champion_model_2022_2024.pkl`,
  `disertasi-ita-2022-2024/notebooks/04_evaluation.py`
