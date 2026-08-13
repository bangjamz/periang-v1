<?php

namespace App\Services;

use App\Enums\StatusGizi;

class StatusGiziService
{
    /**
     * Median berat (kg) & tinggi (cm) menurut standar pertumbuhan WHO untuk
     * balita usia 0-60 bulan, pada titik umur acuan. Nilai di antara titik
     * dihitung dengan interpolasi linear.
     */
    private const BERAT_MEDIAN_KG = [
        'L' => [0 => 3.3, 6 => 7.9, 12 => 9.6, 24 => 12.2, 36 => 14.3, 48 => 16.3, 60 => 18.3],
        'P' => [0 => 3.2, 6 => 7.3, 12 => 8.9, 24 => 11.5, 36 => 13.9, 48 => 16.1, 60 => 18.2],
    ];

    private const TINGGI_MEDIAN_CM = [
        'L' => [0 => 49.9, 6 => 67.6, 12 => 75.7, 24 => 87.1, 36 => 96.1, 48 => 103.3, 60 => 110.0],
        'P' => [0 => 49.1, 6 => 65.7, 12 => 74.0, 24 => 85.7, 36 => 95.1, 48 => 102.7, 60 => 109.4],
    ];

    /**
     * Menentukan status gizi balita dengan klasifikasi persen-median:
     * Gomez untuk berat badan menurut umur, Waterlow untuk tinggi badan
     * menurut umur (stunting). Berat diprioritaskan atas tinggi karena
     * mengindikasikan kondisi akut yang lebih mendesak.
     */
    public function tentukan(int $umurBulan, float $beratKg, float $tinggiCm, string $jenisKelamin): array
    {
        $umurBulan = max(0, min(60, $umurBulan));

        $beratMedian = $this->interpolasi(self::BERAT_MEDIAN_KG[$jenisKelamin], $umurBulan);
        $tinggiMedian = $this->interpolasi(self::TINGGI_MEDIAN_CM[$jenisKelamin], $umurBulan);

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

    /**
     * @param  array<int, float>  $titik  Peta umur(bulan) => nilai median, terurut naik.
     */
    private function interpolasi(array $titik, int $umurBulan): float
    {
        $umurTitik = array_keys($titik);

        foreach ($umurTitik as $i => $umurBawah) {
            if ($umurBulan <= $umurBawah) {
                return $titik[$umurBawah];
            }

            $umurAtas = $umurTitik[$i + 1] ?? null;
            if ($umurAtas !== null && $umurBulan < $umurAtas) {
                $nilaiBawah = $titik[$umurBawah];
                $nilaiAtas = $titik[$umurAtas];
                $proporsi = ($umurBulan - $umurBawah) / ($umurAtas - $umurBawah);

                return $nilaiBawah + ($nilaiAtas - $nilaiBawah) * $proporsi;
            }
        }

        return end($titik);
    }
}
