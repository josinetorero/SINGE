<?php

namespace App\Services\Coordenacao;

use App\Models\AvaliacaoPrioridade;
use App\Models\AlertaPublico;
use App\Models\Missao;
use App\Models\Ocorrencia;
use App\Models\Prioridade;
use App\Models\TipoOcorrencia;
use App\Models\ValidacaoOcorrencia;
use App\Enums\EstadoEquipa;
use App\Enums\EstadoMissao;
use App\Enums\EstadoOcorrencia;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;

class CoordenadorService
{
    /** @return array<string, mixed> */
    public function dashboard(): array
    {
        $ocorrenciasPorEstado = Ocorrencia::query()
            ->selectRaw('estado, COUNT(*) as total')
            ->groupBy('estado')
            ->pluck('total', 'estado');
        $ocorrenciasPorPrioridade = Prioridade::query()
            ->leftJoin('ocorrencias', 'ocorrencias.prioridade_id', '=', 'prioridades.id')
            ->selectRaw('prioridades.id, prioridades.nome, prioridades.nivel, COUNT(ocorrencias.id) as total')
            ->groupBy('prioridades.id', 'prioridades.nome', 'prioridades.nivel')
            ->orderBy('prioridades.nivel')
            ->get();
        $equipas = DB::table('equipas')->selectRaw('estado, COUNT(*) as total')->groupBy('estado')->pluck('total', 'estado');
        $missoes = DB::table('missoes')->selectRaw('estado, COUNT(*) as total')->groupBy('estado')->pluck('total', 'estado');
        $ultimasValidacoes = DB::table('validacoes_ocorrencia')
            ->selectRaw('MAX(id) as id')
            ->groupBy('ocorrencia_id');
        $validacoes = DB::table('validacoes_ocorrencia as v')
            ->joinSub($ultimasValidacoes, 'latest', 'v.id', '=', 'latest.id')
            ->selectRaw('v.estado, COUNT(*) as total')
            ->groupBy('v.estado')
            ->pluck('total', 'estado');
        $ocorrenciasPorTipo = DB::table('tipos_ocorrencia as t')
            ->leftJoin('ocorrencias as o', 'o.tipo_ocorrencia_id', '=', 't.id')
            ->selectRaw('t.id, t.nome, COUNT(o.id) as total')
            ->groupBy('t.id', 't.nome')
            ->orderBy('t.nome')
            ->get();
        $evolucaoOcorrencias = DB::table('ocorrencias')
            ->where('created_at', '>=', now()->subDays(13)->startOfDay())
            ->selectRaw('DATE(created_at) as dia, COUNT(*) as total')
            ->groupByRaw('DATE(created_at)')->orderBy('dia')->get();
        $missoesPorEstado = DB::table('missoes')->selectRaw('estado, COUNT(*) as total')->groupBy('estado')->orderBy('estado')->get();

        return [
            'ocorrencias' => [
                'total' => (int) $ocorrenciasPorEstado->sum(),
                'pendentes_analise' => (int) $ocorrenciasPorEstado->get(EstadoOcorrencia::REGISTADA->value, 0)
                    + (int) $ocorrenciasPorEstado->get(EstadoOcorrencia::EM_AVALIACAO->value, 0),
                'sem_prioridade' => Ocorrencia::query()->whereNull('prioridade_id')->count(),
                'validadas' => (int) $validacoes->get('VALIDADA', 0),
                'rejeitadas' => (int) $validacoes->get('REJEITADA', 0),
                'nao_confirmadas' => (int) $validacoes->get('NAO_CONFIRMADA', 0),
                'por_prioridade' => $ocorrenciasPorPrioridade,
                'por_estado' => $ocorrenciasPorEstado,
                'por_tipo' => $ocorrenciasPorTipo,
                'evolucao_14_dias' => $evolucaoOcorrencias,
            ],
            'equipas' => [
                'total' => (int) $equipas->sum(),
                'disponiveis' => (int) $equipas->get(EstadoEquipa::DISPONIVEL->value, 0),
                'em_missao' => (int) $equipas->get(EstadoEquipa::EM_MISSAO->value, 0),
                'indisponiveis' => (int) $equipas->get(EstadoEquipa::INDISPONIVEL->value, 0),
            ],
            'missoes' => [
                'activas' => (int) $missoes->get(EstadoMissao::EM_DESLOCACAO->value, 0)
                    + (int) $missoes->get(EstadoMissao::EM_EXECUCAO->value, 0),
                'pendentes' => (int) $missoes->get(EstadoMissao::ATRIBUIDA->value, 0),
                'total' => (int) $missoes->sum(),
                'concluidas' => (int) $missoes->get(EstadoMissao::CONCLUIDA->value, 0),
                'canceladas' => (int) $missoes->get(EstadoMissao::CANCELADA->value, 0),
            ],
            'alertas_publicados' => AlertaPublico::query()->where('estado', 'publicado')->count(),
            'recentes' => Ocorrencia::query()->with(['tipoOcorrencia', 'prioridade'])
                ->latest()->limit(8)->get(),
            'mapa_ocorrencias' => Ocorrencia::query()
                ->with(['tipoOcorrencia', 'prioridade', 'localizacaoGeografica.provincia', 'localizacaoGeografica.distrito'])
                ->where(function ($query): void {
                    $query->whereNotNull('latitude')->orWhereNotNull('longitude')
                        ->orWhereHas('localizacaoGeografica', fn ($location) => $location->whereNotNull('latitude')->whereNotNull('longitude'));
                })
                ->latest()->limit(100)->get(),
            'missoes_por_estado' => $missoesPorEstado,
            'actividade_recente' => AvaliacaoPrioridade::query()
                ->with(['utilizador', 'prioridade', 'ocorrencia'])
                ->latest()->limit(8)->get(),
            'historico_missoes' => DB::table('historico_missoes')
                ->join('users', 'users.id', '=', 'historico_missoes.utilizador_id')
                ->select([
                    'historico_missoes.id',
                    'historico_missoes.missao_id',
                    'historico_missoes.operacao',
                    'historico_missoes.estado_anterior',
                    'historico_missoes.estado_novo',
                    'historico_missoes.created_at',
                    'users.name as responsavel',
                ])
                ->latest('historico_missoes.created_at')
                ->limit(8)
                ->get(),
        ];
    }

