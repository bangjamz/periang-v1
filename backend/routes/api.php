<?php

use App\Http\Controllers\Api\BalitaController;
use App\Http\Controllers\Api\PemeriksaanController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::get('/balita', [BalitaController::class, 'index']);
Route::get('/pemeriksaan', [PemeriksaanController::class, 'index']);
Route::post('/pemeriksaan', [PemeriksaanController::class, 'store']);
