<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Tests\TestCase;

class LupaKataSandiApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_sends_reset_link_for_registered_email(): void
    {
        Notification::fake();
        $user = User::factory()->create(['email' => 'ratna.dewi@posyandu.id']);

        $response = $this->postJson('/api/lupa-kata-sandi', [
            'email' => 'ratna.dewi@posyandu.id',
        ]);

        $response->assertOk();
        $response->assertJsonPath(
            'message',
            'Jika email terdaftar, tautan atur ulang kata sandi telah dikirim.',
        );
        Notification::assertSentTo($user, ResetPassword::class);
    }

    public function test_reset_link_points_to_frontend_reset_page(): void
    {
        Notification::fake();
        $user = User::factory()->create(['email' => 'ratna.dewi@posyandu.id']);

        $this->postJson('/api/lupa-kata-sandi', ['email' => 'ratna.dewi@posyandu.id']);

        Notification::assertSentTo($user, function (ResetPassword $notification) use ($user) {
            $mail = $notification->toMail($user);
            $url = $mail->actionUrl;

            return str_contains($url, '/reset-kata-sandi?token=')
                && str_contains($url, 'email=ratna.dewi%40posyandu.id');
        });
    }

    public function test_returns_generic_message_for_unregistered_email_too(): void
    {
        Notification::fake();

        $response = $this->postJson('/api/lupa-kata-sandi', [
            'email' => 'tidakterdaftar@posyandu.id',
        ]);

        $response->assertOk();
        $response->assertJsonPath(
            'message',
            'Jika email terdaftar, tautan atur ulang kata sandi telah dikirim.',
        );
        Notification::assertNothingSent();
    }

    public function test_rejects_missing_email(): void
    {
        $response = $this->postJson('/api/lupa-kata-sandi', []);

        $response->assertUnprocessable();
        $response->assertJsonFragment(['Email wajib diisi.']);
    }

    public function test_rejects_invalid_email_format(): void
    {
        $response = $this->postJson('/api/lupa-kata-sandi', ['email' => 'bukan-email']);

        $response->assertUnprocessable();
        $response->assertJsonFragment(['Format email tidak valid.']);
    }
}
