<?php

namespace Tests\Feature;

use App\Models\Balita;
use App\Models\FaktorRisiko;
use App\Models\Pemeriksaan;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class PrediksiRisikoApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Sanctum::actingAs(User::factory()->create());
    }

    private function buatBalita(): Balita
    {
        $user = User::factory()->create();

        return Balita::create([
            'user_id' => $user->id,
            'nama' => 'Ahmad Fauzi',
            'jenis_kelamin' => 'L',
            'posyandu' => 'Posyandu Melati 1',
            'tanggal_lahir' => '2024-03-12',
        ]);
    }

    public function test_returns_404_when_faktor_risiko_belum_diisi(): void
    {
        $balita = $this->buatBalita();

        $response = $this->getJson("/api/balita/{$balita->id}/prediksi");

        $response->assertNotFound();
    }

    public function test_predicts_risiko_rendah_for_no_risk_factors(): void
    {
        $balita = $this->buatBalita();

        FaktorRisiko::create([
            'balita_id' => $balita->id,
            'riwayat_lahir' => 'normal',
            'imunisasi' => 'ya',
            'asi_eksklusif' => 'ya',
            'sanitasi' => 'baik',
        ]);

        $response = $this->getJson("/api/balita/{$balita->id}/prediksi");

        $response->assertOk();
        $response->assertJsonPath('skor', 0);
        $response->assertJsonPath('tingkat_risiko', 'rendah');
        $response->assertJsonPath('faktor_kontribusi', []);
    }

    public function test_predicts_risiko_sedang(): void
    {
        $balita = $this->buatBalita();

        FaktorRisiko::create([
            'balita_id' => $balita->id,
            'riwayat_lahir' => 'prematur',
            'imunisasi' => 'ya',
            'asi_eksklusif' => 'tidak',
            'sanitasi' => 'baik',
        ]);

        $response = $this->getJson("/api/balita/{$balita->id}/prediksi");

        $response->assertOk();
        $response->assertJsonPath('skor', 3);
        $response->assertJsonPath('tingkat_risiko', 'sedang');
    }

    public function test_predicts_risiko_tinggi_including_status_gizi_terakhir(): void
    {
        $balita = $this->buatBalita();

        FaktorRisiko::create([
            'balita_id' => $balita->id,
            'riwayat_lahir' => 'prematur',
            'imunisasi' => 'tidak',
            'asi_eksklusif' => 'tidak',
            'sanitasi' => 'kurang_baik',
        ]);

        Pemeriksaan::create([
            'balita_id' => $balita->id,
            'umur_bulan' => 10,
            'berat_kg' => 5.0,
            'tinggi_cm' => 60,
            'status_gizi' => 'buruk',
            'tanggal_cek' => '2026-06-01',
            'created_by' => $balita->user_id,
        ]);

        $response = $this->getJson("/api/balita/{$balita->id}/prediksi");

        $response->assertOk();
        $response->assertJsonPath('skor', 10);
        $response->assertJsonPath('tingkat_risiko', 'tinggi');
        $response->assertJsonFragment(['Status gizi terakhir: gizi buruk']);
    }

    public function test_uses_latest_pemeriksaan_by_tanggal_cek(): void
    {
        $balita = $this->buatBalita();

        FaktorRisiko::create([
            'balita_id' => $balita->id,
            'riwayat_lahir' => 'normal',
            'imunisasi' => 'ya',
            'asi_eksklusif' => 'ya',
            'sanitasi' => 'baik',
        ]);

        Pemeriksaan::create([
            'balita_id' => $balita->id,
            'umur_bulan' => 5,
            'berat_kg' => 5.0,
            'tinggi_cm' => 60,
            'status_gizi' => 'buruk',
            'tanggal_cek' => '2026-01-01',
            'created_by' => $balita->user_id,
        ]);

        Pemeriksaan::create([
            'balita_id' => $balita->id,
            'umur_bulan' => 10,
            'berat_kg' => 8.0,
            'tinggi_cm' => 70,
            'status_gizi' => 'normal',
            'tanggal_cek' => '2026-06-01',
            'created_by' => $balita->user_id,
        ]);

        $response = $this->getJson("/api/balita/{$balita->id}/prediksi");

        $response->assertOk();
        $response->assertJsonPath('skor', 0);
        $response->assertJsonPath('tingkat_risiko', 'rendah');
    }
}
