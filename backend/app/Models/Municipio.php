<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Municipio extends Model
{
    protected $table = 'municipios';

    protected $fillable = [
        'distrito_id',
        'nome',
        'codigo',
    ];

    public function distrito(): BelongsTo
    {
        return $this->belongsTo(Distrito::class, 'distrito_id');
    }

    public function bairros(): HasMany
    {
        return $this->hasMany(Bairro::class, 'municipio_id');
    }

    public function localizacoes(): HasMany
    {
        return $this->hasMany(Localizacao::class, 'municipio_id');
    }
}
