<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ProfilApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_shows_authenticated_user_profile(): void
    {
        $user = User::factory()->create([
            'name' => 'Ratna Dewi',
            'posyandu' => 'Posyandu Melati 1',
        ]);
        Sanctum::actingAs($user);

        $response = $this->getJson('/api/profil');

        $response->assertOk();
        $response->assertJsonPath('name', 'Ratna Dewi');
        $response->assertJsonPath('posyandu', 'Posyandu Melati 1');
    }

    public function test_requires_authentication_to_view_profile(): void
    {
        $response = $this->getJson('/api/profil');

        $response->assertUnauthorized();
    }

    public function test_updates_profile_name_and_posyandu(): void
    {
        $user = User::factory()->create([
            'name' => 'Ratna Dewi',
            'posyandu' => 'Posyandu Melati 1',
        ]);
        Sanctum::actingAs($user);

        $response = $this->putJson('/api/profil', [
            'name' => 'Ratna Dewi Ramadhan',
            'posyandu' => 'Posyandu Mawar 3',
        ]);

        $response->assertOk();
        $response->assertJsonPath('name', 'Ratna Dewi Ramadhan');
        $response->assertJsonPath('posyandu', 'Posyandu Mawar 3');
        $this->assertDatabaseHas('users', [
            'id' => $user->id,
            'name' => 'Ratna Dewi Ramadhan',
            'posyandu' => 'Posyandu Mawar 3',
        ]);
    }

    public function test_rejects_profile_update_without_required_fields(): void
    {
        Sanctum::actingAs(User::factory()->create());

        $response = $this->putJson('/api/profil', []);

        $response->assertUnprocessable();
        $response->assertJsonFragment(['Nama wajib diisi.']);
        $response->assertJsonFragment(['Posyandu wajib diisi.']);
    }

    public function test_updating_profile_does_not_change_other_users(): void
    {
        $lain = User::factory()->create(['name' => 'Kader Lain']);
        Sanctum::actingAs(User::factory()->create(['name' => 'Ratna Dewi']));

        $this->putJson('/api/profil', [
            'name' => 'Ratna Dewi Baru',
            'posyandu' => 'Posyandu Melati 1',
        ])->assertOk();

        $this->assertDatabaseHas('users', ['id' => $lain->id, 'name' => 'Kader Lain']);
    }
}
