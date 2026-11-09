<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Quarteirao extends Model
{
    protected $table = 'quarteiroes';

    protected $fillable = [
        'bairro_id',
        'nome',
        'descricao',
    ];

    /** @return BelongsTo<Bairro, $this> */
    public function bairro(): BelongsTo
    {
        return $this->belongsTo(Bairro::class, 'bairro_id');
    }

    /** @return HasMany<Localizacao, $this> */
    public function localizacoes(): HasMany
    {
        return $this->hasMany(Localizacao::class, 'quarteirao_id');
    }
}
