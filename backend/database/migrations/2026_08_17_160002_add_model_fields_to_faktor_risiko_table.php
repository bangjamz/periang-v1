<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Tambah 16 kolom faktor risiko granular yang dibutuhkan champion model
     * ML (lihat docs/champion-model-integration.md di root repo). 5 kolom
     * lama (riwayat_lahir, imunisasi, asi_eksklusif, sanitasi,
     * pendapatan_keluarga) SENGAJA dipertahankan, tidak dihapus, sesuai
     * keputusan user (2026-08-17) — data lama tetap bisa ditelusuri.
     *
     * Semua kolom baru nullable: kader boleh menyimpan faktor risiko
     * bertahap, field yang belum diisi diimputasi microservice ML dengan
     * nilai median dari data training.
     */
    public function up(): void
    {
        Schema::table('faktor_risiko', function (Blueprint $table) {
            $table->unsignedSmallInteger('jumlah_art')->nullable()->after('pendapatan_keluarga');
            $table->unsignedSmallInteger('jumlah_balita_rt')->nullable();
            $table->unsignedSmallInteger('pekerjaan_ayah')->nullable();
            $table->unsignedSmallInteger('pekerjaan_ibu')->nullable();
            $table->unsignedSmallInteger('pendidikan_ayah')->nullable();
            $table->unsignedSmallInteger('pendidikan_ibu')->nullable();
            $table->unsignedSmallInteger('kepemilikan_jamban')->nullable();
            $table->unsignedSmallInteger('lokasi_air_minum')->nullable();
            $table->unsignedSmallInteger('pembuangan_limbah_cair')->nullable();
            $table->unsignedSmallInteger('pembuangan_tinja')->nullable();
            $table->unsignedSmallInteger('sumber_air_minum')->nullable();
            $table->unsignedSmallInteger('usia_kandungan_minggu')->nullable();
            $table->unsignedSmallInteger('kepemilikan_buku_kia')->nullable();
            $table->unsignedSmallInteger('imunisasi_hb0')->nullable();
            $table->unsignedSmallInteger('imunisasi_bcg')->nullable();
            $table->unsignedSmallInteger('imunisasi_dpt_hb_hib_lanjutan')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('faktor_risiko', function (Blueprint $table) {
            $table->dropColumn([
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
            ]);
        });
    }
};
