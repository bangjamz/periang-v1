<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Tests\TestCase;

class ResetKataSandiApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_resets_password_with_valid_token(): void
    {
        $user = User::factory()->create(['email' => 'ratna.dewi@posyandu.id']);
        $token = Password::createToken($user);

        $response = $this->postJson('/api/reset-kata-sandi', [
            'token' => $token,
            'email' => 'ratna.dewi@posyandu.id',
            'kata_sandi_baru' => 'sandibaru1',
            'kata_sandi_baru_confirmation' => 'sandibaru1',
        ]);

        $response->assertOk();
        $this->assertTrue(Hash::check('sandibaru1', $user->fresh()->password));
    }

    public function test_new_password_can_be_used_to_login_after_reset(): void
    {
        $user = User::factory()->create(['email' => 'ratna.dewi@posyandu.id']);
        $token = Password::createToken($user);

        $this->postJson('/api/reset-kata-sandi', [
            'token' => $token,
            'email' => 'ratna.dewi@posyandu.id',
            'kata_sandi_baru' => 'sandibaru1',
            'kata_sandi_baru_confirmation' => 'sandibaru1',
        ])->assertOk();

        $this->postJson('/api/login', [
            'email' => 'ratna.dewi@posyandu.id',
            'password' => 'sandibaru1',
        ])->assertOk();
    }

    public function test_rejects_invalid_token(): void
    {
        User::factory()->create(['email' => 'ratna.dewi@posyandu.id']);

        $response = $this->postJson('/api/reset-kata-sandi', [
            'token' => 'token-tidak-valid',
            'email' => 'ratna.dewi@posyandu.id',
            'kata_sandi_baru' => 'sandibaru1',
            'kata_sandi_baru_confirmation' => 'sandibaru1',
        ]);

        $response->assertStatus(422);
        $response->assertJsonPath(
            'message',
            'Tautan reset kata sandi tidak valid atau sudah kedaluwarsa.',
        );
    }

    public function test_token_cannot_be_reused(): void
    {
        $user = User::factory()->create(['email' => 'ratna.dewi@posyandu.id']);
        $token = Password::createToken($user);

        $this->postJson('/api/reset-kata-sandi', [
            'token' => $token,
            'email' => 'ratna.dewi@posyandu.id',
            'kata_sandi_baru' => 'sandibaru1',
            'kata_sandi_baru_confirmation' => 'sandibaru1',
        ])->assertOk();

        $response = $this->postJson('/api/reset-kata-sandi', [
            'token' => $token,
            'email' => 'ratna.dewi@posyandu.id',
            'kata_sandi_baru' => 'sandilagi2',
            'kata_sandi_baru_confirmation' => 'sandilagi2',
        ]);

        $response->assertStatus(422);
    }

    public function test_rejects_unconfirmed_new_password(): void
    {
        $user = User::factory()->create(['email' => 'ratna.dewi@posyandu.id']);
        $token = Password::createToken($user);

        $response = $this->postJson('/api/reset-kata-sandi', [
            'token' => $token,
            'email' => 'ratna.dewi@posyandu.id',
            'kata_sandi_baru' => 'sandibaru1',
            'kata_sandi_baru_confirmation' => 'beda',
        ]);

        $response->assertUnprocessable();
        $response->assertJsonFragment(['Konfirmasi kata sandi tidak cocok.']);
    }

    public function test_rejects_missing_fields(): void
    {
        $response = $this->postJson('/api/reset-kata-sandi', []);

        $response->assertUnprocessable();
        $response->assertJsonFragment(['Tautan reset tidak valid.']);
        $response->assertJsonFragment(['Email wajib diisi.']);
        $response->assertJsonFragment(['Kata sandi baru wajib diisi.']);
    }
}
