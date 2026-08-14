<?php

namespace App\Http\Controllers\Api;

use App\Enums\StatusGizi;
use App\Http\Controllers\Controller;
use App\Models\Balita;
use App\Models\FaktorRisiko;
use App\Models\Pemeriksaan;
use App\Services\PrediksiRisikoService;

class PrediksiRisikoController extends Controller
{
    public function __construct(private PrediksiRisikoService $prediksiRisikoService) {}

    /**
     * Hitung prediksi risiko gizi kurang balita dari faktor risiko yang
     * tersimpan dan status gizi pemeriksaan terakhirnya.
     */
    public function show(Balita $balita)
    {
        $faktorRisiko = FaktorRisiko::query()->where('balita_id', $balita->id)->first();

        if (! $faktorRisiko) {
            return response()->json(['message' => 'Faktor risiko belum diisi untuk balita ini.'], 404);
        }

        $statusGiziMentah = Pemeriksaan::query()
            ->where('balita_id', $balita->id)
            ->orderByDesc('tanggal_cek')
            ->orderByDesc('created_at')
            ->value('status_gizi');

        $statusGiziTerakhir = match (true) {
            $statusGiziMentah instanceof StatusGizi => $statusGiziMentah,
            is_string($statusGiziMentah) => StatusGizi::from($statusGiziMentah),
            default => null,
        };

        return $this->prediksiRisikoService->hitung($faktorRisiko, $statusGiziTerakhir);
    }
}
