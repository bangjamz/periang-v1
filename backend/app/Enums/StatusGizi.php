<?php

namespace App\Enums;

enum StatusGizi: string
{
    case Normal = 'normal';
    case Kurang = 'kurang';
    case Buruk = 'buruk';
    case Pendek = 'pendek';
}
