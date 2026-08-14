<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreBalitaRequest;
use App\Http\Requests\UpdateBalitaRequest;
use App\Models\Balita;
use App\Models\User;
use Illuminate\Http\Request;

class BalitaController extends Controller
{
    /**
     * Daftar balita, opsional dicari lewat ?q= (nama/posyandu).
     */
    public function index(Request $request)
    {
        return Balita::query()
            ->when(
                $request->string('q')->trim()->toString(),
                function ($query, $q) {
                    $like = '%'.mb_strtolower($q).'%';
                    $query->where(function ($query) use ($like) {
                        $query->whereRaw('LOWER(nama) LIKE ?', [$like])
                            ->orWhereRaw('LOWER(posyandu) LIKE ?', [$like]);
                    });
                },
            )
            ->orderBy('nama')
            ->get();
    }

    /**
     * Detail satu balita.
     */
    public function show(Balita $balita)
    {
        return $balita;
    }

    /**
     * Daftarkan balita baru.
     */
    public function store(StoreBalitaRequest $request)
    {
        $data = $request->validated();

        // Belum ada login (Fase 3); pakai kader pertama sebagai pencatat sementara.
        $userId = $request->user()?->id ?? User::query()->value('id');

        $balita = Balita::create([...$data, 'user_id' => $userId]);

        return response()->json($balita, 201);
    }

    /**
     * Perbarui data balita.
     */
    public function update(UpdateBalitaRequest $request, Balita $balita)
    {
        $balita->update($request->validated());

        return $balita;
    }

    /**
     * Hapus balita beserta riwayat pemeriksaannya (cascade lewat foreign key).
     */
    public function destroy(Balita $balita)
    {
        $balita->delete();

        return response()->noContent();
    }
}
