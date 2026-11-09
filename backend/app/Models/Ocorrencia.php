<?php

namespace App\Models;

use App\Enums\EstadoOcorrencia;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Ocorrencia extends Model
{
    protected $table = 'ocorrencias';

    protected $fillable = [
        'titulo',
        'descricao',
        'localizacao',
        'localizacao_id',
        'latitude',
        'longitude',
        'tipo_ocorrencia_id',
        'prioridade_id',
        'utilizador_id',
        'estado',
    ];

    protected function casts(): array
    {
        return [
            'latitude' => 'decimal:7',
            'longitude' => 'decimal:7',
            'estado' => EstadoOcorrencia::class,
        ];
    }

    /** @return BelongsTo<TipoOcorrencia, $this> */
    public function tipoOcorrencia(): BelongsTo
    {
        return $this->belongsTo(
            TipoOcorrencia::class,
            'tipo_ocorrencia_id'
        );
    }

    /** @return BelongsTo<Prioridade, $this> */
    public function prioridade(): BelongsTo
    {
        return $this->belongsTo(
            Prioridade::class,
            'prioridade_id'
        );
    }

    /** @return BelongsTo<User, $this> */
    public function utilizador(): BelongsTo
    {
        return $this->belongsTo(
            User::class,
            'utilizador_id'
        );
    }

    /** @return BelongsTo<Localizacao, $this> */
    public function localizacaoGeografica(): BelongsTo
    {
        return $this->belongsTo(Localizacao::class, 'localizacao_id');
    }

    /** @return HasMany<Missao, $this> */
    public function missoes(): HasMany
    {
        return $this->hasMany(Missao::class, 'ocorrencia_id');
    }

    /** @return HasMany<HistoricoOcorrencia, $this> */
    public function historico(): HasMany
    {
        return $this->hasMany(
            HistoricoOcorrencia::class,
            'ocorrencia_id'
        );
    }

    /** @return HasMany<Evidencia, $this> */
    public function evidencias(): HasMany
    {
        return $this->hasMany(Evidencia::class, 'ocorrencia_id');
    }

    /** @return HasMany<AvaliacaoPrioridade, $this> */
    public function avaliacoesPrioridade(): HasMany
    {
        return $this->hasMany(AvaliacaoPrioridade::class, 'ocorrencia_id');
    }

    /** @return HasMany<ValidacaoOcorrencia, $this> */
    public function validacoes(): HasMany
    {
        return $this->hasMany(ValidacaoOcorrencia::class, 'ocorrencia_id');
    }

    /** @return HasMany<Notificacao, $this> */
    public function notificacoes(): HasMany
    {
        return $this->hasMany(Notificacao::class, 'ocorrencia_id');
    }
}
