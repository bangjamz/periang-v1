<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Balita;

class BalitaController extends Controller
{
    /**
     * Daftar balita untuk dipilih saat pemeriksaan status gizi.
     */
    public function index()
    {
        return Balita::query()
            ->orderBy('nama')
            ->get(['id', 'nama', 'jenis_kelamin', 'tanggal_lahir']);
    }
}
