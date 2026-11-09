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

    /** @return BelongsTo<Ocorrencia, $this> */
    public function ocorrencia(): BelongsTo
    {
        return $this->belongsTo(Ocorrencia::class);
    }

    /** @return BelongsTo<User, $this> */
    public function utilizador(): BelongsTo
    {
        return $this->belongsTo(User::class, 'utilizador_id');
    }
}
