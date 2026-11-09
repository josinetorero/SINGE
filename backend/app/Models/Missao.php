<?php

namespace App\Models;

use App\Enums\EstadoMissao;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Missao extends Model
{
    protected $table = 'missoes';

    protected $fillable = [
        'ocorrencia_id',
        'equipa_id',
        'coordenador_id',
        'estado',
        'data_atribuicao',
        'data_inicio',
        'data_conclusao',
        'observacoes',
    ];

    protected function casts(): array
    {
        return [
            'estado' => EstadoMissao::class,
            'data_atribuicao' => 'datetime',
            'data_inicio' => 'datetime',
            'data_conclusao' => 'datetime',
        ];
    }

    /** @return BelongsTo<Ocorrencia, $this> */
    public function ocorrencia(): BelongsTo
    {
        return $this->belongsTo(
            Ocorrencia::class,
            'ocorrencia_id'
        );
    }

    /** @return BelongsTo<User, $this> */
    public function coordenador(): BelongsTo
    {
        return $this->belongsTo(User::class, 'coordenador_id');
    }

    /** @return BelongsTo<Equipa, $this> */
    public function equipa(): BelongsTo
    {
        return $this->belongsTo(
            Equipa::class,
            'equipa_id'
        );
    }

    /** @return HasMany<Notificacao, $this> */
    public function notificacoes(): HasMany
    {
        return $this->hasMany(Notificacao::class, 'missao_id');
    }
}
