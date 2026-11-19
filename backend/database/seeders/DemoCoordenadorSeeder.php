<?php

namespace Database\Seeders;

use App\Enums\EstadoMissao;
use App\Models\AvaliacaoPrioridade;
use App\Models\Equipa;
use App\Models\FatorPrioridade;
use App\Models\HistoricoOcorrencia;
use App\Models\HistoricoMissao;
use App\Models\Missao;
use App\Models\Localizacao;
use App\Models\Ocorrencia;
use App\Models\Perfil;
use App\Models\TipoEquipa;
use App\Models\TipoOcorrencia;
use App\Models\User;
use App\Models\ValidacaoOcorrencia;
use App\Services\Avaliacoes\AvaliacaoPrioridadeService;
use App\Services\Missoes\MissaoService;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use RuntimeException;

class DemoCoordenadorSeeder extends Seeder
{
    private const DEMO_PASSWORD = 'SingeDemo2026!';

    public function run(): void
    {
        $this->call(DemoGeographySeeder::class);
        $this->call([
            PerfisSeeder::class,
            PrioridadesSeeder::class,
            TiposOcorrenciaSeeder::class,
            TiposEquipaSeeder::class,
            FatoresPrioridadeSeeder::class,
        ]);

        DB::transaction(function (): void {
            $profiles = Perfil::query()->pluck('id', 'nome');
            $types = TipoOcorrencia::query()->where('ativo', true)->pluck('id', 'nome');
            $teamTypes = TipoEquipa::query()->where('ativo', true)->pluck('id', 'nome');

            foreach ([['Administrador', 'admin'], ['Coordenador', 'coord'], ['Operador', 'operador'], ['Agente', 'agente'], ['Cidadão', 'cidadao']] as [$profile, $slug]) {
                if (! $profiles->has($profile)) {
                    throw new RuntimeException("Perfil institucional em falta: {$profile}.");
                }
                User::query()->updateOrCreate(
                    ['email' => "{$slug}@singe.test"],
                    [
                        'name' => "SINGE Demo {$profile}",
                        'password' => Hash::make(self::DEMO_PASSWORD),
                        'perfil_id' => $profiles[$profile],
                        'email_verified_at' => now(),
                    ],
                );
            }
            foreach ([['Agente', 'agente.resgate'], ['Agente', 'agente.saude'], ['Agente', 'agente.logistica']] as [$profile, $slug]) {
                User::query()->updateOrCreate(
                    ['email' => "{$slug}@singe.test"],
                    [
                        'name' => 'SINGE Demo '.ucfirst(str_replace('.', ' ', $slug)),
                        'password' => Hash::make(self::DEMO_PASSWORD),
                        'perfil_id' => $profiles[$profile],
                        'email_verified_at' => now(),
                    ],
                );
            }

            foreach ([['Equipa Resgate Maputo', 'Resgate'], ['Equipa Saúde Beira', 'Saúde'], ['Equipa Protecção Civil Nampula', 'Proteção Civil']] as [$name, $typeName]) {
                if (! $teamTypes->has($typeName)) {
                    throw new RuntimeException("Tipo de equipa institucional em falta: {$typeName}.");
                }
                Equipa::query()->firstOrCreate(
                    ['nome' => $name],
                    ['tipo_equipa_id' => $teamTypes[$typeName], 'estado' => 'disponivel', 'descricao' => 'Equipa institucional para cenários de demonstração.'],
                );
            }
            $teams = Equipa::query()->whereIn('nome', ['Equipa Resgate Maputo', 'Equipa Saúde Beira', 'Equipa Protecção Civil Nampula'])->get()->keyBy('nome');
            foreach ([
                ['agente.resgate@singe.test', 'Equipa Resgate Maputo'],
                ['agente@singe.test', 'Equipa Resgate Maputo'],
                ['agente.saude@singe.test', 'Equipa Saúde Beira'],
                ['agente.logistica@singe.test', 'Equipa Protecção Civil Nampula'],
            ] as [$email, $teamName]) {
                User::query()->where('email', $email)->update(['equipa_id' => $teams[$teamName]->id]);
            }

            $coord = User::query()->where('email', 'coord@singe.test')->firstOrFail();
            $operator = User::query()->where('email', 'operador@singe.test')->firstOrFail();
            $citizen = User::query()->where('email', 'cidadao@singe.test')->firstOrFail();
            $userLocations = [
                'coord@singe.test' => 'Zona urbana de Maputo',
                'operador@singe.test' => 'Macurungo, Beira',
                'cidadao@singe.test' => 'Zona urbana de Maputo',
                'agente.resgate@singe.test' => 'Macurungo, Beira',
                'agente@singe.test' => 'Macurungo, Beira',
                'agente.saude@singe.test' => 'Namicopo, Nampula',
                'agente.logistica@singe.test' => 'Cariacó, Pemba',
            ];
            foreach ($userLocations as $email => $reference) {
                User::query()->where('email', $email)->update([
                    'localizacao_id' => Localizacao::query()->where('endereco_referencia', $reference)->value('id'),
                ]);
            }
            $specs = [
                ['Cheias na zona baixa de Maputo', 'Inundação', 'Registada por cidadão após chuva intensa.', 'cidadao', 'registada', 1, $citizen, 'Equipa Protecção Civil Nampula', null],
                ['Incêndio habitacional na Beira', 'Incêndio', 'Fogo numa habitação com necessidade de avaliação.', 'observacao_directa', 'em_avaliacao', 4, $operator, null, null],
                ['Acidente rodoviário na EN1', 'Acidente rodoviário', 'Colisão com vítimas e necessidade de resgate.', 'telefone', 'em_atendimento', 6, $operator, 'Equipa Resgate Maputo', EstadoMissao::EM_EXECUCAO->value],
                ['Emergência médica em Nampula', 'Emergência médica', 'Várias pessoas necessitam de triagem médica urgente.', 'instituicao', 'em_atendimento', 9, $operator, 'Equipa Saúde Beira', EstadoMissao::CONCLUIDA->value],
                ['Ciclone costeiro em Pemba', 'Ciclone', 'Aviso preventivo de ventos fortes e precipitação na zona costeira.', 'instituicao', 'em_avaliacao', null, $operator, null, null],
                ['Deslizamento de terra em Nampula', 'Deslizamento de terra', 'Movimento de terras bloqueou parcialmente uma via local.', 'observacao_directa', 'resolvida', 4, $operator, null, null],
            ];

            $incidents = [];
            foreach ($specs as [$title, $typeName, $description, $origin, $state, $score, $author, $teamName, $missionState]) {
                if (! $types->has($typeName)) {
                    throw new RuntimeException("Tipo de ocorrência institucional em falta: {$typeName}.");
                }
                $incident = Ocorrencia::query()->firstOrCreate(
                    ['titulo' => $title],
                    [
                        'descricao' => $description,
                        'localizacao' => str_contains($title, 'Maputo') ? 'Maputo, Moçambique' : (str_contains($title, 'Beira') ? 'Beira, Sofala' : (str_contains($title, 'Nampula') ? 'Nampula, Moçambique' : 'EN1, Sofala')),
                        'latitude' => null,
                        'longitude' => null,
                        'tipo_ocorrencia_id' => $types[$typeName],
                        'prioridade_id' => null,
                        'utilizador_id' => $author->id,
                        'origem' => $origin,
                        'estado' => $state,
                        'data_ocorrencia' => now()->subDays($score ?? 12),
                    ],
                );
                $reference = str_contains($title, 'Maputo') ? 'Zona urbana de Maputo'
                    : (str_contains($title, 'Beira') || str_contains($title, 'EN1') ? 'Macurungo, Beira'
                        : (str_contains($title, 'Nampula') ? 'Namicopo, Nampula' : 'Cariacó, Pemba'));
                $location = Localizacao::query()->where('endereco_referencia', $reference)->firstOrFail();
                $incident->localizacao_id = $location->id;
                $incident->latitude = $location->latitude;
                $incident->longitude = $location->longitude;
                $incident->save();
                $incidents[$title] = $incident;

                HistoricoOcorrencia::query()->firstOrCreate(
                    ['ocorrencia_id' => $incident->id, 'estado_novo' => $state],
                    ['utilizador_id' => $author->id, 'estado_anterior' => null, 'observacoes' => 'Estado inicial do registo de demonstração.'],
                );

                if ($score !== null && ! AvaliacaoPrioridade::query()->where('ocorrencia_id', $incident->id)->exists()) {
                    $factors = FatorPrioridade::query()->where('ativo', true)->orderBy('id')->get();
                    (new AvaliacaoPrioridadeService)->avaliar([
                        'ocorrencia_id' => $incident->id,
                        'justificacao' => 'Avaliação de demonstração baseada nos quatro factores oficiais.',
                        'factores' => $factors->map(fn (FatorPrioridade $factor): array => [
                            'fator_prioridade_id' => $factor->id,
                            'pontuacao' => $score,
                            'observacao' => 'Valor demonstrativo coerente com a classificação de prioridade.',
                        ])->all(),
                    ], $coord);
                }

                if (in_array($state, ['em_atendimento'], true)) {
                    ValidacaoOcorrencia::query()->firstOrCreate(
                        ['ocorrencia_id' => $incident->id, 'estado' => 'VALIDADA'],
                        ['utilizador_id' => $coord->id, 'observacoes' => 'Ocorrência confirmada para resposta operacional.', 'data_validacao' => now()],
                    );
                }
            }

            // Two completed service snapshots exercise validation outcome totals.
            foreach ([[$incidents['Cheias na zona baixa de Maputo'], 'NAO_CONFIRMADA'], [$incidents['Incêndio habitacional na Beira'], 'REJEITADA']] as [$incident, $state]) {
                ValidacaoOcorrencia::query()->firstOrCreate(
                    ['ocorrencia_id' => $incident->id, 'estado' => $state],
                    ['utilizador_id' => $operator->id, 'motivo' => 'Registo exclusivamente demonstrativo para o painel.', 'data_validacao' => now()],
                );
            }

            $missions = app(MissaoService::class);
            foreach ([
                ['Acidente rodoviário na EN1', 'Equipa Resgate Maputo', EstadoMissao::EM_EXECUCAO],
                ['Emergência médica em Nampula', 'Equipa Saúde Beira', EstadoMissao::CONCLUIDA],
            ] as [$title, $teamName, $targetState]) {
                $incident = $incidents[$title];
                $team = $teams[$teamName];
                $mission = Missao::query()->where('ocorrencia_id', $incident->id)->first();
                if (! $mission) {
                    $mission = $missions->criar([
                        'ocorrencia_id' => $incident->id,
                        'equipa_id' => $team->id,
                        'objectivos' => 'Prestar assistência, avaliar riscos e reportar a situação ao centro de coordenação.',
                        'instrucoes' => 'Manter comunicação com o coordenador e respeitar os procedimentos de segurança.',
                        'data_atribuicao' => now()->subHours(4),
                        'data_prevista_conclusao' => now()->addHours(8),
                    ], $coord);
                    foreach ([EstadoMissao::EM_DESLOCACAO, EstadoMissao::EM_EXECUCAO] as $step) {
                        $mission = $missions->atualizarEstado($mission, $step->value, $coord);
                    }
                    if ($targetState === EstadoMissao::CONCLUIDA) {
                        $mission = $missions->atualizarEstado($mission, EstadoMissao::CONCLUIDA->value, $coord);
                    }
                }
                HistoricoMissao::query()->firstOrCreate(
                    ['missao_id' => $mission->id, 'operacao' => 'demonstracao_validada'],
                    ['utilizador_id' => $coord->id, 'estado_anterior' => null, 'estado_novo' => $mission->estado->value, 'observacoes' => 'Dados de demonstração gerados pelo seeder idempotente.'],
                );
            }
        });
    }
}
