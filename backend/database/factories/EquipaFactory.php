<?php

namespace Database\Factories;

use App\Models\Equipa;
use App\Models\TipoEquipa;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<Equipa> */
class EquipaFactory extends Factory
{
    protected $model = Equipa::class;

    /** @return array<string, mixed> */
    public function definition(): array
    {
        return [
            'nome' => fake()->unique()->company().' Response Team',
            'tipo_equipa_id' => fn (): int => TipoEquipa::query()->firstOrCreate(
                ['nome' => 'Resgate'],
                ['descricao' => 'Equipa de resgate criada por factory.', 'ativo' => true],
            )->id,
            'estado' => 'disponivel',
            'descricao' => 'Equipa gerada por factory para testes automatizados.',
        ];
    }

    public function unavailable(): static
    {
        return $this->state(fn (): array => ['estado' => 'indisponivel']);
    }
}
