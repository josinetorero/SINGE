<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ValidacaoOcorrencia extends Model
{
    protected $table = 'validacoes_ocorrencia';

    protected $fillable = [
        'ocorrencia_id',
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

    /** @return BelongsTo<Ocorrencia, $this> */
    public function ocorrencia(): BelongsTo
    {
        return $this->belongsTo(Ocorrencia::class, 'ocorrencia_id');
    }

    /** @return BelongsTo<User, $this> */
    public function utilizador(): BelongsTo
    {
        return $this->belongsTo(User::class, 'utilizador_id');
    }
}
