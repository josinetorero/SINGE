<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Prioridade extends Model
{
    protected $table = 'prioridades';

    protected $fillable = [
        'nome',
        'descricao',
        'nivel',
    ];

    protected function casts(): array
    {
        return [
            'nivel' => 'integer',
        ];
    }

    public function ocorrencias(): HasMany
    {
        return $this->hasMany(Ocorrencia::class, 'prioridade_id');
    }
}