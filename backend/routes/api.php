<?php

use App\Http\Controllers\Api\BalitaController;
use App\Http\Controllers\Api\FaktorRisikoController;
use App\Http\Controllers\Api\PemeriksaanController;
use App\Http\Controllers\Api\PrediksiRisikoController;
use App\Http\Controllers\Api\StandarWhoController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::get('/balita', [BalitaController::class, 'index']);
Route::post('/balita', [BalitaController::class, 'store']);
Route::get('/balita/{balita}', [BalitaController::class, 'show']);
Route::put('/balita/{balita}', [BalitaController::class, 'update']);
Route::delete('/balita/{balita}', [BalitaController::class, 'destroy']);
Route::get('/balita/{balita}/faktor-risiko', [FaktorRisikoController::class, 'show']);
Route::put('/balita/{balita}/faktor-risiko', [FaktorRisikoController::class, 'store']);
Route::delete('/balita/{balita}/faktor-risiko', [FaktorRisikoController::class, 'destroy']);
Route::get('/balita/{balita}/prediksi', [PrediksiRisikoController::class, 'show']);
Route::get('/pemeriksaan', [PemeriksaanController::class, 'index']);
Route::post('/pemeriksaan', [PemeriksaanController::class, 'store']);
Route::get('/pemeriksaan/{pemeriksaan}', [PemeriksaanController::class, 'show']);
Route::put('/pemeriksaan/{pemeriksaan}', [PemeriksaanController::class, 'update']);
Route::delete('/pemeriksaan/{pemeriksaan}', [PemeriksaanController::class, 'destroy']);
Route::get('/standar-who', [StandarWhoController::class, 'index']);
