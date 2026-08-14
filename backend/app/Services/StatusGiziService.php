<?php

namespace App\Services;

use App\Enums\StatusGizi;
use App\Support\StandarPertumbuhanWho;

class StatusGiziService
{
    /**
     * Menentukan status gizi balita dengan klasifikasi persen-median:
     * Gomez untuk berat badan menurut umur, Waterlow untuk tinggi badan
     * menurut umur (stunting). Berat diprioritaskan atas tinggi karena
     * mengindikasikan kondisi akut yang lebih mendesak.
     */
    public function tentukan(int $umurBulan, float $beratKg, float $tinggiCm, string $jenisKelamin): array
    {
        $umurBulan = max(0, min(60, $umurBulan));

        $beratMedian = StandarPertumbuhanWho::interpolasi(StandarPertumbuhanWho::BERAT_MEDIAN_KG[$jenisKelamin], $umurBulan);
        $tinggiMedian = StandarPertumbuhanWho::interpolasi(StandarPertumbuhanWho::TINGGI_MEDIAN_CM[$jenisKelamin], $umurBulan);

        $rasioBerat = $beratKg / $beratMedian;
        $rasioTinggi = $tinggiCm / $tinggiMedian;

        $status = match (true) {
            $rasioBerat < 0.75 => StatusGizi::Buruk,
            $rasioTinggi < 0.90 => StatusGizi::Pendek,
            $rasioBerat < 0.90 => StatusGizi::Kurang,
            default => StatusGizi::Normal,
        };

        return [
            'status' => $status,
            'berat_median_kg' => round($beratMedian, 2),
            'tinggi_median_cm' => round($tinggiMedian, 2),
            'rasio_berat' => round($rasioBerat, 4),
            'rasio_tinggi' => round($rasioTinggi, 4),
        ];
    }
}
