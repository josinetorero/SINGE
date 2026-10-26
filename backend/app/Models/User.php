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

    public function ocorrenciasRegistadas(): HasMany
    {
        return $this->hasMany(Ocorrencia::class, 'utilizador_id');
    }
}