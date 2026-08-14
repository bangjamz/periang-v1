<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreFaktorRisikoRequest extends FormRequest
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
            'riwayat_lahir' => ['required', 'in:normal,prematur,berat_lahir_rendah'],
            'imunisasi' => ['required', 'in:ya,tidak'],
            'asi_eksklusif' => ['required', 'in:ya,tidak'],
            'sanitasi' => ['required', 'in:baik,kurang_baik'],
            'pendapatan_keluarga' => ['nullable', 'in:rendah,cukup,tinggi'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'riwayat_lahir.required' => 'Riwayat lahir wajib dipilih.',
            'riwayat_lahir.in' => 'Riwayat lahir tidak valid.',
            'imunisasi.required' => 'Status imunisasi wajib dipilih.',
            'imunisasi.in' => 'Status imunisasi tidak valid.',
            'asi_eksklusif.required' => 'Status ASI eksklusif wajib dipilih.',
            'asi_eksklusif.in' => 'Status ASI eksklusif tidak valid.',
            'sanitasi.required' => 'Sanitasi wajib dipilih.',
            'sanitasi.in' => 'Sanitasi tidak valid.',
            'pendapatan_keluarga.in' => 'Pendapatan keluarga tidak valid.',
        ];
    }
}
