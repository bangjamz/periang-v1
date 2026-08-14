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
        Schema::create('standar_who', function (Blueprint $table) {
            $table->id();
            $table->enum('jenis_kelamin', ['L', 'P']);
            $table->unsignedSmallInteger('umur_bulan');
            $table->decimal('berat_median_kg', 5, 2);
            $table->decimal('tinggi_median_cm', 5, 2);
            $table->timestamps();

            $table->unique(['jenis_kelamin', 'umur_bulan']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('standar_who');
    }
};
