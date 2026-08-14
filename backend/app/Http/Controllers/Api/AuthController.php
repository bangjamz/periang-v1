<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\LoginRequest;
use App\Http\Requests\LupaKataSandiRequest;
use App\Http\Requests\ResetKataSandiRequest;
use App\Http\Requests\UpdateKataSandiRequest;
use App\Models\User;
use Illuminate\Auth\Events\PasswordReset;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;

class AuthController extends Controller
{
    /**
     * Autentikasi kader lewat email & kata sandi, kembalikan token API
     * (Sanctum personal access token) untuk dipakai di request selanjutnya.
     */
    public function login(LoginRequest $request)
    {
        $data = $request->validated();
        $user = User::query()->where('email', $data['email'])->first();

        if (! $user || ! Hash::check($data['password'], $user->password)) {
            return response()->json([
                'message' => 'Email atau kata sandi salah.',
            ], 422);
        }

        $token = $user->createToken('periang-frontend')->plainTextToken;

        return response()->json([
            'user' => $user,
            'token' => $token,
        ]);
    }

    /**
     * Cabut token yang sedang dipakai request ini.
     */
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->noContent();
    }

    /**
     * Ganti kata sandi kader yang sedang masuk.
     */
    public function gantiKataSandi(UpdateKataSandiRequest $request)
    {
        $request->user()->update([
            'password' => $request->validated('kata_sandi_baru'),
        ]);

        return response()->noContent();
    }

    /**
     * Kirim tautan reset kata sandi lewat email (Laravel password broker).
     * Selalu balas pesan generik yang sama baik email terdaftar maupun
     * tidak, supaya endpoint ini tidak bisa dipakai menebak email terdaftar.
     */
    public function lupaKataSandi(LupaKataSandiRequest $request)
    {
        Password::sendResetLink($request->only('email'));

        return response()->json([
            'message' => 'Jika email terdaftar, tautan atur ulang kata sandi telah dikirim.',
        ]);
    }

    /**
     * Konsumsi token dari tautan "lupa kata sandi" dan simpan kata sandi
     * baru (Laravel password broker — token sekali pakai, kedaluwarsa 60
     * menit).
     */
    public function resetKataSandi(ResetKataSandiRequest $request)
    {
        $status = Password::reset(
            [
                'email' => $request->validated('email'),
                'password' => $request->validated('kata_sandi_baru'),
                'password_confirmation' => $request->input('kata_sandi_baru_confirmation'),
                'token' => $request->validated('token'),
            ],
            function (User $user, string $password) {
                $user->forceFill(['password' => $password])->save();

                Event::dispatch(new PasswordReset($user));
            },
        );

        if ($status !== Password::PASSWORD_RESET) {
            return response()->json([
                'message' => 'Tautan reset kata sandi tidak valid atau sudah kedaluwarsa.',
            ], 422);
        }

        return response()->json([
            'message' => 'Kata sandi berhasil diperbarui.',
        ]);
    }
}
