<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ValidacaoOcorrencia extends Model
{
    protected $table = 'validacoes_ocorrencia';

    protected $fillable = [
        'ocorrencia_id',
        'ocorrencia_original_id',
        'utilizador_id',
        'estado',
        'observacoes',
        'motivo',
        'data_validacao',
    ];

    protected function casts(): array
    {
        return [
            'data_validacao' => 'datetime',
        ];
    }

    /**
     * Ocorrência que está a ser validada.
     */
    public function ocorrencia(): BelongsTo
    {
        return $this->belongsTo(
            Ocorrencia::class,
            'ocorrencia_id'
        );
    }

    /**
     * Ocorrência considerada original.
     */
    public function ocorrenciaOriginal(): BelongsTo
    {
        return $this->belongsTo(
            Ocorrencia::class,
            'ocorrencia_original_id'
        );
    }

    /**
     * Utilizador que realizou a validação.
     */
    public function utilizador(): BelongsTo
    {
        return $this->belongsTo(
            User::class,
            'utilizador_id'
        );
    }
}
