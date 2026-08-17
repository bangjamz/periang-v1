# PERIANG ML Service

Microservice Python (FastAPI) yang meng-host champion model prediksi
risiko gizi kurang (Gradient Boosting, hasil disertasi Ropitasari SSGI
2022+2024). Dipanggil dari backend Laravel (`PrediksiRisikoService`) lewat
HTTP — lihat `docs/champion-model-integration.md` di root repo untuk
arsitektur lengkap.

## Menjalankan lokal

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --port 8020
```

**Penting:** `scikit-learn` harus persis versi `1.7.2` (dipin di
`requirements.txt`) — versi lain gagal memuat `model/champion_model_2022_2024.pkl`
(struktur internal tree tidak kompatibel antar versi scikit-learn).

Set `ML_SERVICE_URL` di `.env` backend Laravel supaya mengarah ke service
ini (default `http://127.0.0.1:8020`).

## Endpoint

- `GET /health` — cek service & model termuat.
- `POST /predict` — terima 21 fitur (semua opsional kecuali yang berasal
  dari data balita), balikin `{proba, threshold, risiko_tinggi,
  fitur_diimputasi, top_prediktor}`. Field yang tidak diisi diimputasi
  otomatis pakai nilai median dari data training (`model/feature_medians.json`).
