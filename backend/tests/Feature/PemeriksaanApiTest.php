<?php

namespace Tests\Feature;

use App\Models\Balita;
use App\Models\Pemeriksaan;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PemeriksaanApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_lists_riwayat_sorted_by_newest_check_date(): void
    {
        $user = User::factory()->create();
        $balita = Balita::create([
            'user_id' => $user->id,
            'nama' => 'Ahmad Fauzi',
            'jenis_kelamin' => 'L',
            'tanggal_lahir' => '2024-03-12',
        ]);

        $lama = Pemeriksaan::create([
            'balita_id' => $balita->id,
            'umur_bulan' => 10,
            'berat_kg' => 8.0,
            'tinggi_cm' => 70,
            'status_gizi' => 'normal',
            'tanggal_cek' => '2026-06-01',
            'created_by' => $user->id,
        ]);

        $baru = Pemeriksaan::create([
            'balita_id' => $balita->id,
            'umur_bulan' => 12,
            'berat_kg' => 8.5,
            'tinggi_cm' => 73,
            'status_gizi' => 'normal',
            'tanggal_cek' => '2026-08-01',
            'created_by' => $user->id,
        ]);

        $response = $this->getJson('/api/pemeriksaan');

        $response->assertOk();
        $response->assertJsonPath('0.id', $baru->id);
        $response->assertJsonPath('1.id', $lama->id);
        $response->assertJsonPath('0.balita.nama', 'Ahmad Fauzi');
    }

    public function test_filters_riwayat_by_balita_id(): void
    {
        $user = User::factory()->create();

        $balitaA = Balita::create([
            'user_id' => $user->id,
            'nama' => 'Ahmad Fauzi',
            'jenis_kelamin' => 'L',
            'tanggal_lahir' => '2024-03-12',
        ]);
        $balitaB = Balita::create([
            'user_id' => $user->id,
            'nama' => 'Siti Aisyah',
            'jenis_kelamin' => 'P',
            'tanggal_lahir' => '2023-11-05',
        ]);

        Pemeriksaan::create([
            'balita_id' => $balitaA->id,
            'umur_bulan' => 10,
            'berat_kg' => 8.0,
            'tinggi_cm' => 70,
            'status_gizi' => 'normal',
            'tanggal_cek' => '2026-06-01',
            'created_by' => $user->id,
        ]);
        Pemeriksaan::create([
            'balita_id' => $balitaB->id,
            'umur_bulan' => 20,
            'berat_kg' => 11.0,
            'tinggi_cm' => 82,
            'status_gizi' => 'normal',
            'tanggal_cek' => '2026-06-02',
            'created_by' => $user->id,
        ]);

        $response = $this->getJson("/api/pemeriksaan?balita_id={$balitaA->id}");

        $response->assertOk();
        $response->assertJsonCount(1);
        $response->assertJsonPath('0.balita_id', $balitaA->id);
    }

    public function test_saves_pemeriksaan_and_returns_computed_status(): void
    {
        $user = User::factory()->create();

        $balita = Balita::create([
            'user_id' => $user->id,
            'nama' => 'Ahmad Fauzi',
            'jenis_kelamin' => 'L',
            'tanggal_lahir' => now()->subMonths(12)->toDateString(),
        ]);

        $response = $this->postJson('/api/pemeriksaan', [
            'balita_id' => $balita->id,
            'tanggal_cek' => now()->toDateString(),
            'berat_kg' => 6.0,
            'tinggi_cm' => 75.7,
        ]);

        $response->assertCreated();
        $response->assertJsonPath('pemeriksaan.status_gizi', 'buruk');
        $response->assertJsonPath('pemeriksaan.umur_bulan', 12);

        $this->assertDatabaseHas('pemeriksaan', [
            'balita_id' => $balita->id,
            'status_gizi' => 'buruk',
        ]);
    }

    public function test_saves_pemeriksaan_when_age_is_not_an_exact_month_boundary(): void
    {
        // Regression: Carbon::diffInMonths() can return a float, which used
        // to fail inserting into the smallint umur_bulan column.
        $user = User::factory()->create();

        $balita = Balita::create([
            'user_id' => $user->id,
            'nama' => 'Siti Aisyah',
            'jenis_kelamin' => 'P',
            'tanggal_lahir' => '2024-03-17',
        ]);

        $response = $this->postJson('/api/pemeriksaan', [
            'balita_id' => $balita->id,
            'tanggal_cek' => '2026-08-13',
            'berat_kg' => 11.0,
            'tinggi_cm' => 85.0,
        ]);

        $response->assertCreated();
        $response->assertJsonPath('pemeriksaan.umur_bulan', 28);
    }

    public function test_rejects_unknown_balita(): void
    {
        $response = $this->postJson('/api/pemeriksaan', [
            'balita_id' => 999,
            'tanggal_cek' => now()->toDateString(),
            'berat_kg' => 8.5,
            'tinggi_cm' => 72,
        ]);

        $response->assertUnprocessable();
        $response->assertJsonValidationErrors('balita_id');
    }

    public function test_rejects_tanggal_cek_before_balita_was_born(): void
    {
        $user = User::factory()->create();
        $balita = Balita::create([
            'user_id' => $user->id,
            'nama' => 'Ahmad Fauzi',
            'jenis_kelamin' => 'L',
            'tanggal_lahir' => '2024-03-12',
        ]);

        $response = $this->postJson('/api/pemeriksaan', [
            'balita_id' => $balita->id,
            'tanggal_cek' => '2024-01-01',
            'berat_kg' => 3.2,
            'tinggi_cm' => 49,
        ]);

        $response->assertUnprocessable();
        $response->assertJsonValidationErrors('tanggal_cek');
    }

    public function test_rejects_out_of_range_measurements(): void
    {
        $user = User::factory()->create();
        $balita = Balita::create([
            'user_id' => $user->id,
            'nama' => 'Ahmad Fauzi',
            'jenis_kelamin' => 'L',
            'tanggal_lahir' => '2024-03-12',
        ]);

        $response = $this->postJson('/api/pemeriksaan', [
            'balita_id' => $balita->id,
            'tanggal_cek' => now()->toDateString(),
            'berat_kg' => 999,
            'tinggi_cm' => 999,
        ]);

        $response->assertUnprocessable();
        $response->assertJsonValidationErrors(['berat_kg', 'tinggi_cm']);
    }

    public function test_validation_messages_are_in_indonesian(): void
    {
        $response = $this->postJson('/api/pemeriksaan', []);

        $response->assertUnprocessable();
        $response->assertJsonFragment(['Balita wajib dipilih.']);
        $response->assertJsonFragment(['Tanggal pemeriksaan wajib diisi.']);
        $response->assertJsonFragment(['Berat badan wajib diisi.']);
        $response->assertJsonFragment(['Tinggi badan wajib diisi.']);
    }
}
