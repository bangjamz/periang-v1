<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('faktor_risiko', function (Blueprint $table) {
            $table->id();
            $table->foreignId('balita_id')->unique()->constrained('balita')->cascadeOnDelete();
            $table->enum('riwayat_lahir', ['normal', 'prematur', 'berat_lahir_rendah']);
            $table->enum('imunisasi', ['ya', 'tidak']);
            $table->enum('asi_eksklusif', ['ya', 'tidak']);
            $table->enum('sanitasi', ['baik', 'kurang_baik']);
            $table->enum('pendapatan_keluarga', ['rendah', 'cukup', 'tinggi'])->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('faktor_risiko');
    }
};
