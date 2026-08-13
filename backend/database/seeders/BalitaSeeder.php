<?php

namespace Database\Seeders;

use App\Models\Balita;
use App\Models\User;
use Illuminate\Database\Seeder;

class BalitaSeeder extends Seeder
{
    /**
     * Run the database seeds. Mirrors the frontend's dummy balita list so
     * both sides show the same demo data until real registration exists.
     */
    public function run(): void
    {
        $kader = User::first() ?? User::factory()->create();

        $balitaList = [
            ['nama' => 'Ahmad Fauzi', 'jenis_kelamin' => 'L', 'tanggal_lahir' => '2024-03-12'],
            ['nama' => 'Siti Aisyah', 'jenis_kelamin' => 'P', 'tanggal_lahir' => '2023-11-05'],
            ['nama' => 'Budi Santoso', 'jenis_kelamin' => 'L', 'tanggal_lahir' => '2024-07-20'],
            ['nama' => 'Nur Halimah', 'jenis_kelamin' => 'P', 'tanggal_lahir' => '2022-09-01'],
            ['nama' => 'Rizky Ramadhan', 'jenis_kelamin' => 'L', 'tanggal_lahir' => '2023-04-18'],
            ['nama' => 'Putri Ayu Lestari', 'jenis_kelamin' => 'P', 'tanggal_lahir' => '2024-01-25'],
            ['nama' => 'Dimas Prasetyo', 'jenis_kelamin' => 'L', 'tanggal_lahir' => '2023-08-09'],
            ['nama' => 'Zahra Salsabila', 'jenis_kelamin' => 'P', 'tanggal_lahir' => '2024-05-30'],
        ];

        foreach ($balitaList as $balita) {
            Balita::create([...$balita, 'user_id' => $kader->id]);
        }
    }
}
