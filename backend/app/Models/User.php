<?php

namespace App\Models;

use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
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

    /** @return BelongsTo<Perfil, $this> */
    public function perfil(): BelongsTo
    {
        return $this->belongsTo(Perfil::class, 'perfil_id');
    }

    /** @return BelongsTo<Equipa, $this> */
    public function equipa(): BelongsTo
    {
        return $this->belongsTo(Equipa::class, 'equipa_id');
    }

    /** @return BelongsTo<Localizacao, $this> */
    public function localizacao(): BelongsTo
    {
        return $this->belongsTo(Localizacao::class, 'localizacao_id');
    }

    /** @return HasMany<Ocorrencia, $this> */
    public function ocorrenciasRegistadas(): HasMany
    {
        return $this->hasMany(Ocorrencia::class, 'utilizador_id');
    }

    /** @return HasMany<Evidencia, $this> */
    public function evidencias(): HasMany
    {
        return $this->hasMany(Evidencia::class, 'utilizador_id');
    }

    /** @return HasMany<AvaliacaoPrioridade, $this> */
    public function avaliacoesPrioridade(): HasMany
    {
        return $this->hasMany(AvaliacaoPrioridade::class, 'utilizador_id');
    }

    /** @return HasMany<DocumentoIdentificacao, $this> */
    public function documentosIdentificacao(): HasMany
    {
        return $this->hasMany(DocumentoIdentificacao::class, 'utilizador_id');
    }

    /** @return HasMany<VerificacaoIdentidade, $this> */
    public function verificacoesIdentidadeSolicitadas(): HasMany
    {
        return $this->hasMany(VerificacaoIdentidade::class, 'utilizador_solicitante_id');
    }

    /** @return HasMany<VerificacaoIdentidade, $this> */
    public function verificacoesIdentidadeAnalisadas(): HasMany
    {
        return $this->hasMany(VerificacaoIdentidade::class, 'utilizador_verificador_id');
    }

    /** @return HasMany<HistoricoOcorrencia, $this> */
    public function historicoOcorrencias(): HasMany
    {
        return $this->hasMany(HistoricoOcorrencia::class, 'utilizador_id');
    }

    /** @return HasMany<Missao, $this> */
    public function missoesAtribuidas(): HasMany
    {
        return $this->hasMany(Missao::class, 'coordenador_id');
    }

    /** @return HasMany<Notificacao, $this> */
    public function notificacoes(): HasMany
    {
        return $this->hasMany(Notificacao::class, 'utilizador_id');
    }
}
