<?php

namespace App\Services\Equipas;

use App\Enums\EstadoEquipa;
use App\Enums\EstadoMissao;
use App\Models\Equipa;
use App\Models\Missao;
use App\Models\Perfil;
use App\Models\TipoEquipa;
use App\Models\User;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;
use InvalidArgumentException;

class EquipaService
{
    private const PERFIS_GESTAO = ['Administrador', 'Coordenador'];

    /** @param array{latitude: float|null, longitude: float|null} $coordenadas */
    public function atualizarLocalizacao(Equipa $equipa, array $coordenadas, User $utilizador): Equipa
    {
        $this->autorizarGestao($utilizador);
        $equipa->latitude = $coordenadas['latitude'];
        $equipa->longitude = $coordenadas['longitude'];
        $equipa->save();
        return $equipa->fresh();
    }

    private const ESTADOS_ACTIVOS = [
        EstadoMissao::ATRIBUIDA->value,
        EstadoMissao::EM_DESLOCACAO->value,
        EstadoMissao::EM_EXECUCAO->value,
    ];

    public function consultar(int $id, User $utilizador): Equipa
    {
        $equipa = Equipa::query()->with(['tipoEquipa', 'utilizadores', 'missoes'])->findOrFail($id);
        $this->autorizarConsulta($equipa, $utilizador);

        return $equipa;
    }

    /** @param array<string, mixed> $filtros
     *  @return Collection<int, Equipa>
     */
    public function listar(array $filtros = []): Collection
    {
        return Equipa::query()
            ->with(['tipoEquipa', 'utilizadores.perfil', 'missoes.ocorrencia'])
            ->when(isset($filtros['q']), fn ($query) => $query->where(
                'nome',
                'like',
                '%'.trim((string) $filtros['q']).'%',
            ))
            ->when(isset($filtros['tipo_equipa_id']), fn ($query) => $query->where(
                'tipo_equipa_id',
                $filtros['tipo_equipa_id'],
            ))
            ->when(isset($filtros['estado']), fn ($query) => $query->where(
                'estado',
                $filtros['estado'],
            ))
            ->orderBy('nome')
            ->get();
    }

    /** @return Collection<int, TipoEquipa> */
    public function listarTipos(): Collection
    {
        return TipoEquipa::query()->where('ativo', true)->orderBy('nome')->get(['id', 'nome']);
    }

    public function atualizarDisponibilidade(Equipa $equipa, string $estado, User $utilizador): Equipa
    {
        $this->autorizarGestao($utilizador);
        $novoEstado = EstadoEquipa::tryFrom(trim($estado));

        if (! $novoEstado || $novoEstado === EstadoEquipa::EM_MISSAO) {
            throw new InvalidArgumentException('Estado de disponibilidade inválido; o estado "em_missao" é gerido pelas missões.');
        }

        return DB::transaction(function () use ($equipa, $novoEstado): Equipa {
            $equipaActual = Equipa::query()->lockForUpdate()->findOrFail($equipa->id);
            $temMissaoActiva = Missao::query()
                ->where('equipa_id', $equipaActual->id)
                ->whereIn('estado', self::ESTADOS_ACTIVOS)
                ->exists();

            if ($temMissaoActiva) {
                throw new InvalidArgumentException('Não é possível alterar a disponibilidade enquanto a equipa tem missões activas.');
            }

            $equipaActual->estado = $novoEstado->value;
            $equipaActual->save();

            return $equipaActual->fresh();
        });
    }

    public function associarUtilizador(Equipa $equipa, User $utilizador, User $ator): User
    {
        $this->autorizarGestao($ator);

        return DB::transaction(function () use ($equipa, $utilizador): User {
            Equipa::query()->lockForUpdate()->findOrFail($equipa->id);
            $utilizadorActual = User::query()->lockForUpdate()->findOrFail($utilizador->id);
            $utilizadorActual->equipa_id = $equipa->id;
            $utilizadorActual->save();

            return $utilizadorActual->fresh(['equipa', 'perfil']);
        });
    }

    /**
     * @return Collection<int, Missao>
     */
    public function consultarMissoes(Equipa $equipa, User $utilizador): Collection
    {
        $this->autorizarConsulta($equipa, $utilizador);

        return Missao::query()
            ->where('equipa_id', $equipa->id)
            ->with(['ocorrencia.prioridade', 'ocorrencia.localizacaoGeografica.provincia', 'ocorrencia.localizacaoGeografica.distrito', 'coordenador', 'equipa', 'historico.utilizador'])
            ->get();
    }

    /**
     * @return Collection<int, Missao>
     */
    public function listarMissoes(Equipa $equipa, User $utilizador): Collection
    {
        return $this->consultarMissoes($equipa, $utilizador);
    }

    private function autorizarGestao(User $utilizador): void
    {
        if (! in_array($this->nomePerfil($utilizador), self::PERFIS_GESTAO, true)) {
            throw new AuthorizationException('O perfil do utilizador não pode gerir equipas.');
        }
    }

    private function autorizarConsulta(Equipa $equipa, User $utilizador): void
    {
        if (in_array($this->nomePerfil($utilizador), ['Administrador', 'Coordenador'], true)
            || (int) $utilizador->equipa_id === (int) $equipa->id) {
            return;
        }

        throw new AuthorizationException('O utilizador não está autorizado a consultar esta equipa.');
    }

    private function nomePerfil(User $utilizador): ?string
    {
        $perfil = $utilizador->perfil;

        return $perfil instanceof Perfil ? $perfil->nome : null;
    }
}
