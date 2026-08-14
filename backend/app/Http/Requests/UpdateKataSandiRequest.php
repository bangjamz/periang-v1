<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class UpdateKataSandiRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'kata_sandi_lama' => ['required', 'current_password'],
            'kata_sandi_baru' => ['required', 'string', 'min:6', 'confirmed'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'kata_sandi_lama.required' => 'Kata sandi saat ini wajib diisi.',
            'kata_sandi_lama.current_password' => 'Kata sandi saat ini salah.',
            'kata_sandi_baru.required' => 'Kata sandi baru wajib diisi.',
            'kata_sandi_baru.min' => 'Kata sandi baru minimal 6 karakter.',
            'kata_sandi_baru.confirmed' => 'Konfirmasi kata sandi tidak cocok.',
        ];
    }
}
