<?php

namespace Database\Factories;

use App\Enums\EstadoMissao;
use App\Models\Equipa;
use App\Models\HistoricoMissao;
use App\Models\Missao;
use App\Models\Ocorrencia;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<Missao> */
class MissaoFactory extends Factory
{
    protected $model = Missao::class;

    /** @return array<string, mixed> */
    public function definition(): array
    {
        return [
            'ocorrencia_id' => Ocorrencia::factory(),
            'equipa_id' => Equipa::factory(),
            'coordenador_id' => User::factory()->coordinator(),
            'estado' => EstadoMissao::ATRIBUIDA->value,
            'data_atribuicao' => now(),
            'data_inicio' => null,
            'data_prevista_conclusao' => now()->addDay(),
            'data_conclusao' => null,
            'objectivos' => 'Objectivos de missão para cenário automatizado.',
            'instrucoes' => 'Instruções de missão para cenário automatizado.',
            'observacoes' => null,
        ];
    }

    public function emExecucao(): static
    {
        return $this->state(fn (): array => [
            'estado' => EstadoMissao::EM_EXECUCAO->value,
            'data_inicio' => now(),
        ]);
    }

    public function concluida(): static
    {
        return $this->state(fn (): array => [
            'estado' => EstadoMissao::CONCLUIDA->value,
            'data_inicio' => now()->subHour(),
            'data_conclusao' => now(),
        ]);
    }

    public function configure(): static
    {
        return $this->afterCreating(function (Missao $mission): void {
            $mission->equipa()->update(['estado' => in_array($mission->getRawOriginal('estado'), [
                EstadoMissao::ATRIBUIDA->value,
                EstadoMissao::EM_DESLOCACAO->value,
                EstadoMissao::EM_EXECUCAO->value,
            ], true) ? 'em_missao' : 'disponivel']);
            HistoricoMissao::query()->firstOrCreate(
                ['missao_id' => $mission->id, 'operacao' => 'criada'],
                [
                    'utilizador_id' => $mission->coordenador_id,
                    'estado_anterior' => null,
                    'estado_novo' => $mission->getRawOriginal('estado'),
                    'observacoes' => 'Missão criada pela factory de testes.',
                ],
            );
        });
    }
}
