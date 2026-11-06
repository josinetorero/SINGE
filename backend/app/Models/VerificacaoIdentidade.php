<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class VerificacaoIdentidade extends Model
{
    protected $table = 'verificacoes_identidade';

    protected $fillable = [
        'documento_identificacao_id',
        'utilizador_verificador_id',
        'estado',
        'observacoes',
        'motivo_rejeicao',
        'data_verificacao',
    ];

    protected function casts(): array
    {
        return [
            'data_verificacao' => 'datetime',
        ];
    }

    public function documentoIdentificacao(): BelongsTo
    {
        return $this->belongsTo(DocumentoIdentificacao::class, 'documento_identificacao_id');
    }

    public function utilizadorVerificador(): BelongsTo
    {
        return $this->belongsTo(User::class, 'utilizador_verificador_id');
    }
}
