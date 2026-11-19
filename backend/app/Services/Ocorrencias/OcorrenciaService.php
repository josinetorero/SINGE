<?php

namespace App\Services\Ocorrencias;

use App\Enums\EstadoOcorrencia;
use App\Models\HistoricoOcorrencia;
use App\Models\Localizacao;
use App\Models\Ocorrencia;
use App\Models\Perfil;
use App\Models\Prioridade;
use App\Models\TipoOcorrencia;
use App\Models\User;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;
use InvalidArgumentException;
use RuntimeException;

class OcorrenciaService
{
    private const PERFIS_LEITURA_OPERACIONAL = ['Administrador', 'Operador', 'Coordenador'];

    private const PERFIS_GESTORES = ['Administrador', 'Coordenador'];

    private const CAMPOS_INFORMATIVOS = [
        'titulo',
        'descricao',
        'localizacao',
        'localizacao_id',
        'referencia_geografica',
        'latitude',
        'longitude',
        'tipo_ocorrencia_id',
        'origem',
        'comunicante_nome',
        'comunicante_contacto',
        'data_ocorrencia',
    ];

    private const CAMPOS_EDITAVEIS = [
        'titulo',
        'descricao',
        'localizacao',
        'localizacao_id',
        'latitude',
        'longitude',
        'tipo_ocorrencia_id',
    ];

    /** @param array<string, mixed> $dados */
    public function criar(array $dados, User $utilizador, ?Prioridade $prioridadeInicial = null): Ocorrencia
    {
        return DB::transaction(function () use ($dados, $utilizador, $prioridadeInicial): Ocorrencia {
            $campos = array_intersect_key($dados, array_flip(self::CAMPOS_INFORMATIVOS));
            $this->validarDados($campos);
            $tipo = TipoOcorrencia::query()->findOrFail((int) $campos['tipo_ocorrencia_id']);
            if (! $tipo->ativo) {
                throw new InvalidArgumentException('O tipo de ocorrência seleccionado está inactivo.');
            }

            if (! empty($campos['referencia_geografica'])) {
                $referencia = $campos['referencia_geografica'];
                $localizacao = Localizacao::query()->create([
                    'provincia_id' => $referencia['provincia_id'],
                    'distrito_id' => $referencia['distrito_id'],
                    'municipio_id' => $referencia['municipio_id'] ?? null,
                    'posto_administrativo_id' => $referencia['posto_administrativo_id'] ?? null,
                    'bairro_id' => $referencia['bairro_id'] ?? null,
                    'quarteirao_id' => $referencia['quarteirao_id'] ?? null,
                    'endereco_referencia' => $referencia['endereco_referencia'] ?? null,
                    'latitude' => $campos['latitude'] ?? null,
                    'longitude' => $campos['longitude'] ?? null,
                ]);
                $campos['localizacao_id'] = $localizacao->id;
                unset($campos['referencia_geografica']);
            }

            if (isset($campos['localizacao_id'])) {
                Localizacao::query()->findOrFail((int) $campos['localizacao_id']);
            }

            $ocorrencia = Ocorrencia::query()->create([
                ...$campos,
                'prioridade_id' => $prioridadeInicial?->id,
                'utilizador_id' => $utilizador->id,
                'origem' => $this->nomePerfil($utilizador) === 'Operador'
                    ? $campos['origem']
                    : 'cidadao',
                'estado' => EstadoOcorrencia::REGISTADA,
            ]);

            $this->registarHistorico(
                $ocorrencia,
                $utilizador,
                null,
                EstadoOcorrencia::REGISTADA->value,
            );

            return $ocorrencia->fresh(['utilizador', 'tipoOcorrencia', 'prioridade', 'localizacaoGeografica']);
        });
    }

    /** @param array<string, mixed> $dados */
    public function create(array $dados, User $utilizador, ?Prioridade $prioridadeInicial = null): Ocorrencia
    {
        return $this->criar($dados, $utilizador, $prioridadeInicial);
    }

