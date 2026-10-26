<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class TipoEquipa extends Model
{
    protected $table = 'tipos_equipa';

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

    public function equipas(): HasMany
    {
        return $this->hasMany(
            Equipa::class,
            'tipo_equipa_id'
        );
    }
}