<?php

namespace App\Support;

class StandarPertumbuhanWho
{
    /**
     * Median berat (kg) & tinggi (cm) menurut standar pertumbuhan WHO untuk
     * balita usia 0-60 bulan, pada titik umur acuan. Nilai di antara titik
     * dihitung dengan interpolasi linear lewat interpolasi().
     */
    public const BERAT_MEDIAN_KG = [
        'L' => [0 => 3.3, 6 => 7.9, 12 => 9.6, 24 => 12.2, 36 => 14.3, 48 => 16.3, 60 => 18.3],
        'P' => [0 => 3.2, 6 => 7.3, 12 => 8.9, 24 => 11.5, 36 => 13.9, 48 => 16.1, 60 => 18.2],
    ];

    public const TINGGI_MEDIAN_CM = [
        'L' => [0 => 49.9, 6 => 67.6, 12 => 75.7, 24 => 87.1, 36 => 96.1, 48 => 103.3, 60 => 110.0],
        'P' => [0 => 49.1, 6 => 65.7, 12 => 74.0, 24 => 85.7, 36 => 95.1, 48 => 102.7, 60 => 109.4],
    ];

    /**
     * Interpolasi linear nilai median pada umur tertentu dari titik acuan.
     *
     * @param  array<int, float>  $titik  Peta umur(bulan) => nilai median, terurut naik.
     */
    public static function interpolasi(array $titik, int $umurBulan): float
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
