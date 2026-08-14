<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class GantiKataSandiApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_changes_password_with_correct_current_password(): void
    {
        $user = User::factory()->create(['password' => 'posyandu123']);
        Sanctum::actingAs($user);

        $response = $this->putJson('/api/profil/kata-sandi', [
            'kata_sandi_lama' => 'posyandu123',
            'kata_sandi_baru' => 'sandibaru1',
            'kata_sandi_baru_confirmation' => 'sandibaru1',
        ]);

        $response->assertNoContent();
        $this->assertTrue(
            Hash::check('sandibaru1', $user->fresh()->password),
        );
    }

    public function test_rejects_wrong_current_password(): void
    {
        $user = User::factory()->create(['password' => 'posyandu123']);
        Sanctum::actingAs($user);

        $response = $this->putJson('/api/profil/kata-sandi', [
            'kata_sandi_lama' => 'salah',
            'kata_sandi_baru' => 'sandibaru1',
            'kata_sandi_baru_confirmation' => 'sandibaru1',
        ]);

        $response->assertUnprocessable();
        $response->assertJsonFragment(['Kata sandi saat ini salah.']);
    }

    public function test_rejects_unconfirmed_new_password(): void
    {
        $user = User::factory()->create(['password' => 'posyandu123']);
        Sanctum::actingAs($user);

        $response = $this->putJson('/api/profil/kata-sandi', [
            'kata_sandi_lama' => 'posyandu123',
            'kata_sandi_baru' => 'sandibaru1',
            'kata_sandi_baru_confirmation' => 'beda',
        ]);

        $response->assertUnprocessable();
        $response->assertJsonFragment(['Konfirmasi kata sandi tidak cocok.']);
    }

    public function test_rejects_short_new_password(): void
    {
        $user = User::factory()->create(['password' => 'posyandu123']);
        Sanctum::actingAs($user);

        $response = $this->putJson('/api/profil/kata-sandi', [
            'kata_sandi_lama' => 'posyandu123',
            'kata_sandi_baru' => 'abc',
            'kata_sandi_baru_confirmation' => 'abc',
        ]);

        $response->assertUnprocessable();
        $response->assertJsonFragment(['Kata sandi baru minimal 6 karakter.']);
    }

    public function test_requires_authentication(): void
    {
        $response = $this->putJson('/api/profil/kata-sandi', [
            'kata_sandi_lama' => 'posyandu123',
            'kata_sandi_baru' => 'sandibaru1',
            'kata_sandi_baru_confirmation' => 'sandibaru1',
        ]);

        $response->assertUnauthorized();
    }

    public function test_new_password_can_be_used_to_login(): void
    {
        $user = User::factory()->create([
            'email' => 'ratna.dewi@posyandu.id',
            'password' => 'posyandu123',
        ]);
        Sanctum::actingAs($user);

        $this->putJson('/api/profil/kata-sandi', [
            'kata_sandi_lama' => 'posyandu123',
            'kata_sandi_baru' => 'sandibaru1',
            'kata_sandi_baru_confirmation' => 'sandibaru1',
        ])->assertNoContent();

        $response = $this->postJson('/api/login', [
            'email' => 'ratna.dewi@posyandu.id',
            'password' => 'sandibaru1',
        ]);

        $response->assertOk();
    }
}