    /** @param array<string, mixed> $dados */
    public function atualizar(Ocorrencia $ocorrencia, array $dados, User $utilizador): Ocorrencia
    {
        $perfil = $this->nomePerfil($utilizador);
        $this->autorizarActualizacao($ocorrencia, $utilizador);
        if ($perfil === 'Operador' && (array_diff(array_keys($dados), ['descricao']) !== [] || trim((string) ($dados['descricao'] ?? '')) === '')) {
            throw new AuthorizationException('O Operador só pode complementar a descrição da ocorrência.');
        }
        $campos = array_intersect_key($dados, array_flip(self::CAMPOS_EDITAVEIS));
        $this->validarDados($campos, parcial: true);

        if (isset($campos['tipo_ocorrencia_id'])) {
            TipoOcorrencia::query()->findOrFail((int) $campos['tipo_ocorrencia_id']);
        }
        if (array_key_exists('localizacao_id', $campos) && $campos['localizacao_id'] !== null) {
            Localizacao::query()->findOrFail((int) $campos['localizacao_id']);
        }

        $ocorrencia->fill($campos);
        $ocorrencia->save();

        return $ocorrencia->fresh(['utilizador', 'tipoOcorrencia', 'prioridade', 'localizacaoGeografica']);
    }

    /** @param array<string, mixed> $dados */
    public function update(Ocorrencia $ocorrencia, array $dados, User $utilizador): Ocorrencia
    {
        return $this->atualizar($ocorrencia, $dados, $utilizador);
    }

    public function alterarEstado(
        Ocorrencia $ocorrencia,
        string $estado,
        User $utilizador,
        ?string $observacoes = null,
    ): Ocorrencia {
        $this->autorizarAlteracaoEstado($utilizador);
        $novoEstado = EstadoOcorrencia::tryFrom(trim($estado));
        if (! $novoEstado) {
            throw new InvalidArgumentException('Estado da ocorrência inválido.');
        }

        return DB::transaction(function () use ($ocorrencia, $novoEstado, $observacoes, $utilizador): Ocorrencia {
            $actual = Ocorrencia::query()->lockForUpdate()->findOrFail($ocorrencia->id);
            $estadoAnterior = EstadoOcorrencia::tryFrom((string) $actual->getRawOriginal('estado'));
            if (! $estadoAnterior) {
                throw new RuntimeException('A ocorrência possui um estado inválido na base de dados.');
            }

            if ($estadoAnterior === $novoEstado) {
                throw new InvalidArgumentException('A ocorrência já se encontra no estado indicado.');
            }

            $actual->estado = $novoEstado->value;
            $actual->save();

            $this->registarHistorico(
                $actual,
                $utilizador,
                $estadoAnterior->value,
                $novoEstado->value,
                $observacoes,
            );

            return $actual->fresh(['utilizador', 'tipoOcorrencia', 'prioridade', 'localizacaoGeografica']);
        });
    }

    public function alterarEstadoOperacional(
        Ocorrencia $ocorrencia,
        string $estado,
        User $utilizador,
        ?string $observacoes = null,
    ): Ocorrencia {
        return $this->alterarEstado($ocorrencia, $estado, $utilizador, $observacoes);
    }

    public function associarLocalizacao(Ocorrencia $ocorrencia, int $localizacaoId, User $utilizador): Ocorrencia
    {
        $perfil = $this->nomePerfil($utilizador);
        $podeAlterarComoCidadao = $perfil === 'Cidadão'
            && (int) $ocorrencia->utilizador_id === (int) $utilizador->id
            && $ocorrencia->getRawOriginal('estado') === EstadoOcorrencia::REGISTADA->value;

        if (! $podeAlterarComoCidadao && ! in_array($perfil, self::PERFIS_GESTORES, true)) {
            throw new AuthorizationException('O utilizador não está autorizado a alterar a localização desta ocorrência.');
        }

        return DB::transaction(function () use ($ocorrencia, $localizacaoId): Ocorrencia {
            Localizacao::query()->findOrFail($localizacaoId);
            $actual = Ocorrencia::query()->lockForUpdate()->findOrFail($ocorrencia->id);
            $actual->localizacao_id = Localizacao::query()->findOrFail($localizacaoId)->id;
            $actual->save();

            return $actual->fresh('localizacaoGeografica');
        });
    }

