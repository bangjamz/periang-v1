<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_logs_in_with_correct_credentials(): void
    {
        User::factory()->create([
            'email' => 'ratna.dewi@posyandu.id',
            'password' => 'posyandu123',
        ]);

        $response = $this->postJson('/api/login', [
            'email' => 'ratna.dewi@posyandu.id',
            'password' => 'posyandu123',
        ]);

        $response->assertOk();
        $response->assertJsonPath('user.email', 'ratna.dewi@posyandu.id');
        $response->assertJsonStructure(['user', 'token']);
    }

    public function test_rejects_wrong_password(): void
    {
        User::factory()->create([
            'email' => 'ratna.dewi@posyandu.id',
            'password' => 'posyandu123',
        ]);

        $response = $this->postJson('/api/login', [
            'email' => 'ratna.dewi@posyandu.id',
            'password' => 'salah',
        ]);

        $response->assertStatus(422);
        $response->assertJsonFragment(['message' => 'Email atau kata sandi salah.']);
    }

    public function test_rejects_unknown_email(): void
    {
        $response = $this->postJson('/api/login', [
            'email' => 'tidakada@posyandu.id',
            'password' => 'posyandu123',
        ]);

        $response->assertStatus(422);
        $response->assertJsonFragment(['message' => 'Email atau kata sandi salah.']);
    }

    public function test_rejects_missing_fields(): void
    {
        $response = $this->postJson('/api/login', []);

        $response->assertUnprocessable();
        $response->assertJsonFragment(['Email wajib diisi.']);
        $response->assertJsonFragment(['Kata sandi wajib diisi.']);
    }

    public function test_logs_out_and_revokes_token(): void
    {
        $user = User::factory()->create([
            'email' => 'ratna.dewi@posyandu.id',
            'password' => 'posyandu123',
        ]);
        $token = $user->createToken('test')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson('/api/logout');

        $response->assertNoContent();
        $this->assertDatabaseCount('personal_access_tokens', 0);
    }

    public function test_logout_requires_authentication(): void
    {
        $response = $this->postJson('/api/logout');

        $response->assertUnauthorized();
    }

    public function test_protected_endpoints_reject_requests_without_token(): void
    {
        $this->getJson('/api/balita')->assertUnauthorized();
        $this->getJson('/api/pemeriksaan')->assertUnauthorized();
        $this->getJson('/api/standar-who?jenis_kelamin=L')->assertUnauthorized();
    }
}
