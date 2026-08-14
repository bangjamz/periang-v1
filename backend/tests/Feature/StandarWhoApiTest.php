<?php

namespace Tests\Feature;

use App\Models\User;
use Database\Seeders\StandarWhoSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class StandarWhoApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Sanctum::actingAs(User::factory()->create());
    }

    public function test_returns_standar_pertumbuhan_for_jenis_kelamin(): void
    {
        $this->seed(StandarWhoSeeder::class);

        $response = $this->getJson('/api/standar-who?jenis_kelamin=L');

        $response->assertOk();
        $response->assertJsonCount(61);
        $response->assertJsonPath('0.umur_bulan', 0);
        $response->assertJsonPath('0.berat_median_kg', '3.30');
        $response->assertJsonPath('60.umur_bulan', 60);
        $response->assertJsonPath('60.berat_median_kg', '18.30');
    }

    public function test_returns_different_values_for_perempuan(): void
    {
        $this->seed(StandarWhoSeeder::class);

        $response = $this->getJson('/api/standar-who?jenis_kelamin=P');

        $response->assertOk();
        $response->assertJsonPath('0.berat_median_kg', '3.20');
    }

    public function test_requires_jenis_kelamin(): void
    {
        $response = $this->getJson('/api/standar-who');

        $response->assertUnprocessable();
        $response->assertJsonFragment(['Jenis kelamin wajib diisi.']);
    }

    public function test_rejects_invalid_jenis_kelamin(): void
    {
        $response = $this->getJson('/api/standar-who?jenis_kelamin=X');

        $response->assertUnprocessable();
        $response->assertJsonFragment(['Jenis kelamin tidak valid.']);
    }
}
