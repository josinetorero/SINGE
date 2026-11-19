<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Bairro extends Model
{
    protected $table = 'bairros';

    protected $fillable = [
        'municipio_id',
        'posto_administrativo_id',
        'nome',
        'codigo',
    ];

    /** @return BelongsTo<Municipio, $this> */
    public function municipio(): BelongsTo
    {
        return $this->belongsTo(Municipio::class, 'municipio_id');
    }

    /** @return BelongsTo<PostoAdministrativo, $this> */
    public function postoAdministrativo(): BelongsTo
    {
        return $this->belongsTo(PostoAdministrativo::class, 'posto_administrativo_id');
    }

    /** @return HasMany<Quarteirao, $this> */
    public function quarteiroes(): HasMany
    {
        return $this->hasMany(Quarteirao::class, 'bairro_id');
    }

    /** @return HasMany<Localizacao, $this> */
    public function localizacoes(): HasMany
    {
        return $this->hasMany(Localizacao::class, 'bairro_id');
    }
}
