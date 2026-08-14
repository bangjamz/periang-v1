<?php

namespace Tests\Feature;

use App\Models\Balita;
use App\Models\FaktorRisiko;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class FaktorRisikoApiTest extends TestCase
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

    public function test_returns_404_when_faktor_risiko_not_set(): void
    {
        $balita = $this->buatBalita();

        $response = $this->getJson("/api/balita/{$balita->id}/faktor-risiko");

        $response->assertNotFound();
    }

    public function test_creates_faktor_risiko(): void
    {
        $balita = $this->buatBalita();

        $response = $this->putJson("/api/balita/{$balita->id}/faktor-risiko", [
            'riwayat_lahir' => 'prematur',
            'imunisasi' => 'tidak',
            'asi_eksklusif' => 'tidak',
            'sanitasi' => 'kurang_baik',
            'pendapatan_keluarga' => 'rendah',
        ]);

        $response->assertOk();
        $response->assertJsonPath('riwayat_lahir', 'prematur');
        $this->assertDatabaseHas('faktor_risiko', ['balita_id' => $balita->id, 'riwayat_lahir' => 'prematur']);
    }

    public function test_updates_existing_faktor_risiko_instead_of_duplicating(): void
    {
        $balita = $this->buatBalita();

        FaktorRisiko::create([
            'balita_id' => $balita->id,
            'riwayat_lahir' => 'normal',
            'imunisasi' => 'ya',
            'asi_eksklusif' => 'ya',
            'sanitasi' => 'baik',
        ]);

        $response = $this->putJson("/api/balita/{$balita->id}/faktor-risiko", [
            'riwayat_lahir' => 'berat_lahir_rendah',
            'imunisasi' => 'tidak',
            'asi_eksklusif' => 'ya',
            'sanitasi' => 'baik',
        ]);

        $response->assertOk();
        $this->assertDatabaseCount('faktor_risiko', 1);
        $this->assertDatabaseHas('faktor_risiko', [
            'balita_id' => $balita->id,
            'riwayat_lahir' => 'berat_lahir_rendah',
            'imunisasi' => 'tidak',
        ]);
    }

    public function test_shows_faktor_risiko(): void
    {
        $balita = $this->buatBalita();

        FaktorRisiko::create([
            'balita_id' => $balita->id,
            'riwayat_lahir' => 'normal',
            'imunisasi' => 'ya',
            'asi_eksklusif' => 'ya',
            'sanitasi' => 'baik',
        ]);

        $response = $this->getJson("/api/balita/{$balita->id}/faktor-risiko");

        $response->assertOk();
        $response->assertJsonPath('riwayat_lahir', 'normal');
    }

    public function test_rejects_invalid_faktor_risiko(): void
    {
        $balita = $this->buatBalita();

        $response = $this->putJson("/api/balita/{$balita->id}/faktor-risiko", []);

        $response->assertUnprocessable();
        $response->assertJsonFragment(['Riwayat lahir wajib dipilih.']);
        $response->assertJsonFragment(['Status imunisasi wajib dipilih.']);
        $response->assertJsonFragment(['Status ASI eksklusif wajib dipilih.']);
        $response->assertJsonFragment(['Sanitasi wajib dipilih.']);
    }

    public function test_deletes_faktor_risiko(): void
    {
        $balita = $this->buatBalita();

        FaktorRisiko::create([
            'balita_id' => $balita->id,
            'riwayat_lahir' => 'normal',
            'imunisasi' => 'ya',
            'asi_eksklusif' => 'ya',
            'sanitasi' => 'baik',
        ]);

        $response = $this->deleteJson("/api/balita/{$balita->id}/faktor-risiko");

        $response->assertNoContent();
        $this->assertDatabaseMissing('faktor_risiko', ['balita_id' => $balita->id]);
    }

    public function test_deleting_balita_cascades_faktor_risiko(): void
    {
        $balita = $this->buatBalita();

        FaktorRisiko::create([
            'balita_id' => $balita->id,
            'riwayat_lahir' => 'normal',
            'imunisasi' => 'ya',
            'asi_eksklusif' => 'ya',
            'sanitasi' => 'baik',
        ]);

        $this->deleteJson("/api/balita/{$balita->id}")->assertNoContent();

        $this->assertDatabaseMissing('faktor_risiko', ['balita_id' => $balita->id]);
    }
}
