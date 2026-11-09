<?php

namespace App\Services\Equipas;

use App\Enums\EstadoEquipa;
use App\Enums\EstadoMissao;
use App\Models\Equipa;
use App\Models\Missao;
use App\Models\Perfil;
use App\Models\User;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;
use InvalidArgumentException;

class EquipaService
{
    private const PERFIS_GESTAO = ['Administrador', 'Coordenador'];

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
            ->with(['ocorrencia', 'coordenador', 'equipa'])
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
