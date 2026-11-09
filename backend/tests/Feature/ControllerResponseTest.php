<?php

use App\Http\Controllers\Notificacoes\NotificacaoController;
use App\Http\Controllers\SingeApiController;
use App\Models\Notificacao;
use App\Models\User;
use App\Services\Notificacoes\NotificacaoService;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

it('returns a consistent JSON envelope for successful controller operations', function () {
    $controller = new class extends SingeApiController
    {
        public function respond(): JsonResponse
        {
            return $this->execute(fn (): array => ['id' => 7], 'Criado.', 201);
        }
    };

    $response = $controller->respond();

    expect($response->getStatusCode())->toBe(201)
        ->and($response->getData(true))->toBe([
            'success' => true,
            'message' => 'Criado.',
            'data' => ['id' => 7],
        ]);
});

it('maps authorization failures to a generic forbidden response', function () {
    $controller = new class extends SingeApiController
    {
        public function respond(): JsonResponse
        {
            return $this->execute(
                fn (): array => throw new AuthorizationException('Private authorization details.'),
                'Not used.',
            );
        }
    };

    $response = $controller->respond();

    expect($response->getStatusCode())->toBe(403)
        ->and($response->getData(true))->toBe([
            'success' => false,
            'message' => 'Operação não autorizada.',
        ]);
});

it('uses the authenticated user to scope notification details', function () {
    $user = User::factory()->make(['id' => 11]);
    $request = Request::create('/notificacoes/23', 'GET');
    $request->setUserResolver(fn (): User => $user);

    $service = Mockery::mock(NotificacaoService::class);
    $service->shouldReceive('listarParaUtilizador')
        ->once()
        ->with($user)
        ->andReturn(new Collection);

    $response = (new NotificacaoController)->show(23, $request, $service);

    expect($response->getStatusCode())->toBe(404);
});

it('does not expose notification fields outside the response whitelist', function () {
    $user = User::factory()->make(['id' => 11]);
    $request = Request::create('/notificacoes/23', 'GET');
    $request->setUserResolver(fn (): User => $user);
    $notification = new Notificacao([
        'utilizador_id' => 11,
        'titulo' => 'Aviso',
        'mensagem' => 'Mensagem interna',
        'tipo' => 'sistema',
        'caminho_documento' => '/private/document.pdf',
    ]);
    $notification->setAttribute('id', 23);

    $service = Mockery::mock(NotificacaoService::class);
    $service->shouldReceive('listarParaUtilizador')
        ->once()
        ->with($user)
        ->andReturn(new Collection([$notification]));

    $response = (new NotificacaoController)->show(23, $request, $service);
    $payload = $response->getData(true);

    expect($response->getStatusCode())->toBe(200)
        ->and($payload['data']['id'])->toBe(23)
        ->and($payload['data'])->not->toHaveKey('utilizador_id')
        ->and($payload['data'])->not->toHaveKey('caminho_documento');
});
