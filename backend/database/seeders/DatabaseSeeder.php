<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();

        // Kader demo — selaras dengan DUMMY_KADER di frontend
        // (frontend/src/lib/kader-data.ts) sampai login di-wiring ke API ini.
        User::factory()->create([
            'name' => 'Ratna Dewi',
            'email' => 'ratna.dewi@posyandu.id',
            'posyandu' => 'Posyandu Melati 1',
            'password' => 'posyandu123',
        ]);

        $this->call(BalitaSeeder::class);
        $this->call(StandarWhoSeeder::class);
    }
}
