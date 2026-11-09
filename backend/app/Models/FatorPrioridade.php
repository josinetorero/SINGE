<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class FatorPrioridade extends Model
{
    protected $table = 'fatores_prioridade';

    protected $fillable = [
        'nome',
        'descricao',
        'peso',
        'ativo',
    ];

    protected function casts(): array
    {
        return [
            'peso' => 'decimal:2',
            'ativo' => 'boolean',
        ];
    }

    /** @return HasMany<DetalheAvaliacao, $this> */
    public function detalhesAvaliacoes(): HasMany
    {
        return $this->hasMany(DetalheAvaliacao::class, 'fator_prioridade_id');
    }
}
