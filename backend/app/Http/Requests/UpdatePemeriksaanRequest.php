<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class UpdatePemeriksaanRequest extends FormRequest
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
            'tanggal_cek' => ['required', 'date', 'before_or_equal:today'],
            'berat_kg' => ['required', 'numeric', 'between:0.5,50'],
            'tinggi_cm' => ['required', 'numeric', 'between:20,150'],
            'catatan' => ['nullable', 'string', 'max:1000'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'tanggal_cek.required' => 'Tanggal pemeriksaan wajib diisi.',
            'tanggal_cek.date' => 'Tanggal pemeriksaan tidak valid.',
            'tanggal_cek.before_or_equal' => 'Tanggal pemeriksaan tidak boleh di masa depan.',
            'berat_kg.required' => 'Berat badan wajib diisi.',
            'berat_kg.between' => 'Berat badan harus antara 0,5 sampai 50 kg.',
            'tinggi_cm.required' => 'Tinggi badan wajib diisi.',
            'tinggi_cm.between' => 'Tinggi badan harus antara 20 sampai 150 cm.',
            'catatan.max' => 'Catatan maksimal 1000 karakter.',
        ];
    }

    /**
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return [
            'tanggal_cek' => 'tanggal pemeriksaan',
            'berat_kg' => 'berat badan',
            'tinggi_cm' => 'tinggi badan',
        ];
    }

    /**
     * Validasi bisnis tambahan: tanggal cek tidak boleh sebelum tanggal lahir balita.
     */
    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator) {
            $tanggalCek = $this->input('tanggal_cek');
            $pemeriksaan = $this->route('pemeriksaan');

            if (! $tanggalCek || $validator->errors()->has('tanggal_cek') || ! $pemeriksaan) {
                return;
            }

            $balita = $pemeriksaan->balita;

            if ($balita && $tanggalCek < $balita->tanggal_lahir->toDateString()) {
                $validator->errors()->add(
                    'tanggal_cek',
                    'Tanggal pemeriksaan tidak boleh sebelum tanggal lahir balita.',
                );
            }
        });
    }
}
