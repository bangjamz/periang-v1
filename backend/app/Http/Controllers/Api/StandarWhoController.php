<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\StandarWho;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class StandarWhoController extends Controller
{
    /**
     * Titik standar pertumbuhan WHO (median berat & tinggi per umur bulan)
     * untuk satu jenis kelamin, dipakai sebagai acuan grafik pertumbuhan.
     */
    public function index(Request $request)
    {
        $request->validate([
            'jenis_kelamin' => ['required', Rule::in(['L', 'P'])],
        ], [
            'jenis_kelamin.required' => 'Jenis kelamin wajib diisi.',
            'jenis_kelamin.in' => 'Jenis kelamin tidak valid.',
        ]);

        return StandarWho::query()
            ->where('jenis_kelamin', $request->string('jenis_kelamin'))
            ->orderBy('umur_bulan')
            ->get(['umur_bulan', 'berat_median_kg', 'tinggi_median_cm']);
    }
}
