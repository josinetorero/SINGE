<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Distrito extends Model
{
    protected $table = 'distritos';

    protected $fillable = [
        'provincia_id',
        'nome',
        'codigo',
    ];

    public function provincia(): BelongsTo
    {
        return $this->belongsTo(Provincia::class, 'provincia_id');
    }

    public function municipios(): HasMany
    {
        return $this->hasMany(Municipio::class, 'distrito_id');
    }

    public function postosAdministrativos(): HasMany
    {
        return $this->hasMany(PostoAdministrativo::class, 'distrito_id');
    }

    public function localizacoes(): HasMany
    {
        return $this->hasMany(Localizacao::class, 'distrito_id');
    }
}
