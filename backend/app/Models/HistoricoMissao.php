<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class HistoricoMissao extends Model
{
    protected $table = 'historico_missoes';

    protected $fillable = [
        'missao_id',
        'utilizador_id',
        'operacao',
        'estado_anterior',
        'estado_novo',
        'observacoes',
    ];

    public function missao(): BelongsTo
    {
        return $this->belongsTo(Missao::class);
    }

    public function utilizador(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
