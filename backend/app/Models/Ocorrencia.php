<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
class Ocorrencia extends Model
{
    protected $table = 'ocorrencias';

    protected $fillable = [
        'titulo',
        'descricao',
        'localizacao',
        'latitude',
        'longitude',
        'tipo_ocorrencia_id',
        'prioridade_id',
        'utilizador_id',
        'estado',
    ];

    protected function casts(): array
    {
        return [
            'latitude' => 'decimal:7',
            'longitude' => 'decimal:7',
        ];
    }

    public function tipoOcorrencia(): BelongsTo
    {
        return $this->belongsTo(
            TipoOcorrencia::class,
            'tipo_ocorrencia_id'
        );
    }

    public function prioridade(): BelongsTo
    {
        return $this->belongsTo(
            Prioridade::class,
            'prioridade_id'
        );
    }

    public function utilizador(): BelongsTo
    {
        return $this->belongsTo(
            User::class,
            'utilizador_id'
        );
    }

    public function missoes(): HasMany
{
    return $this->hasMany(Missao::class, 'ocorrencia_id');
}

public function historico(): HasMany
{
    return $this->hasMany(
        HistoricoOcorrencia::class,
        'ocorrencia_id'
    );
} 
}