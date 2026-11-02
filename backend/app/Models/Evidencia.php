<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Evidencia extends Model
{
    protected $table = 'evidencias';

    protected $fillable = [
        'ocorrencia_id',
        'utilizador_id',
        'nome_ficheiro',
        'caminho_ficheiro',
        'tipo_mime',
        'tamanho_bytes',
        'descricao',
    ];

    protected function casts(): array
    {
        return [
            'tamanho_bytes' => 'integer',
        ];
    }

    public function ocorrencia(): BelongsTo
    {
        return $this->belongsTo(Ocorrencia::class);
    }

    public function utilizador(): BelongsTo
    {
        return $this->belongsTo(User::class, 'utilizador_id');
    }
}