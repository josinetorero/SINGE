<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class TipoOcorrencia extends Model
{
    protected $table = 'tipos_ocorrencia';

    protected $fillable = [
        'nome',
        'descricao',
        'ativo',
    ];

    protected function casts(): array
    {
        return [
            'ativo' => 'boolean',
        ];
    }

    public function ocorrencias(): HasMany
    {
        return $this->hasMany(
            Ocorrencia::class,
            'tipo_ocorrencia_id'
        );
    }
}