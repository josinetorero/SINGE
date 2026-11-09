<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DetalheAvaliacao extends Model
{
    protected $table = 'detalhes_avaliacao';

    protected $fillable = [
        'avaliacao_prioridade_id',
        'fator_prioridade_id',
        'pontuacao',
        'peso_aplicado',
        'observacao',
    ];

    protected function casts(): array
    {
        return [
            'pontuacao' => 'decimal:2',
            'peso_aplicado' => 'decimal:2',
        ];
    }

    /** @return BelongsTo<AvaliacaoPrioridade, $this> */
    public function avaliacao(): BelongsTo
    {
        return $this->belongsTo(
            AvaliacaoPrioridade::class,
            'avaliacao_prioridade_id'
        );
    }

    /** @return BelongsTo<FatorPrioridade, $this> */
    public function fator(): BelongsTo
    {
        return $this->belongsTo(
            FatorPrioridade::class,
            'fator_prioridade_id'
        );
    }
}
