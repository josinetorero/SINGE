<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Perfil extends Model
{
    protected $table = 'perfis';

    protected $fillable = [
        'nome',
        'descricao',
    ];

    /** @return HasMany<User, $this> */
    public function utilizadores(): HasMany
    {
        return $this->hasMany(User::class, 'perfil_id');
    }
}
