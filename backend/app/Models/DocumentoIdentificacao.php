<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class DocumentoIdentificacao extends Model
{
    protected $table = 'documentos_identificacao';

    protected $fillable = [
        'utilizador_id',
        'tipo_documento',
        'numero_documento',
        'nome_documento',
        'data_nascimento',
        'data_emissao',
        'data_validade',
        'caminho_documento',
        'estado_verificacao',
    ];

    protected function casts(): array
    {
        return [
            'data_nascimento' => 'date',
            'data_emissao' => 'date',
            'data_validade' => 'date',
        ];
    }

    public function utilizador(): BelongsTo
    {
        return $this->belongsTo(User::class, 'utilizador_id');
    }

    public function verificacoes(): HasMany
    {
        return $this->hasMany(VerificacaoIdentidade::class, 'documento_identificacao_id');
    }
}
