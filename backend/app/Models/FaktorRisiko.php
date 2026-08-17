<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FaktorRisiko extends Model
{
    protected $table = 'faktor_risiko';

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'balita_id',
        // 5 field lama (dipertahankan, tidak dipakai lagi oleh champion model
        // ML — lihat docs/champion-model-integration.md di root repo).
        'riwayat_lahir',
        'imunisasi',
        'asi_eksklusif',
        'sanitasi',
        'pendapatan_keluarga',
        // 16 field baru, granular, dipakai langsung sebagai fitur champion
        // model ML (jenis_kelamin, umur_bulan, berat/panjang lahir, bblr
        // diambil dari tabel balita, bukan di sini).
        'jumlah_art',
        'jumlah_balita_rt',
        'pekerjaan_ayah',
        'pekerjaan_ibu',
        'pendidikan_ayah',
        'pendidikan_ibu',
        'kepemilikan_jamban',
        'lokasi_air_minum',
        'pembuangan_limbah_cair',
        'pembuangan_tinja',
        'sumber_air_minum',
        'usia_kandungan_minggu',
        'kepemilikan_buku_kia',
        'imunisasi_hb0',
        'imunisasi_bcg',
        'imunisasi_dpt_hb_hib_lanjutan',
    ];

    public function balita()
    {
        return $this->belongsTo(Balita::class, 'balita_id');
    }
}