    public function consultar(int $id, User $utilizador): Ocorrencia
    {
        $ocorrencia = Ocorrencia::query()
            ->with([
                'utilizador',
                'tipoOcorrencia',
                'prioridade',
                'localizacaoGeografica.provincia',
                'localizacaoGeografica.distrito',
                'localizacaoGeografica.municipio',
                'localizacaoGeografica.postoAdministrativo',
                'localizacaoGeografica.bairro',
                'localizacaoGeografica.quarteirao',
                'historico' => fn ($query) => $query->with('utilizador')->latest()->orderByDesc('id'),
                'evidencias' => fn ($query) => $query->latest(),
                'validacoes' => fn ($query) => $query->with('utilizador')->latest()->orderByDesc('id'),
            ])
            ->findOrFail($id);

        $perfil = $this->nomePerfil($utilizador);
        $podeConsultar = (int) $ocorrencia->utilizador_id === (int) $utilizador->id
            || in_array($perfil, self::PERFIS_LEITURA_OPERACIONAL, true)
            || ($perfil === 'Agente'
                && $utilizador->equipa_id !== null
                && $ocorrencia->missoes()->where('equipa_id', $utilizador->equipa_id)->exists());

        if (! $podeConsultar) {
            throw new AuthorizationException('O utilizador não está autorizado a consultar esta ocorrência.');
        }

        return $ocorrencia;
    }

    /**
     * @param  array{estado?: string, tipo_ocorrencia_id?: int|string}  $filtros
     */
    public function listarDoUtilizador(
        User $utilizador,
        array $filtros = [],
        int $porPagina = 15,
    ): LengthAwarePaginator {
        return Ocorrencia::query()
            ->with(['tipoOcorrencia', 'prioridade', 'localizacaoGeografica'])
            ->where('utilizador_id', $utilizador->id)
            ->when(isset($filtros['estado']), fn ($query) => $query->where('estado', $filtros['estado']))
            ->when(isset($filtros['tipo_ocorrencia_id']), fn ($query) => $query->where(
                'tipo_ocorrencia_id',
                $filtros['tipo_ocorrencia_id'],
            ))
            ->latest('created_at')
            ->paginate($porPagina);
    }

    /**
     * @param array{
     *     q?: string,
     *     estado?: string,
     *     tipo_ocorrencia_id?: int|string,
     *     provincia?: string,
     *     distrito?: string,
     *     localizacao?: string,
     *     data_inicio?: string,
     *     data_fim?: string,
     *     ordenar_por?: string,
     *     ordem?: string
     * } $filtros
     */
    public function listarOperacionais(array $filtros = [], int $porPagina = 15): LengthAwarePaginator
    {
        $query = Ocorrencia::query()->with([
            'tipoOcorrencia',
            'prioridade',
            'localizacaoGeografica.provincia',
            'localizacaoGeografica.distrito',
        ]);

        if (! empty($filtros['q'])) {
            $termo = trim($filtros['q']);
            $query->where(function ($builder) use ($termo): void {
                if (ctype_digit($termo)) {
                    $builder->where('id', (int) $termo)->orWhere('titulo', 'like', "%{$termo}%");
                } else {
                    $builder->where('titulo', 'like', "%{$termo}%");
                }

                $builder->orWhere('descricao', 'like', "%{$termo}%")
                    ->orWhere('localizacao', 'like', "%{$termo}%");
            });
        }

        $query
            ->when(isset($filtros['estado']), fn ($builder) => $builder->where('estado', $filtros['estado']))
            ->when(isset($filtros['tipo_ocorrencia_id']), fn ($builder) => $builder->where(
                'tipo_ocorrencia_id',
                $filtros['tipo_ocorrencia_id'],
            ))
            ->when(isset($filtros['prioridade_id']), fn ($builder) => $builder->where(
                'prioridade_id',
                $filtros['prioridade_id'],
            ))
            ->when(isset($filtros['provincia']), fn ($builder) => $builder->whereHas(
                'localizacaoGeografica.provincia',
                fn ($location) => $location->where('nome', 'like', '%'.$filtros['provincia'].'%'),
            ))
            ->when(isset($filtros['distrito']), fn ($builder) => $builder->whereHas(
                'localizacaoGeografica.distrito',
                fn ($location) => $location->where('nome', 'like', '%'.$filtros['distrito'].'%'),
            ))
            ->when(isset($filtros['localizacao']), fn ($builder) => $builder->where(
                'localizacao',
                'like',
                '%'.$filtros['localizacao'].'%',
            ))
            ->when(isset($filtros['data_inicio']), fn ($builder) => $builder->whereDate(
                'created_at',
                '>=',
                $filtros['data_inicio'],
            ))
            ->when(isset($filtros['data_fim']), fn ($builder) => $builder->whereDate(
                'created_at',
                '<=',
                $filtros['data_fim'],
            ));

        $sort = in_array($filtros['ordenar_por'] ?? 'created_at', ['created_at', 'updated_at', 'id'], true)
            ? ($filtros['ordenar_por'] ?? 'created_at')
            : 'created_at';
        $direction = ($filtros['ordem'] ?? 'desc') === 'asc' ? 'asc' : 'desc';

        return $query->orderBy($sort, $direction)->paginate($porPagina);
    }

