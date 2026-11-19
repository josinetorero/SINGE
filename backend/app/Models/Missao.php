<?php

namespace App\Models;

use App\Enums\EstadoMissao;
use Database\Factories\MissaoFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Missao extends Model
{
    /** @use HasFactory<MissaoFactory> */
    use HasFactory;

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
        'objectivos',
        'instrucoes',
        'data_prevista_conclusao',
        'coordenador_id',
    ];

    protected function casts(): array
    {
        return [
            'estado' => EstadoMissao::class,
            'data_atribuicao' => 'datetime',
            'data_inicio' => 'datetime',
            'data_conclusao' => 'datetime',
            'data_prevista_conclusao' => 'datetime',
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

    /** @return HasMany<HistoricoMissao, $this> */
    public function historico(): HasMany
    {
        return $this->hasMany(HistoricoMissao::class)->latest();
    }

    /** @return HasMany<Notificacao, $this> */
    public function notificacoes(): HasMany
    {
        return $this->hasMany(Notificacao::class, 'missao_id');
    }
}
