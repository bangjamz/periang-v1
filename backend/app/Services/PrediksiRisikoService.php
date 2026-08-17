<?php

namespace App\Services;

use App\Enums\StatusGizi;
use App\Models\Balita;
use App\Models\FaktorRisiko;
use Carbon\Carbon;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use RuntimeException;

/**
 * Memanggil microservice ML (ml-service/, FastAPI + champion model Gradient
 * Boosting) untuk menghitung risiko gizi kurang balita dari faktor risiko.
 * Lihat docs/champion-model-integration.md di root repo untuk arsitektur
 * lengkap & alasan kenapa model tidak dipanggil langsung dari PHP.
 */
class PrediksiRisikoService
{
    /**
     * Rekomendasi tindakan umum menurut tingkat risiko, ditampilkan di atas
     * rekomendasi per-faktor. Selaras dengan frontend (prediksi-risiko.ts).
     */
    private const REKOMENDASI_UMUM = [
        'rendah' => 'Risiko rendah. Lanjutkan pemeriksaan rutin bulanan ke posyandu untuk memantau tumbuh kembang balita.',
        'sedang' => 'Risiko sedang. Tingkatkan frekuensi pemantauan dan segera perbaiki faktor risiko yang teridentifikasi.',
        'tinggi' => 'Risiko tinggi. Segera rujuk balita ke tenaga kesehatan (Puskesmas/dokter) untuk pemeriksaan dan penanganan lebih lanjut.',
    ];

    /**
     * @return array{
     *     skor: int,
     *     skor_maksimal: int,
     *     tingkat_risiko: string,
     *     faktor_kontribusi: string[],
     *     rekomendasi_umum: string,
     *     rekomendasi: string[],
     * }
     *
     * @throws RuntimeException kalau microservice ML tidak terjangkau/gagal.
     */
    public function hitung(Balita $balita, FaktorRisiko $faktor, ?StatusGizi $statusGiziTerakhir): array
    {
        $fitur = $this->bangunFitur($balita, $faktor);

        try {
            $response = Http::timeout(5)
                ->baseUrl(config('services.ml.url'))
                ->post('/predict', $fitur);
        } catch (\Illuminate\Http\Client\ConnectionException $e) {
            Log::error('Prediksi risiko ML: microservice tidak terjangkau', [
                'balita_id' => $balita->id,
                'error' => $e->getMessage(),
            ]);

            throw new RuntimeException('Layanan prediksi risiko sedang tidak tersedia. Coba lagi beberapa saat lagi.');
        }

        if ($response->failed()) {
            Log::error('Prediksi risiko ML: microservice gagal', [
                'balita_id' => $balita->id,
                'status' => $response->status(),
                'body' => $response->body(),
            ]);

            throw new RuntimeException('Layanan prediksi risiko sedang tidak tersedia. Coba lagi beberapa saat lagi.');
        }

        $hasil = $response->json();
        $proba = (float) $hasil['proba'];
        $threshold = (float) $hasil['threshold'];

        $tingkatRisiko = match (true) {
            $proba >= $threshold => 'tinggi',
            $proba >= $threshold / 2 => 'sedang',
            default => 'rendah',
        };

        $faktorKontribusi = $this->faktorKontribusi($faktor, $balita, $hasil['fitur_diimputasi'] ?? []);
        $rekomendasi = $this->rekomendasi($faktor, $statusGiziTerakhir);

        return [
            'skor' => (int) round($proba * 100),
            'skor_maksimal' => 100,
            'tingkat_risiko' => $tingkatRisiko,
            'faktor_kontribusi' => $faktorKontribusi,
            'rekomendasi_umum' => self::REKOMENDASI_UMUM[$tingkatRisiko],
            'rekomendasi' => $rekomendasi,
        ];
    }

