<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class AlertaPublico extends Model
{
    protected $table = 'alertas_publicos';

    protected $fillable = [
        'titulo',
        'descricao',
        'tipo_perigo',
        'severidade',
        'localizacao_id',
        'area_geografica',
        'data_publicacao',
        'valido_desde',
        'valido_ate',
        'fonte',
        'utilizador_id',
        'estado',
        'recomendacoes',
    ];

    protected function casts(): array
    {
        return [
            'data_publicacao' => 'datetime',
            'valido_desde' => 'datetime',
            'valido_ate' => 'datetime',
        ];
    }

    public function utilizador(): BelongsTo
    {
        return $this->belongsTo(User::class, 'utilizador_id');
    }

    public function localizacao(): BelongsTo
    {
        return $this->belongsTo(Localizacao::class, 'localizacao_id');
    }

    public function historico(): HasMany
    {
        return $this->hasMany(HistoricoAlertaPublico::class, 'alerta_publico_id')->latest();
    }
}
