<?php

namespace Tests\Feature;

use App\Models\Balita;
use App\Models\Pemeriksaan;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class BalitaApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Sanctum::actingAs(User::factory()->create());
    }

    public function test_lists_balita_sorted_by_name(): void
    {
        $user = User::factory()->create();

        Balita::create([
            'user_id' => $user->id,
            'nama' => 'Zahra Salsabila',
            'jenis_kelamin' => 'P',
            'posyandu' => 'Posyandu Melati 1',
            'tanggal_lahir' => '2024-05-30',
        ]);

        Balita::create([
            'user_id' => $user->id,
            'nama' => 'Ahmad Fauzi',
            'jenis_kelamin' => 'L',
            'posyandu' => 'Posyandu Melati 1',
            'tanggal_lahir' => '2024-03-12',
        ]);

        $response = $this->getJson('/api/balita');

        $response->assertOk();
        $response->assertJsonPath('0.nama', 'Ahmad Fauzi');
        $response->assertJsonPath('1.nama', 'Zahra Salsabila');
        $response->assertJsonCount(2);
    }

    public function test_filters_balita_by_search_query(): void
    {
        $user = User::factory()->create();

        Balita::create([
            'user_id' => $user->id,
            'nama' => 'Ahmad Fauzi',
            'jenis_kelamin' => 'L',
            'posyandu' => 'Posyandu Melati 1',
            'tanggal_lahir' => '2024-03-12',
        ]);

        Balita::create([
            'user_id' => $user->id,
            'nama' => 'Zahra Salsabila',
            'jenis_kelamin' => 'P',
            'posyandu' => 'Posyandu Melati 2',
            'tanggal_lahir' => '2024-05-30',
        ]);

        $response = $this->getJson('/api/balita?q=Melati 2');

        $response->assertOk();
        $response->assertJsonCount(1);
        $response->assertJsonPath('0.nama', 'Zahra Salsabila');
    }

    public function test_searches_balita_by_partial_name_case_insensitively(): void
    {
        $user = User::factory()->create();

        Balita::create([
            'user_id' => $user->id,
            'nama' => 'Ahmad Fauzi',
            'jenis_kelamin' => 'L',
            'posyandu' => 'Posyandu Melati 1',
            'tanggal_lahir' => '2024-03-12',
        ]);

        Balita::create([
            'user_id' => $user->id,
            'nama' => 'Zahra Salsabila',
            'jenis_kelamin' => 'P',
            'posyandu' => 'Posyandu Melati 2',
            'tanggal_lahir' => '2024-05-30',
        ]);

        $response = $this->getJson('/api/balita?q=ahmad');

        $response->assertOk();
        $response->assertJsonCount(1);
        $response->assertJsonPath('0.nama', 'Ahmad Fauzi');
    }

    public function test_search_returns_empty_list_when_no_name_matches(): void
    {
        $user = User::factory()->create();

        Balita::create([
            'user_id' => $user->id,
            'nama' => 'Ahmad Fauzi',
            'jenis_kelamin' => 'L',
            'posyandu' => 'Posyandu Melati 1',
            'tanggal_lahir' => '2024-03-12',
        ]);

        $response = $this->getJson('/api/balita?q=Tidak Ada');

        $response->assertOk();
        $response->assertJsonCount(0);
    }

    public function test_shows_a_single_balita(): void
    {
        $user = User::factory()->create();
        $balita = Balita::create([
            'user_id' => $user->id,
            'nama' => 'Ahmad Fauzi',
            'jenis_kelamin' => 'L',
            'posyandu' => 'Posyandu Melati 1',
            'tanggal_lahir' => '2024-03-12',
        ]);

        $response = $this->getJson("/api/balita/{$balita->id}");

        $response->assertOk();
        $response->assertJsonPath('nama', 'Ahmad Fauzi');
    }

    public function test_creates_a_balita(): void
    {
        User::factory()->create();

        $response = $this->postJson('/api/balita', [
            'nama' => 'Budi Santoso',
            'jenis_kelamin' => 'L',
            'tanggal_lahir' => '2024-07-20',
            'posyandu' => 'Posyandu Melati 1',
            'berat_lahir' => 3.2,
            'tinggi_lahir' => 49.5,
            'alamat' => 'Jl. Merdeka No. 1',
        ]);

        $response->assertCreated();
        $response->assertJsonPath('nama', 'Budi Santoso');
        $this->assertDatabaseHas('balita', ['nama' => 'Budi Santoso']);
    }

    public function test_rejects_creating_balita_without_required_fields(): void
    {
        $response = $this->postJson('/api/balita', []);

        $response->assertUnprocessable();
        $response->assertJsonValidationErrors(['nama', 'jenis_kelamin', 'tanggal_lahir', 'posyandu']);
    }

    public function test_creation_validation_messages_are_in_indonesian(): void
    {
        $response = $this->postJson('/api/balita', []);

        $response->assertUnprocessable();
        $response->assertJsonFragment(['Nama wajib diisi.']);
        $response->assertJsonFragment(['Jenis kelamin wajib dipilih.']);
        $response->assertJsonFragment(['Tanggal lahir wajib diisi.']);
        $response->assertJsonFragment(['Posyandu wajib diisi.']);
    }

    public function test_rejects_invalid_jenis_kelamin_and_future_tanggal_lahir(): void
    {
        $response = $this->postJson('/api/balita', [
            'nama' => 'Budi Santoso',
            'jenis_kelamin' => 'X',
            'tanggal_lahir' => now()->addDay()->toDateString(),
            'posyandu' => 'Posyandu Melati 1',
        ]);

        $response->assertUnprocessable();
        $response->assertJsonFragment(['Jenis kelamin tidak valid.']);
        $response->assertJsonFragment(['Tanggal lahir tidak boleh di masa depan.']);
    }

    public function test_rejects_updating_balita_with_invalid_data(): void
    {
        $user = User::factory()->create();
        $balita = Balita::create([
            'user_id' => $user->id,
            'nama' => 'Ahmad Fauzi',
            'jenis_kelamin' => 'L',
            'posyandu' => 'Posyandu Melati 1',
            'tanggal_lahir' => '2024-03-12',
        ]);

        $response = $this->putJson("/api/balita/{$balita->id}", [
            'nama' => 'A',
            'jenis_kelamin' => 'L',
            'tanggal_lahir' => '2024-03-12',
            'posyandu' => '',
        ]);

        $response->assertUnprocessable();
        $response->assertJsonFragment(['Nama minimal 2 karakter.']);
        $response->assertJsonFragment(['Posyandu wajib diisi.']);
    }

    public function test_updates_a_balita(): void
    {
        $user = User::factory()->create();
        $balita = Balita::create([
            'user_id' => $user->id,
            'nama' => 'Ahmad Fauzi',
            'jenis_kelamin' => 'L',
            'posyandu' => 'Posyandu Melati 1',
            'tanggal_lahir' => '2024-03-12',
        ]);

        $response = $this->putJson("/api/balita/{$balita->id}", [
            'nama' => 'Ahmad Fauzi Ramadhan',
            'jenis_kelamin' => 'L',
            'tanggal_lahir' => '2024-03-12',
            'posyandu' => 'Posyandu Melati 2',
        ]);

        $response->assertOk();
        $response->assertJsonPath('nama', 'Ahmad Fauzi Ramadhan');
        $response->assertJsonPath('posyandu', 'Posyandu Melati 2');
    }

    public function test_deletes_a_balita_and_cascades_riwayat(): void
    {
        $user = User::factory()->create();
        $balita = Balita::create([
            'user_id' => $user->id,
            'nama' => 'Ahmad Fauzi',
            'jenis_kelamin' => 'L',
            'posyandu' => 'Posyandu Melati 1',
            'tanggal_lahir' => '2024-03-12',
        ]);

        Pemeriksaan::create([
            'balita_id' => $balita->id,
            'umur_bulan' => 10,
            'berat_kg' => 8.0,
            'tinggi_cm' => 70,
            'status_gizi' => 'normal',
            'tanggal_cek' => '2026-06-01',
            'created_by' => $user->id,
        ]);

        $response = $this->deleteJson("/api/balita/{$balita->id}");

        $response->assertNoContent();
        $this->assertDatabaseMissing('balita', ['id' => $balita->id]);
        $this->assertDatabaseMissing('pemeriksaan', ['balita_id' => $balita->id]);
    }
}
