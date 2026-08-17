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
            // 5 field lama (dipertahankan) — lihat docs/champion-model-integration.md.
            'riwayat_lahir' => ['required', 'in:normal,prematur,berat_lahir_rendah'],
            'imunisasi' => ['required', 'in:ya,tidak'],
            'asi_eksklusif' => ['required', 'in:ya,tidak'],
            'sanitasi' => ['required', 'in:baik,kurang_baik'],
            'pendapatan_keluarga' => ['nullable', 'in:rendah,cukup,tinggi'],

            // 16 field baru untuk champion model ML — semua opsional (boleh
            // diisi bertahap; yang kosong diimputasi microservice ML).
            'jumlah_art' => ['nullable', 'integer', 'min:1', 'max:50'],
            'jumlah_balita_rt' => ['nullable', 'integer', 'min:1', 'max:20'],
            'pekerjaan_ayah' => ['nullable', 'integer', 'min:0', 'max:20'],
            'pekerjaan_ibu' => ['nullable', 'integer', 'min:0', 'max:20'],
            'pendidikan_ayah' => ['nullable', 'integer', 'min:0', 'max:20'],
            'pendidikan_ibu' => ['nullable', 'integer', 'min:0', 'max:20'],
            'kepemilikan_jamban' => ['nullable', 'integer', 'min:0', 'max:20'],
            'lokasi_air_minum' => ['nullable', 'integer', 'min:0', 'max:20'],
            'pembuangan_limbah_cair' => ['nullable', 'integer', 'min:0', 'max:20'],
            'pembuangan_tinja' => ['nullable', 'integer', 'min:0', 'max:20'],
            'sumber_air_minum' => ['nullable', 'integer', 'min:0', 'max:20'],
            'usia_kandungan_minggu' => ['nullable', 'integer', 'min:20', 'max:45'],
            'kepemilikan_buku_kia' => ['nullable', 'integer', 'min:0', 'max:20'],
            'imunisasi_hb0' => ['nullable', 'integer', 'min:0', 'max:20'],
            'imunisasi_bcg' => ['nullable', 'integer', 'min:0', 'max:20'],
            'imunisasi_dpt_hb_hib_lanjutan' => ['nullable', 'integer', 'min:0', 'max:20'],
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
