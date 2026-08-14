<?php

namespace App\Services;

use App\Enums\StatusGizi;
use App\Models\FaktorRisiko;

class PrediksiRisikoService
{
    private const SKOR_MAKSIMAL = 11;

    /**
     * Rekomendasi tindakan umum menurut tingkat risiko keseluruhan, ditampilkan
     * di atas rekomendasi per-faktor. Selaras dengan frontend (prediksi-risiko.ts).
     */
    private const REKOMENDASI_UMUM = [
        'rendah' => 'Risiko rendah. Lanjutkan pemeriksaan rutin bulanan ke posyandu untuk memantau tumbuh kembang balita.',
        'sedang' => 'Risiko sedang. Tingkatkan frekuensi pemantauan dan segera perbaiki faktor risiko yang teridentifikasi.',
        'tinggi' => 'Risiko tinggi. Segera rujuk balita ke tenaga kesehatan (Puskesmas/dokter) untuk pemeriksaan dan penanganan lebih lanjut.',
    ];

    /**
     * Placeholder: skor risiko sederhana berbasis bobot per faktor, sebagai
     * pengganti model AI (InsForge/OpenRouter) yang akan dipanggil nanti.
     *
     * @return array{
     *     skor: int,
     *     skor_maksimal: int,
     *     tingkat_risiko: string,
     *     faktor_kontribusi: string[],
     *     rekomendasi_umum: string,
     *     rekomendasi: string[],
     * }
     */
    public function hitung(FaktorRisiko $faktor, ?StatusGizi $statusGiziTerakhir): array
    {
        $skor = 0;
        $faktorKontribusi = [];
        $rekomendasi = [];

        if ($faktor->riwayat_lahir === 'prematur') {
            $skor += 2;
            $faktorKontribusi[] = 'Riwayat lahir prematur';
        } elseif ($faktor->riwayat_lahir === 'berat_lahir_rendah') {
            $skor += 2;
            $faktorKontribusi[] = 'Riwayat berat lahir rendah';
        }

        if ($faktor->imunisasi === 'tidak') {
            $skor += 2;
            $faktorKontribusi[] = 'Imunisasi belum lengkap';
            $rekomendasi[] = 'Lengkapi imunisasi dasar sesuai jadwal di posyandu.';
        }

        if ($faktor->asi_eksklusif === 'tidak') {
            $skor += 1;
            $faktorKontribusi[] = 'Tidak mendapat ASI eksklusif';
            $rekomendasi[] = 'Konsultasikan pemberian ASI/nutrisi tambahan ke tenaga kesehatan.';
        }

        if ($faktor->sanitasi === 'kurang_baik') {
            $skor += 2;
            $faktorKontribusi[] = 'Sanitasi lingkungan kurang baik';
            $rekomendasi[] = 'Tingkatkan akses air bersih dan sanitasi di rumah.';
        }

        if ($faktor->pendapatan_keluarga === 'rendah') {
            $skor += 1;
            $faktorKontribusi[] = 'Pendapatan keluarga rendah';
            $rekomendasi[] = 'Hubungkan keluarga dengan program bantuan gizi/sosial setempat.';
        }

        if ($statusGiziTerakhir === StatusGizi::Buruk) {
            $skor += 3;
            $faktorKontribusi[] = 'Status gizi terakhir: gizi buruk';
            $rekomendasi[] = 'Segera rujuk ke Puskesmas/tenaga kesehatan.';
        } elseif ($statusGiziTerakhir === StatusGizi::Kurang) {
            $skor += 2;
            $faktorKontribusi[] = 'Status gizi terakhir: gizi kurang';
            $rekomendasi[] = 'Pantau berat badan lebih rutin tiap bulan.';
        } elseif ($statusGiziTerakhir === StatusGizi::Pendek) {
            $skor += 2;
            $faktorKontribusi[] = 'Status gizi terakhir: stunting (pendek)';
            $rekomendasi[] = 'Konsultasikan risiko stunting ke tenaga kesehatan.';
        }

        $tingkatRisiko = match (true) {
            $skor >= 7 => 'tinggi',
            $skor >= 3 => 'sedang',
            default => 'rendah',
        };

        if (empty($rekomendasi)) {
            $rekomendasi[] = 'Pertahankan pola asuh dan pemeriksaan rutin ke posyandu.';
        }

        return [
            'skor' => $skor,
            'skor_maksimal' => self::SKOR_MAKSIMAL,
            'tingkat_risiko' => $tingkatRisiko,
            'faktor_kontribusi' => $faktorKontribusi,
            'rekomendasi_umum' => self::REKOMENDASI_UMUM[$tingkatRisiko],
            'rekomendasi' => $rekomendasi,
        ];
    }
}
