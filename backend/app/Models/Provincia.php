<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Provincia extends Model
{
    protected $table = 'provincias';

    protected $fillable = [
        'nome',
        'codigo',
    ];

    /** @return HasMany<Distrito, $this> */
    public function distritos(): HasMany
    {
        return $this->hasMany(Distrito::class, 'provincia_id');
    }

    /** @return HasMany<Localizacao, $this> */
    public function localizacoes(): HasMany
    {
        return $this->hasMany(Localizacao::class, 'provincia_id');
    }
}
