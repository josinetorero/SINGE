<?php

namespace App\Services\Alertas;

use App\Models\AlertaPublico;
use App\Models\HistoricoAlertaPublico;
use App\Models\Perfil;
use App\Models\User;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;
use InvalidArgumentException;

class AlertaPublicoService
{
    private const PERFIS_GESTAO = ['Administrador', 'Coordenador'];

    /** @return Collection<int, AlertaPublico> */
    public function listarPublicos(array $filtros = []): Collection
    {
        return AlertaPublico::query()
            ->with(['localizacao.provincia', 'localizacao.distrito'])
            ->whereIn('estado', ['publicado', 'encerrado'])
            ->when(($filtros['estado'] ?? null) === 'activo', fn ($query) => $query
                ->where('estado', 'publicado')
                ->where('valido_desde', '<=', now())
                ->where('valido_ate', '>=', now()))
            ->when(isset($filtros['tipo_perigo']), fn ($query) => $query->where('tipo_perigo', $filtros['tipo_perigo']))
            ->when(isset($filtros['severidade']), fn ($query) => $query->where('severidade', $filtros['severidade']))
            ->when(isset($filtros['q']), fn ($query) => $query->where(
                fn ($builder) => $builder
                    ->where('titulo', 'like', '%'.$filtros['q'].'%')
                    ->orWhere('descricao', 'like', '%'.$filtros['q'].'%')
                    ->orWhere('area_geografica', 'like', '%'.$filtros['q'].'%'),
            ))
            ->latest('data_publicacao')
            ->get();
    }

    /** @return Collection<int, AlertaPublico> */
    public function listarGestao(): Collection
    {
        return AlertaPublico::query()
            ->with(['localizacao.provincia', 'localizacao.distrito'])
            ->latest()
            ->get();
    }

    public function consultarPublico(int $id): AlertaPublico
    {
        return AlertaPublico::query()
            ->with(['localizacao.provincia', 'localizacao.distrito', 'historico.utilizador'])
            ->whereIn('estado', ['publicado', 'encerrado'])
            ->findOrFail($id);
    }

    /** @param array<string, mixed> $dados */
    public function criar(array $dados, User $ator): AlertaPublico
    {
        $this->autorizarGestao($ator);

        return DB::transaction(function () use ($dados, $ator): AlertaPublico {
            $alerta = AlertaPublico::query()->create([
                ...$dados,
                'estado' => 'rascunho',
                'utilizador_id' => $ator->id,
            ]);
            $this->historico($alerta, $ator, 'criado', null, 'rascunho');

            return $alerta->fresh(['localizacao.provincia', 'localizacao.distrito']);
        });
    }

    /** @param array<string, mixed> $dados */
    public function actualizar(AlertaPublico $alerta, array $dados, User $ator): AlertaPublico
    {
        $this->autorizarGestao($ator);
        if ($alerta->estado === 'encerrado') {
            throw new InvalidArgumentException('Um alerta encerrado não pode ser alterado.');
        }

        return DB::transaction(function () use ($alerta, $dados, $ator): AlertaPublico {
            $actual = AlertaPublico::query()->lockForUpdate()->findOrFail($alerta->id);
            $actual->fill($dados);
            $actual->save();
            $this->historico($actual, $ator, 'editado', $actual->estado, $actual->estado);

            return $actual->fresh(['localizacao.provincia', 'localizacao.distrito']);
        });
    }

    public function publicar(AlertaPublico $alerta, User $ator): AlertaPublico
    {
        $this->autorizarGestao($ator);

        return DB::transaction(function () use ($alerta, $ator): AlertaPublico {
            $actual = AlertaPublico::query()->lockForUpdate()->findOrFail($alerta->id);
            if ($actual->estado === 'encerrado') {
                throw new InvalidArgumentException('Um alerta encerrado não pode ser publicado novamente.');
            }
            if ($actual->valido_ate->isPast()) {
                throw new InvalidArgumentException('Não é possível publicar um alerta cuja validade terminou.');
            }
            $anterior = $actual->estado;
            $actual->estado = 'publicado';
            $actual->data_publicacao = now();
            $actual->utilizador_id = $ator->id;
            $actual->save();
            $this->historico($actual, $ator, 'publicado', $anterior, 'publicado');

            return $actual->fresh(['localizacao.provincia', 'localizacao.distrito']);
        });
    }

    public function encerrar(AlertaPublico $alerta, User $ator): AlertaPublico
    {
        $this->autorizarGestao($ator);

        return DB::transaction(function () use ($alerta, $ator): AlertaPublico {
            $actual = AlertaPublico::query()->lockForUpdate()->findOrFail($alerta->id);
            if ($actual->estado === 'encerrado') {
                return $actual;
            }
            $anterior = $actual->estado;
            $actual->estado = 'encerrado';
            $actual->save();
            $this->historico($actual, $ator, 'encerrado', $anterior, 'encerrado');

            return $actual->fresh(['localizacao.provincia', 'localizacao.distrito']);
        });
    }

    private function autorizarGestao(User $ator): void
    {
        if (! in_array($ator->perfil?->nome, self::PERFIS_GESTAO, true)) {
            throw new AuthorizationException('O perfil não está autorizado a gerir alertas públicos.');
        }
    }

    private function historico(
        AlertaPublico $alerta,
        User $ator,
        string $operacao,
        ?string $anterior,
        ?string $novo,
    ): void {
        HistoricoAlertaPublico::query()->create([
            'alerta_publico_id' => $alerta->id,
            'utilizador_id' => $ator->id,
            'operacao' => $operacao,
            'estado_anterior' => $anterior,
            'estado_novo' => $novo,
        ]);
    }
}