    public function listarTiposOcorrencia(): \Illuminate\Database\Eloquent\Collection
    {
        return TipoOcorrencia::query()->where('ativo', true)->orderBy('nome')->get(['id', 'nome']);
    }

    /** @param array<string, mixed> $filtros */
    public function listarOcorrencias(array $filtros, int $porPagina = 20): LengthAwarePaginator
    {
        return Ocorrencia::query()
            ->with([
                'tipoOcorrencia',
                'prioridade',
                'localizacaoGeografica.provincia',
                'localizacaoGeografica.distrito',
                'validacoes' => fn ($query) => $query->latest()->limit(1),
            ])
            ->when(isset($filtros['estado']), fn ($query) => $query->where('estado', $filtros['estado']))
            ->when(isset($filtros['tipo_ocorrencia_id']), fn ($query) => $query->where('tipo_ocorrencia_id', $filtros['tipo_ocorrencia_id']))
            ->when(isset($filtros['prioridade_id']), fn ($query) => $query->where('prioridade_id', $filtros['prioridade_id']))
            ->when(filter_var($filtros['sem_prioridade'] ?? false, FILTER_VALIDATE_BOOLEAN), fn ($query) => $query->whereNull('prioridade_id'))
            ->when(isset($filtros['provincia']), fn ($query) => $query->whereHas(
                'localizacaoGeografica.provincia',
                fn ($location) => $location->where('nome', 'like', '%'.$filtros['provincia'].'%'),
            ))
            ->when(isset($filtros['distrito']), fn ($query) => $query->whereHas(
                'localizacaoGeografica.distrito',
                fn ($location) => $location->where('nome', 'like', '%'.$filtros['distrito'].'%'),
            ))
            ->when(isset($filtros['q']), function ($query) use ($filtros): void {
                $term = trim((string) $filtros['q']);
                $query->where(fn ($builder) => $builder
                    ->where('titulo', 'like', "%{$term}%")
                    ->orWhere('localizacao', 'like', "%{$term}%")
                    ->orWhereHas('localizacaoGeografica.provincia', fn ($location) => $location->where('nome', 'like', "%{$term}%"))
                    ->orWhereHas('localizacaoGeografica.distrito', fn ($location) => $location->where('nome', 'like', "%{$term}%")));
            })
            ->latest()
            ->paginate($porPagina);
    }

    public function consultarOcorrencia(int $id): Ocorrencia
    {
        return Ocorrencia::query()->with([
            'utilizador',
            'tipoOcorrencia',
            'prioridade',
            'localizacaoGeografica.provincia',
            'localizacaoGeografica.distrito',
            'localizacaoGeografica.municipio',
            'historico.utilizador',
            'validacoes.utilizador',
            'avaliacoesPrioridade.prioridade',
            'avaliacoesPrioridade.utilizador',
            'avaliacoesPrioridade.detalhes',
            'missoes.equipa.tipoEquipa',
            'missoes.coordenador',
        ])->findOrFail($id);
    }
}
