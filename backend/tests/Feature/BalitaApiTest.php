<?php

namespace Tests\Feature;

use App\Models\Balita;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class BalitaApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_lists_balita_sorted_by_name(): void
    {
        $user = User::factory()->create();

        Balita::create([
            'user_id' => $user->id,
            'nama' => 'Zahra Salsabila',
            'jenis_kelamin' => 'P',
            'tanggal_lahir' => '2024-05-30',
        ]);

        Balita::create([
            'user_id' => $user->id,
            'nama' => 'Ahmad Fauzi',
            'jenis_kelamin' => 'L',
            'tanggal_lahir' => '2024-03-12',
        ]);

        $response = $this->getJson('/api/balita');

        $response->assertOk();
        $response->assertJsonPath('0.nama', 'Ahmad Fauzi');
        $response->assertJsonPath('1.nama', 'Zahra Salsabila');
        $response->assertJsonCount(2);
    }
}
