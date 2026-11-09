<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Localizacao extends Model
{
    protected $table = 'localizacoes';

    protected $fillable = [
        'provincia_id',
        'distrito_id',
        'municipio_id',
        'posto_administrativo_id',
        'bairro_id',
        'quarteirao_id',
        'endereco_referencia',
        'latitude',
        'longitude',
    ];

    protected function casts(): array
    {
        return [
            'latitude' => 'decimal:7',
            'longitude' => 'decimal:7',
        ];
    }

    /** @return BelongsTo<Provincia, $this> */
    public function provincia(): BelongsTo
    {
        return $this->belongsTo(Provincia::class, 'provincia_id');
    }

    /** @return BelongsTo<Distrito, $this> */
    public function distrito(): BelongsTo
    {
        return $this->belongsTo(Distrito::class, 'distrito_id');
    }

    /** @return BelongsTo<Municipio, $this> */
    public function municipio(): BelongsTo
    {
        return $this->belongsTo(Municipio::class, 'municipio_id');
    }

    /** @return BelongsTo<PostoAdministrativo, $this> */
    public function postoAdministrativo(): BelongsTo
    {
        return $this->belongsTo(PostoAdministrativo::class, 'posto_administrativo_id');
    }

    /** @return BelongsTo<Bairro, $this> */
    public function bairro(): BelongsTo
    {
        return $this->belongsTo(Bairro::class, 'bairro_id');
    }

    /** @return BelongsTo<Quarteirao, $this> */
    public function quarteirao(): BelongsTo
    {
        return $this->belongsTo(Quarteirao::class, 'quarteirao_id');
    }

    /** @return HasMany<User, $this> */
    public function utilizadores(): HasMany
    {
        return $this->hasMany(User::class, 'localizacao_id');
    }

    /** @return HasMany<Ocorrencia, $this> */
    public function ocorrencias(): HasMany
    {
        return $this->hasMany(Ocorrencia::class, 'localizacao_id');
    }
}
