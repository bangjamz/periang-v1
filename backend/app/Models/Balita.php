<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Balita extends Model
{
    protected $table = 'balita';

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'user_id',
        'nama',
        'jenis_kelamin',
        'posyandu',
        'tanggal_lahir',
        'berat_lahir',
        'tinggi_lahir',
        'alamat',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'tanggal_lahir' => 'date',
            'berat_lahir' => 'decimal:2',
            'tinggi_lahir' => 'decimal:2',
        ];
    }

    public function kader()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function pemeriksaan()
    {
        return $this->hasMany(Pemeriksaan::class, 'balita_id');
    }
}
