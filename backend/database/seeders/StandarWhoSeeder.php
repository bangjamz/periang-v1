<?php

namespace Database\Seeders;

use App\Models\StandarWho;
use App\Support\StandarPertumbuhanWho;
use Illuminate\Database\Seeder;

class StandarWhoSeeder extends Seeder
{
    /**
     * Isi standar_who dengan median berat & tinggi WHO per bulan (0-60)
     * untuk tiap jenis kelamin, diinterpolasi dari titik acuan resmi.
     */
    public function run(): void
    {
        foreach (['L', 'P'] as $jenisKelamin) {
            for ($umurBulan = 0; $umurBulan <= 60; $umurBulan++) {
                StandarWho::create([
                    'jenis_kelamin' => $jenisKelamin,
                    'umur_bulan' => $umurBulan,
                    'berat_median_kg' => StandarPertumbuhanWho::interpolasi(
                        StandarPertumbuhanWho::BERAT_MEDIAN_KG[$jenisKelamin],
                        $umurBulan,
                    ),
                    'tinggi_median_cm' => StandarPertumbuhanWho::interpolasi(
                        StandarPertumbuhanWho::TINGGI_MEDIAN_CM[$jenisKelamin],
                        $umurBulan,
                    ),
                ]);
            }
        }
    }
}
