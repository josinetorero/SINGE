<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use App\Enums\EstadoEquipa;

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

    public function tipoEquipa(): BelongsTo
    {
        return $this->belongsTo(
            TipoEquipa::class,
            'tipo_equipa_id'
        );
    }

    public function utilizadores(): HasMany
    {
        return $this->hasMany(User::class, 'equipa_id');
    }

    public function missoes(): HasMany
    {
        return $this->hasMany(Missao::class, 'equipa_id');
    }
}