    /**
     * Susun 21 fitur model dari data balita + faktor risiko. jenis_kelamin,
     * umur_bulan, berat/panjang lahir diambil dari tabel balita (sudah ada
     * sejak awal), sisanya dari faktor_risiko (field baru).
     */
    private function bangunFitur(Balita $balita, FaktorRisiko $faktor): array
    {
        $umurBulan = Carbon::parse($balita->tanggal_lahir)->diffInMonths(Carbon::now());

        return [
            'jenis_kelamin' => $balita->jenis_kelamin === 'P' ? 1 : 0,
            'umur_bulan' => $umurBulan,
            'berat_badan_lahir_g' => $balita->berat_lahir !== null ? (float) $balita->berat_lahir * 1000 : null,
            'panjang_badan_lahir_cm' => $balita->tinggi_lahir !== null ? (float) $balita->tinggi_lahir : null,
            'jumlah_art' => $faktor->jumlah_art,
            'jumlah_balita_rt' => $faktor->jumlah_balita_rt,
            'pekerjaan_ayah' => $faktor->pekerjaan_ayah,
            'pekerjaan_ibu' => $faktor->pekerjaan_ibu,
            'pendidikan_ayah' => $faktor->pendidikan_ayah,
            'pendidikan_ibu' => $faktor->pendidikan_ibu,
            'kepemilikan_jamban' => $faktor->kepemilikan_jamban,
            'lokasi_air_minum' => $faktor->lokasi_air_minum,
            'pembuangan_limbah_cair' => $faktor->pembuangan_limbah_cair,
            'pembuangan_tinja' => $faktor->pembuangan_tinja,
            'sumber_air_minum' => $faktor->sumber_air_minum,
            'usia_kandungan_minggu' => $faktor->usia_kandungan_minggu,
            'kepemilikan_buku_kia' => $faktor->kepemilikan_buku_kia,
            'imunisasi_hb0' => $faktor->imunisasi_hb0,
            'imunisasi_bcg' => $faktor->imunisasi_bcg,
            'imunisasi_dpt_hb_hib_lanjutan' => $faktor->imunisasi_dpt_hb_hib_lanjutan,
        ];
    }

    /**
     * Daftar faktor yang ditampilkan sebagai "berkontribusi" ke pengguna:
     * field granular yang benar-benar diisi (bukan diimputasi) dan berbeda
     * dari kondisi umum, plus penanda berapa banyak fitur penting masih
     * kosong (supaya kader tahu mengisi lebih lengkap = prediksi lebih
     * akurat).
     *
     * @param string[] $fiturDiimputasi
     * @return string[]
     */
    private function faktorKontribusi(FaktorRisiko $faktor, Balita $balita, array $fiturDiimputasi): array
    {
        $daftar = [];

        if ($balita->berat_lahir !== null && (float) $balita->berat_lahir * 1000 < 2500) {
            $daftar[] = 'Berat Badan Lahir Rendah (BBLR, <2500g)';
        }

        if ($faktor->usia_kandungan_minggu !== null && $faktor->usia_kandungan_minggu < 37) {
            $daftar[] = 'Lahir prematur (usia kandungan <37 minggu)';
        }

        $jumlahDiimputasi = count($fiturDiimputasi);
        if ($jumlahDiimputasi > 0) {
            $daftar[] = "{$jumlahDiimputasi} data faktor risiko belum diisi lengkap — prediksi memakai nilai perkiraan, lengkapi form untuk hasil lebih akurat.";
        }

        return $daftar;
    }

    /**
     * @return string[]
     */
    private function rekomendasi(FaktorRisiko $faktor, ?StatusGizi $statusGiziTerakhir): array
    {
        $rekomendasi = [];

        if ($faktor->asi_eksklusif === 'tidak') {
            $rekomendasi[] = 'Konsultasikan pemberian ASI/nutrisi tambahan ke tenaga kesehatan.';
        }

        if ($faktor->sanitasi === 'kurang_baik') {
            $rekomendasi[] = 'Tingkatkan akses air bersih dan sanitasi di rumah.';
        }

        if ($faktor->pendapatan_keluarga === 'rendah') {
            $rekomendasi[] = 'Hubungkan keluarga dengan program bantuan gizi/sosial setempat.';
        }

        if ($statusGiziTerakhir === StatusGizi::Buruk) {
            $rekomendasi[] = 'Segera rujuk ke Puskesmas/tenaga kesehatan.';
        } elseif ($statusGiziTerakhir === StatusGizi::Kurang) {
            $rekomendasi[] = 'Pantau berat badan lebih rutin tiap bulan.';
        } elseif ($statusGiziTerakhir === StatusGizi::Pendek) {
            $rekomendasi[] = 'Konsultasikan risiko stunting ke tenaga kesehatan.';
        }

        if (empty($rekomendasi)) {
            $rekomendasi[] = 'Pertahankan pola asuh dan pemeriksaan rutin ke posyandu.';
        }

        return $rekomendasi;
    }
}
