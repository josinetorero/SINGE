<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class AvaliacaoPrioridade extends Model
{
    protected $table = 'avaliacoes_prioridade';

    protected $fillable = [
        'ocorrencia_id',
        'utilizador_id',
        'prioridade_id',
        'pontuacao_total',
        'justificacao',
    ];

    protected function casts(): array
    {
        return [
            'pontuacao_total' => 'decimal:2',
        ];
    }

    /** @return BelongsTo<Ocorrencia, $this> */
    public function ocorrencia(): BelongsTo
    {
        return $this->belongsTo(Ocorrencia::class);
    }

    /** @return BelongsTo<User, $this> */
    public function utilizador(): BelongsTo
    {
        return $this->belongsTo(User::class, 'utilizador_id');
    }

    /** @return BelongsTo<Prioridade, $this> */
    public function prioridade(): BelongsTo
    {
        return $this->belongsTo(Prioridade::class);
    }

    /** @return HasMany<DetalheAvaliacao, $this> */
    public function detalhes(): HasMany
    {
        return $this->hasMany(DetalheAvaliacao::class, 'avaliacao_prioridade_id');
    }
}
