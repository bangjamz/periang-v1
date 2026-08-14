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
        'riwayat_lahir',
        'imunisasi',
        'asi_eksklusif',
        'sanitasi',
        'pendapatan_keluarga',
    ];

    public function balita()
    {
        return $this->belongsTo(Balita::class, 'balita_id');
    }
}
