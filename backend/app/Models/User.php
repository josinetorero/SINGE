<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'perfil_id',
        'equipa_id',
        'localizacao_id',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function perfil(): BelongsTo
    {
        return $this->belongsTo(Perfil::class, 'perfil_id');
    }

    public function equipa(): BelongsTo
    {
        return $this->belongsTo(Equipa::class, 'equipa_id');
    }

    public function localizacao(): BelongsTo
    {
        return $this->belongsTo(Localizacao::class, 'localizacao_id');
    }

    public function ocorrenciasRegistadas(): HasMany
    {
        return $this->hasMany(Ocorrencia::class, 'utilizador_id');
    }

    public function evidencias(): HasMany
    {
        return $this->hasMany(Evidencia::class, 'utilizador_id');
    }

    public function avaliacoesPrioridade(): HasMany
    {
        return $this->hasMany(AvaliacaoPrioridade::class, 'utilizador_id');
    }

    public function documentosIdentificacao(): HasMany
    {
        return $this->hasMany(DocumentoIdentificacao::class, 'utilizador_id');
    }

    public function historicoOcorrencias(): HasMany
    {
        return $this->hasMany(HistoricoOcorrencia::class, 'utilizador_id');
    }

    public function missoesAtribuidas(): HasMany
    {
        return $this->hasMany(Missao::class, 'coordenador_id');
    }

    public function notificacoes(): HasMany
    {
        return $this->hasMany(Notificacao::class, 'utilizador_id');
    }
}