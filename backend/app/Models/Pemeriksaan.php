<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Pemeriksaan extends Model
{
    protected $table = 'pemeriksaan';

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'balita_id',
        'umur_bulan',
        'berat_kg',
        'tinggi_cm',
        'status_gizi',
        'catatan',
        'tanggal_cek',
        'created_by',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'berat_kg' => 'decimal:2',
            'tinggi_cm' => 'decimal:2',
            'tanggal_cek' => 'date',
        ];
    }

    public function pembuat()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
