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
        Schema::create('balita', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('nama');
            $table->enum('jenis_kelamin', ['L', 'P']);
            $table->date('tanggal_lahir');
            $table->decimal('berat_lahir', 5, 2)->nullable();
            $table->decimal('tinggi_lahir', 5, 2)->nullable();
            $table->text('alamat')->nullable();
            $table->timestamps();
        });

        Schema::table('pemeriksaan', function (Blueprint $table) {
            $table->foreign('balita_id')->references('id')->on('balita')->cascadeOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('pemeriksaan', function (Blueprint $table) {
            $table->dropForeign(['balita_id']);
        });

        Schema::dropIfExists('balita');
    }
};
