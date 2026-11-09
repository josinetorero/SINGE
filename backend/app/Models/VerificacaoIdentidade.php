<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class VerificacaoIdentidade extends Model
{
    protected $table = 'verificacoes_identidade';

    protected $fillable = [
        'documento_identificacao_id',
        'utilizador_solicitante_id',
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

    /** @return BelongsTo<DocumentoIdentificacao, $this> */
    public function documentoIdentificacao(): BelongsTo
    {
        return $this->belongsTo(DocumentoIdentificacao::class, 'documento_identificacao_id');
    }

    /** @return BelongsTo<User, $this> */
    public function utilizadorVerificador(): BelongsTo
    {
        return $this->belongsTo(User::class, 'utilizador_verificador_id');
    }

    /** @return BelongsTo<User, $this> */
    public function utilizadorSolicitante(): BelongsTo
    {
        return $this->belongsTo(User::class, 'utilizador_solicitante_id');
    }
}
