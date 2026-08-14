<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreFaktorRisikoRequest;
use App\Models\Balita;
use App\Models\FaktorRisiko;

class FaktorRisikoController extends Controller
{
    /**
     * Faktor risiko satu balita (satu balita hanya punya satu catatan).
     */
    public function show(Balita $balita)
    {
        $faktorRisiko = FaktorRisiko::query()->where('balita_id', $balita->id)->first();

        if (! $faktorRisiko) {
            return response()->json(['message' => 'Faktor risiko belum diisi untuk balita ini.'], 404);
        }

        return $faktorRisiko;
    }

    /**
     * Simpan atau perbarui faktor risiko balita (upsert per balita).
     */
    public function store(StoreFaktorRisikoRequest $request, Balita $balita)
    {
        $faktorRisiko = FaktorRisiko::updateOrCreate(
            ['balita_id' => $balita->id],
            $request->validated(),
        );

        return response()->json($faktorRisiko, 200);
    }

    /**
     * Hapus faktor risiko balita.
     */
    public function destroy(Balita $balita)
    {
        FaktorRisiko::query()->where('balita_id', $balita->id)->delete();

        return response()->noContent();
    }
}
