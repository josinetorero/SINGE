<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Missao extends Model
{
    protected $table = 'missoes';

    protected $fillable = [
        'ocorrencia_id',
        'equipa_id',
        'estado',
        'data_atribuicao',
        'data_inicio',
        'data_conclusao',
        'observacoes',
    ];

    protected function casts(): array
    {
        return [
            'data_atribuicao' => 'datetime',
            'data_inicio' => 'datetime',
            'data_conclusao' => 'datetime',
        ];
    }

    public function ocorrencia(): BelongsTo
    {
        return $this->belongsTo(
            Ocorrencia::class,
            'ocorrencia_id'
        );
    }

    public function equipa(): BelongsTo
    {
        return $this->belongsTo(
            Equipa::class,
            'equipa_id'
        );
    }
}