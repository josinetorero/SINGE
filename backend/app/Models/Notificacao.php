<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Notificacao extends Model
{
    protected $table = 'notificacoes';

    protected $fillable = [
        'utilizador_id',
        'titulo',
        'mensagem',
        'tipo',
        'ocorrencia_id',
        'missao_id',
        'lida',
        'data_leitura',
    ];

    protected function casts(): array
    {
        return [
            'lida' => 'boolean',
            'data_leitura' => 'datetime',
        ];
    }

    /** @return BelongsTo<User, $this> */
    public function utilizador(): BelongsTo
    {
        return $this->belongsTo(User::class, 'utilizador_id');
    }

    /** @return BelongsTo<Ocorrencia, $this> */
    public function ocorrencia(): BelongsTo
    {
        return $this->belongsTo(Ocorrencia::class, 'ocorrencia_id');
    }

    /** @return BelongsTo<Missao, $this> */
    public function missao(): BelongsTo
    {
        return $this->belongsTo(Missao::class, 'missao_id');
    }
}
