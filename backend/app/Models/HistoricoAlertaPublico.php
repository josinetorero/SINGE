<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class HistoricoAlertaPublico extends Model
{
    protected $table = 'historico_alertas_publicos';

    protected $fillable = [
        'alerta_publico_id',
        'utilizador_id',
        'operacao',
        'estado_anterior',
        'estado_novo',
        'observacoes',
    ];

    public function alerta(): BelongsTo
    {
        return $this->belongsTo(AlertaPublico::class, 'alerta_publico_id');
    }

    public function utilizador(): BelongsTo
    {
        return $this->belongsTo(User::class, 'utilizador_id');
    }
}
