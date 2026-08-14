<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class StandarWho extends Model
{
    protected $table = 'standar_who';

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'jenis_kelamin',
        'umur_bulan',
        'berat_median_kg',
        'tinggi_median_cm',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'umur_bulan' => 'integer',
            'berat_median_kg' => 'decimal:2',
            'tinggi_median_cm' => 'decimal:2',
        ];
    }
}
