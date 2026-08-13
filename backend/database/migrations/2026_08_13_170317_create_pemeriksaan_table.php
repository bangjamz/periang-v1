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
        Schema::create('pemeriksaan', function (Blueprint $table) {
            $table->id();
            // FK constraint added once the balita table migration lands.
            $table->unsignedBigInteger('balita_id')->index();
            $table->unsignedSmallInteger('umur_bulan');
            $table->decimal('berat_kg', 5, 2);
            $table->decimal('tinggi_cm', 5, 2);
            $table->enum('status_gizi', ['normal', 'kurang', 'buruk', 'pendek']);
            $table->text('catatan')->nullable();
            $table->date('tanggal_cek');
            $table->foreignId('created_by')->constrained('users')->restrictOnDelete();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pemeriksaan');
    }
};
