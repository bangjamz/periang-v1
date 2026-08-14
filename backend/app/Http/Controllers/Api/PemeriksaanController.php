<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StorePemeriksaanRequest;
use App\Http\Requests\UpdatePemeriksaanRequest;
use App\Models\Balita;
use App\Models\Pemeriksaan;
use App\Models\User;
use App\Services\StatusGiziService;
use Carbon\Carbon;
use Illuminate\Http\Request;

class PemeriksaanController extends Controller
{
    public function __construct(private StatusGiziService $statusGiziService) {}

    /**
     * Riwayat pemeriksaan, opsional difilter per balita lewat ?balita_id=.
     */
    public function index(Request $request)
    {
        return Pemeriksaan::query()
            ->with('balita:id,nama,jenis_kelamin')
            ->when(
                $request->integer('balita_id'),
                fn ($query, $balitaId) => $query->where('balita_id', $balitaId),
            )
            ->orderByDesc('tanggal_cek')
            ->orderByDesc('created_at')
            ->get();
    }

    /**
     * Detail satu pemeriksaan.
     */
    public function show(Pemeriksaan $pemeriksaan)
    {
        return $pemeriksaan->load('balita:id,nama,jenis_kelamin');
    }

    /**
     * Hitung status gizi dari data pemeriksaan lalu simpan ke riwayat.
     */
    public function store(StorePemeriksaanRequest $request)
    {
        $data = $request->validated();
        $balita = Balita::findOrFail($data['balita_id']);

        [$umurBulan, $analisis] = $this->analisis($balita, $data);

        // Belum ada login (Fase 3); pakai kader pertama sebagai pencatat sementara.
        $createdBy = $request->user()?->id ?? User::query()->value('id');

        $pemeriksaan = Pemeriksaan::create([
            'balita_id' => $balita->id,
            'umur_bulan' => $umurBulan,
            'berat_kg' => $data['berat_kg'],
            'tinggi_cm' => $data['tinggi_cm'],
            'status_gizi' => $analisis['status'],
            'catatan' => $data['catatan'] ?? null,
            'tanggal_cek' => $data['tanggal_cek'],
            'created_by' => $createdBy,
        ]);

        return response()->json([
            'pemeriksaan' => $pemeriksaan,
            'berat_median_kg' => $analisis['berat_median_kg'],
            'tinggi_median_cm' => $analisis['tinggi_median_cm'],
            'rasio_berat' => $analisis['rasio_berat'],
            'rasio_tinggi' => $analisis['rasio_tinggi'],
        ], 201);
    }

    /**
     * Perbarui data pemeriksaan; status gizi dihitung ulang dari nilai baru.
     */
    public function update(UpdatePemeriksaanRequest $request, Pemeriksaan $pemeriksaan)
    {
        $data = $request->validated();
        $balita = $pemeriksaan->balita;

        [$umurBulan, $analisis] = $this->analisis($balita, $data);

        $pemeriksaan->update([
            'umur_bulan' => $umurBulan,
            'berat_kg' => $data['berat_kg'],
            'tinggi_cm' => $data['tinggi_cm'],
            'status_gizi' => $analisis['status'],
            'catatan' => $data['catatan'] ?? null,
            'tanggal_cek' => $data['tanggal_cek'],
        ]);

        return response()->json([
            'pemeriksaan' => $pemeriksaan,
            'berat_median_kg' => $analisis['berat_median_kg'],
            'tinggi_median_cm' => $analisis['tinggi_median_cm'],
            'rasio_berat' => $analisis['rasio_berat'],
            'rasio_tinggi' => $analisis['rasio_tinggi'],
        ]);
    }

    /**
     * Hapus data pemeriksaan.
     */
    public function destroy(Pemeriksaan $pemeriksaan)
    {
        $pemeriksaan->delete();

        return response()->noContent();
    }

    /**
     * Hitung umur (bulan) dari tanggal lahir balita & jalankan klasifikasi status gizi.
     *
     * @param  array{tanggal_cek: string, berat_kg: float|string, tinggi_cm: float|string}  $data
     * @return array{0: int, 1: array}
     */
    private function analisis(Balita $balita, array $data): array
    {
        $umurBulan = (int) Carbon::parse($balita->tanggal_lahir)
            ->diffInMonths(Carbon::parse($data['tanggal_cek']));

        $analisis = $this->statusGiziService->tentukan(
            $umurBulan,
            (float) $data['berat_kg'],
            (float) $data['tinggi_cm'],
            $balita->jenis_kelamin,
        );

        return [$umurBulan, $analisis];
    }
}
