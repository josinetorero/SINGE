<?php

namespace App\Services\Notificacoes;

use App\Models\Notificacao;
use App\Models\Perfil;
use App\Models\User;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Support\Facades\DB;
use InvalidArgumentException;

class NotificacaoService
{
    private const PERFIS_EMISSORES = ['Administrador', 'Coordenador'];

    /** @param array<string, mixed> $dados */
    public function criar(array $dados, User $utilizador): Notificacao
    {
        if (array_key_exists('utilizador_id', $dados)) {
            throw new AuthorizationException('O destinatário de uma notificação não pode ser definido nos dados de criação.');
        }

        return $this->persistir($dados, $utilizador);
    }

    /** @param array<string, mixed> $dados */
    public function create(array $dados, User $utilizador): Notificacao
    {
        return $this->criar($dados, $utilizador);
    }

    /** @param array<string, mixed> $dados */
    public function enviarPara(array $dados, User $destinatario, User $ator): Notificacao
    {
        $perfil = $ator->perfil;
        if (! $perfil instanceof Perfil || ! in_array($perfil->nome, self::PERFIS_EMISSORES, true)) {
            throw new AuthorizationException('O perfil do utilizador não pode enviar notificações a terceiros.');
        }

        return $this->persistir($dados, $destinatario);
    }

    /** @return Collection<int, Notificacao> */
    public function listarParaUtilizador(User $utilizador): Collection
    {
        return Notificacao::query()
            ->where('utilizador_id', $utilizador->id)
            ->latest()
            ->get();
    }

    /** @return Collection<int, Notificacao> */
    public function listar(User $utilizador): Collection
    {
        return $this->listarParaUtilizador($utilizador);
    }

    public function marcarComoLida(Notificacao $notificacao, User $utilizador): Notificacao
    {
        return DB::transaction(function () use ($notificacao, $utilizador): Notificacao {
            $notificacaoPropria = Notificacao::query()
                ->whereKey($notificacao->id)
                ->where('utilizador_id', $utilizador->id)
                ->lockForUpdate()
                ->first();

            if (! $notificacaoPropria) {
                throw (new ModelNotFoundException)->setModel(Notificacao::class, [$notificacao->id]);
            }

            if (! $notificacaoPropria->lida) {
                $notificacaoPropria->lida = true;
                $notificacaoPropria->data_leitura = now();
                $notificacaoPropria->save();
            }

            return $notificacaoPropria->fresh();
        });
    }

    /** @param array<string, mixed> $dados */
    private function persistir(array $dados, User $destinatario): Notificacao
    {
        if (empty($dados['titulo'] ?? null)) {
            throw new InvalidArgumentException('O título da notificação é obrigatório.');
        }

        if (empty($dados['mensagem'] ?? null)) {
            throw new InvalidArgumentException('A mensagem da notificação é obrigatória.');
        }

        if (empty($dados['tipo'] ?? null)) {
            throw new InvalidArgumentException('O tipo da notificação é obrigatório.');
        }

        return Notificacao::query()->create([
            'utilizador_id' => $destinatario->id,
            'titulo' => $dados['titulo'],
            'mensagem' => $dados['mensagem'],
            'tipo' => $dados['tipo'],
            'ocorrencia_id' => $dados['ocorrencia_id'] ?? null,
            'missao_id' => $dados['missao_id'] ?? null,
            'lida' => false,
            'data_leitura' => null,
        ]);
    }
}
