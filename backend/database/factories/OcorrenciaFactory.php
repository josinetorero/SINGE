<?php

namespace Database\Factories;

use App\Models\Ocorrencia;
use App\Models\TipoOcorrencia;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<Ocorrencia> */
class OcorrenciaFactory extends Factory
{
    protected $model = Ocorrencia::class;

    /** @return array<string, mixed> */
    public function definition(): array
    {
        return [
            'titulo' => fake()->sentence(5),
            'descricao' => fake()->paragraph(),
            'localizacao' => fake()->city().', Moçambique',
            'latitude' => fake()->latitude(-26, -10),
            'longitude' => fake()->longitude(30, 41),
            'tipo_ocorrencia_id' => fn (): int => TipoOcorrencia::query()->firstOrCreate(
                ['nome' => 'Incêndio'],
                ['descricao' => 'Tipo de ocorrência para testes.', 'ativo' => true],
            )->id,
            'prioridade_id' => null,
            'utilizador_id' => User::factory()->citizen(),
            'origem' => 'cidadao',
            'estado' => 'registada',
            'data_ocorrencia' => now()->subHours(2),
        ];
    }

    public function withStatus(string $state): static
    {
        return $this->state(fn (): array => ['estado' => $state]);
    }
}