    /** @return array{total: int, pendentes_analise: int, validadas: int, nao_confirmadas: int, rejeitadas: int, duplicadas: int} */
    public function estatisticasOperacionais(): array
    {
        $estadosOcorrencia = Ocorrencia::query()
            ->selectRaw('estado, COUNT(*) as total')
            ->groupBy('estado')
            ->pluck('total', 'estado');

        $ultimasValidacoes = DB::table('validacoes_ocorrencia')
            ->selectRaw('MAX(id) as id')
            ->groupBy('ocorrencia_id');
        $estadosValidacao = DB::table('validacoes_ocorrencia as validacao')
            ->joinSub($ultimasValidacoes, 'ultima_validacao', 'validacao.id', '=', 'ultima_validacao.id')
            ->selectRaw('validacao.estado, COUNT(*) as total')
            ->groupBy('validacao.estado')
            ->pluck('total', 'estado');
        $validacoesConcluidas = DB::table('validacoes_ocorrencia as validacao')
            ->joinSub($ultimasValidacoes, 'ultima_validacao', 'validacao.id', '=', 'ultima_validacao.id')
            ->whereIn('validacao.estado', ['VALIDADA', 'NAO_CONFIRMADA', 'REJEITADA', 'DUPLICADA'])
            ->select('validacao.ocorrencia_id');
        $pendentesAnalise = Ocorrencia::query()
            ->whereIn('estado', [
                EstadoOcorrencia::REGISTADA->value,
                EstadoOcorrencia::EM_AVALIACAO->value,
            ])
            ->whereNotIn('id', $validacoesConcluidas)
            ->count();
        $porTipo = DB::table('tipos_ocorrencia as tipo')
            ->leftJoin('ocorrencias as ocorrencia', 'ocorrencia.tipo_ocorrencia_id', '=', 'tipo.id')
            ->selectRaw('tipo.id, tipo.nome, COUNT(ocorrencia.id) as total')
            ->groupBy('tipo.id', 'tipo.nome')->orderByDesc('total')->get();
        $evolucao = Ocorrencia::query()->where('created_at', '>=', now()->subDays(13)->startOfDay())
            ->selectRaw('DATE(created_at) as dia, COUNT(*) as total')
            ->groupByRaw('DATE(created_at)')->orderBy('dia')->get();
        $porProvincia = DB::table('provincias as provincia')
            ->join('distritos', 'distritos.provincia_id', '=', 'provincia.id')
            ->join('localizacoes', 'localizacoes.distrito_id', '=', 'distritos.id')
            ->join('ocorrencias', 'ocorrencias.localizacao_id', '=', 'localizacoes.id')
            ->selectRaw('provincia.nome, COUNT(ocorrencias.id) as total')
            ->groupBy('provincia.id', 'provincia.nome')->orderByDesc('total')->get();

        return [
            'total' => (int) $estadosOcorrencia->sum(),
            'resolvidas' => (int) $estadosOcorrencia->get(EstadoOcorrencia::RESOLVIDA->value, 0),
            'canceladas' => (int) $estadosOcorrencia->get(EstadoOcorrencia::CANCELADA->value, 0),
            'pendentes_analise' => $pendentesAnalise,
            'validadas' => (int) $estadosValidacao->get('VALIDADA', 0),
            'nao_confirmadas' => (int) $estadosValidacao->get('NAO_CONFIRMADA', 0),
            'rejeitadas' => (int) $estadosValidacao->get('REJEITADA', 0),
            'duplicadas' => (int) $estadosValidacao->get('DUPLICADA', 0),
            'por_estado' => $estadosOcorrencia,
            'por_estado_validacao' => $estadosValidacao,
            'por_tipo' => $porTipo,
            'evolucao_14_dias' => $evolucao,
            'por_provincia' => $porProvincia,
        ];
    }

