<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\UpdateProfilRequest;
use Illuminate\Http\Request;

class ProfilController extends Controller
{
    /**
     * Profil kader yang sedang masuk.
     */
    public function show(Request $request)
    {
        return $request->user();
    }

    /**
     * Perbarui nama & posyandu kader yang sedang masuk.
     */
    public function update(UpdateProfilRequest $request)
    {
        $user = $request->user();
        $user->update($request->validated());

        return $user;
    }
}
