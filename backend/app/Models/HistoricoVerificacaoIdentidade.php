<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class HistoricoVerificacaoIdentidade extends Model
{
    protected $table = 'historico_verificacoes_identidade';

    protected $fillable = [
        'verificacao_identidade_id', 'utilizador_id', 'estado_anterior',
        'estado_novo', 'motivo', 'observacoes',
    ];

    /** @return BelongsTo<VerificacaoIdentidade, $this> */
    public function verificacao(): BelongsTo
    {
        return $this->belongsTo(VerificacaoIdentidade::class, 'verificacao_identidade_id');
    }

    /** @return BelongsTo<User, $this> */
    public function utilizador(): BelongsTo
    {
        return $this->belongsTo(User::class, 'utilizador_id');
    }
}
