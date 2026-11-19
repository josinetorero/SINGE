<?php

namespace App\Http\Controllers\Notificacoes;

use App\Http\Controllers\SingeApiController;
use App\Http\Requests\Notificacoes\StoreNotificacaoRequest;
use App\Models\Notificacao;
use App\Models\User;
use App\Services\Notificacoes\NotificacaoService;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NotificacaoController extends SingeApiController
{
    public function index(Request $request, NotificacaoService $service): JsonResponse
    {
        return $this->execute(
            fn (): array => $service->listarParaUtilizador($this->authenticatedUser($request))
                ->map(fn (Notificacao $notificacao): array => $this->attributes($notificacao, [
                    'id', 'titulo', 'mensagem', 'tipo', 'ocorrencia_id',
                    'missao_id', 'lida', 'data_leitura', 'created_at',
                ]))
                ->all(),
            'Notificações consultadas com sucesso.',
        );
    }

    public function show(int $id, Request $request, NotificacaoService $service): JsonResponse
    {
        return $this->execute(
            function () use ($id, $request, $service): array {
                $notificacao = $service->listarParaUtilizador($this->authenticatedUser($request))
                    ->firstWhere('id', $id);

                if (! $notificacao instanceof Notificacao) {
                    throw (new ModelNotFoundException)
                        ->setModel(Notificacao::class, [$id]);
                }

                return $this->attributes($notificacao, [
                    'id', 'titulo', 'mensagem', 'tipo', 'ocorrencia_id',
                    'missao_id', 'lida', 'data_leitura', 'created_at',
                ]);
            },
            'Notificação consultada com sucesso.',
        );
    }

    public function markAsRead(
        Notificacao $notificacao,
        Request $request,
        NotificacaoService $service,
    ): JsonResponse {
        return $this->execute(
            fn (): array => $this->attributes(
                $service->marcarComoLida($notificacao, $this->authenticatedUser($request)),
                ['id', 'lida', 'data_leitura', 'updated_at'],
            ),
            'Notificação marcada como lida.',
        );
    }

    public function send(
        StoreNotificacaoRequest $request,
        User $destinatario,
        NotificacaoService $service,
    ): JsonResponse {
        $dados = $request->validated();
        if ((int) $dados['utilizador_id'] !== (int) $destinatario->id) {
            return $this->failure('O destinatário indicado não corresponde ao recurso seleccionado.', 422);
        }

        return $this->execute(
            fn (): array => $this->attributes(
                $service->enviarPara($dados, $destinatario, $this->authenticatedUser($request)),
                [
                    'id', 'titulo', 'mensagem', 'tipo', 'ocorrencia_id',
                    'missao_id', 'lida', 'data_leitura', 'created_at',
                ],
            ),
            'Notificação enviada com sucesso.',
            201,
        );
    }
}