    /** @return Collection<int, TipoOcorrencia> */
    public function listarTipos(): Collection
    {
        return TipoOcorrencia::query()->orderBy('nome')->get(['id', 'nome', 'descricao', 'ativo']);
    }

    /** @return array<string, mixed> */
    public function estatisticasDoUtilizador(User $utilizador): array
    {
        $porEstado = Ocorrencia::query()
            ->where('utilizador_id', $utilizador->id)
            ->selectRaw('estado, COUNT(*) as total')
            ->groupBy('estado')
            ->pluck('total', 'estado');
        $evolucao = Ocorrencia::query()->where('utilizador_id', $utilizador->id)
            ->where('created_at', '>=', now()->subDays(13)->startOfDay())
            ->selectRaw('DATE(created_at) as dia, COUNT(*) as total')
            ->groupByRaw('DATE(created_at)')->orderBy('dia')->get();

        return [
            'total' => (int) $porEstado->sum(),
            'em_acompanhamento' => (int) $porEstado->only([
                'em_avaliacao',
                'em_atendimento',
            ])->sum(),
            'resolvidas' => (int) $porEstado->get('resolvida', 0),
            'por_estado' => $porEstado,
            'evolucao_14_dias' => $evolucao,
        ];
    }

    /** @return Collection<int, TipoOcorrencia> */
    public function listarTiposAtivos(): Collection
    {
        return TipoOcorrencia::query()
            ->where('ativo', true)
            ->orderBy('nome')
            ->get(['id', 'nome', 'descricao']);
    }

    private function autorizarActualizacao(Ocorrencia $ocorrencia, User $utilizador): void
    {
        $perfil = $this->nomePerfil($utilizador);
        if ($perfil === 'Operador') {
            return;
        }
        if (in_array($perfil, self::PERFIS_GESTORES, true)) {
            return;
        }

        if ($perfil === 'Cidadão'
            && (int) $ocorrencia->utilizador_id === (int) $utilizador->id
            && $ocorrencia->getRawOriginal('estado') === EstadoOcorrencia::REGISTADA->value) {
            return;
        }

        throw new AuthorizationException('O utilizador não está autorizado a actualizar esta ocorrência.');
    }

    private function autorizarAlteracaoEstado(User $utilizador): void
    {
        if (! in_array($this->nomePerfil($utilizador), self::PERFIS_GESTORES, true)) {
            throw new AuthorizationException('O perfil do utilizador não pode alterar o estado operacional das ocorrências.');
        }
    }

    /** @param array<string, mixed> $dados */
    private function validarDados(array $dados, bool $parcial = false): void
    {
        foreach (['titulo', 'descricao', 'localizacao', 'tipo_ocorrencia_id'] as $required) {
            if (! $parcial && empty($dados[$required] ?? null)) {
                throw new InvalidArgumentException("O campo {$required} é obrigatório.");
            }
        }

        if (isset($dados['latitude']) && (! is_numeric($dados['latitude']) || $dados['latitude'] < -90 || $dados['latitude'] > 90)) {
            throw new InvalidArgumentException('A latitude deve estar compreendida entre -90 e 90.');
        }

        if (isset($dados['longitude']) && (! is_numeric($dados['longitude']) || $dados['longitude'] < -180 || $dados['longitude'] > 180)) {
            throw new InvalidArgumentException('A longitude deve estar compreendida entre -180 e 180.');
        }

        if (array_key_exists('latitude', $dados) xor array_key_exists('longitude', $dados)) {
            throw new InvalidArgumentException('A latitude e a longitude devem ser fornecidas em conjunto.');
        }
    }

    private function registarHistorico(
        Ocorrencia $ocorrencia,
        User $utilizador,
        ?string $estadoAnterior,
        string $estadoNovo,
        ?string $observacoes = null,
    ): HistoricoOcorrencia {
        return HistoricoOcorrencia::query()->create([
            'ocorrencia_id' => $ocorrencia->id,
            'utilizador_id' => $utilizador->id,
            'estado_anterior' => $estadoAnterior,
            'estado_novo' => $estadoNovo,
            'observacoes' => $observacoes,
        ]);
    }

    private function nomePerfil(User $utilizador): ?string
    {
        $perfil = $utilizador->perfil;

        return $perfil instanceof Perfil ? $perfil->nome : null;
    }
}
