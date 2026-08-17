"""Layanan inferensi model champion PERIANG (prediksi risiko gizi kurang).

Membungkus model Gradient Boosting hasil disertasi (champion_model_2022_2024.pkl)
di balik 1 endpoint HTTP, supaya bisa dipanggil dari backend Laravel yang tidak
bisa menjalankan objek Python/scikit-learn secara langsung. Lihat
docs/champion-model-integration.md di root repo untuk detail arsitektur.
"""

import json
from pathlib import Path
from typing import Optional

import joblib
import pandas as pd
from fastapi import FastAPI
from pydantic import BaseModel

MODEL_DIR = Path(__file__).parent / "model"

_payload = joblib.load(MODEL_DIR / "champion_model_2022_2024.pkl")
_model = _payload["model"]
_feature_cols: list[str] = _payload["feature_cols"]
_threshold: float = _payload["threshold"]
_shap_ranking = _payload.get("shap_ranking", [])

with open(MODEL_DIR / "feature_medians.json") as f:
    _medians: dict[str, float] = json.load(f)

app = FastAPI(title="PERIANG ML Service", version="1.0.0")


class FaktorRisikoInput(BaseModel):
    # Diisi otomatis dari data balita (bukan form faktor risiko).
    jenis_kelamin: Optional[float] = None  # 0=Laki-laki, 1=Perempuan
    umur_bulan: Optional[float] = None
    berat_badan_lahir_g: Optional[float] = None
    panjang_badan_lahir_cm: Optional[float] = None

    # Diisi dari form Faktor Risiko (nilai None = belum diisi, akan diimputasi).
    jumlah_art: Optional[float] = None
    jumlah_balita_rt: Optional[float] = None
    pekerjaan_ayah: Optional[float] = None
    pekerjaan_ibu: Optional[float] = None
    pendidikan_ayah: Optional[float] = None
    pendidikan_ibu: Optional[float] = None
    kepemilikan_jamban: Optional[float] = None
    lokasi_air_minum: Optional[float] = None
    pembuangan_limbah_cair: Optional[float] = None
    pembuangan_tinja: Optional[float] = None
    sumber_air_minum: Optional[float] = None
    usia_kandungan_minggu: Optional[float] = None
    kepemilikan_buku_kia: Optional[float] = None
    imunisasi_hb0: Optional[float] = None
    imunisasi_bcg: Optional[float] = None
    imunisasi_dpt_hb_hib_lanjutan: Optional[float] = None


class PrediksiOutput(BaseModel):
    proba: float
    threshold: float
    risiko_tinggi: bool
    fitur_diimputasi: list[str]
    top_prediktor: list[dict]


@app.get("/health")
def health():
    return {"status": "ok", "model": _payload.get("model_label"), "n_features": len(_feature_cols)}


@app.post("/predict", response_model=PrediksiOutput)
def predict(payload: FaktorRisikoInput):
    data = payload.model_dump()

    # BBLR dihitung dari berat lahir (standar WHO <2500g), bukan input langsung.
    berat = data.get("berat_badan_lahir_g")
    data["bblr"] = 1.0 if (berat is not None and berat < 2500) else 0.0

    fitur_diimputasi = []
    baris = {}
    for kolom in _feature_cols:
        nilai = data.get(kolom)
        if nilai is None:
            nilai = _medians.get(kolom, 0.0)
            fitur_diimputasi.append(kolom)
        baris[kolom] = nilai

    X = pd.DataFrame([[baris[c] for c in _feature_cols]], columns=_feature_cols).astype(float)
    proba = float(_model.predict_proba(X)[:, 1][0])

    return PrediksiOutput(
        proba=proba,
        threshold=_threshold,
        risiko_tinggi=proba >= _threshold,
        fitur_diimputasi=fitur_diimputasi,
        top_prediktor=_shap_ranking[:5],
    )
