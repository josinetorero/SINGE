<?php

namespace App\Models;

use App\Enums\EstadoEquipa;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Equipa extends Model
{
    protected $table = 'equipas';

    protected $fillable = [
        'nome',
        'tipo_equipa_id',
        'estado',
        'descricao',
    ];

    protected function casts(): array
    {
        return [
            'estado' => EstadoEquipa::class,
        ];
    }

    /** @return BelongsTo<TipoEquipa, $this> */
    public function tipoEquipa(): BelongsTo
    {
        return $this->belongsTo(
            TipoEquipa::class,
            'tipo_equipa_id'
        );
    }

    /** @return HasMany<User, $this> */
    public function utilizadores(): HasMany
    {
        return $this->hasMany(User::class, 'equipa_id');
    }

    /** @return HasMany<Missao, $this> */
    public function missoes(): HasMany
    {
        return $this->hasMany(Missao::class, 'equipa_id');
    }
}
