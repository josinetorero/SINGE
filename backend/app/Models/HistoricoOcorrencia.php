<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class HistoricoOcorrencia extends Model
{
    protected $table = 'historico_ocorrencias';

    protected $fillable = [
        'ocorrencia_id',
        'utilizador_id',
        'estado_anterior',
        'estado_novo',
        'observacoes',
    ];

    /** @return BelongsTo<Ocorrencia, $this> */
    public function ocorrencia(): BelongsTo
    {
        return $this->belongsTo(
            Ocorrencia::class,
            'ocorrencia_id'
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
}
