<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use InvalidArgumentException;
use Symfony\Component\HttpFoundation\StreamedResponse;

abstract class SingeApiController extends Controller
{
    /** @param callable(): array<array-key, mixed> $operation */
    protected function execute(callable $operation, string $message, int $status = 200): JsonResponse
    {
        try {
            $data = $operation();

            return response()->json([
                'success' => true,
                'message' => $message,
                'data' => $data,
            ], $status);
        } catch (AuthenticationException) {
            return $this->failure('Autenticação necessária.', 401);
        } catch (AuthorizationException) {
            return $this->failure('Operação não autorizada.', 403);
        } catch (ModelNotFoundException) {
            return $this->failure('Recurso não encontrado.', 404);
        } catch (InvalidArgumentException) {
            return $this->failure('Os dados ou o estado actual não permitem concluir a operação.', 422);
        }
    }

    /** @param callable(): StreamedResponse $operation */
    protected function executeStream(callable $operation): JsonResponse|StreamedResponse
    {
        try {
            return $operation();
        } catch (AuthenticationException) {
            return $this->failure('Autenticação necessária.', 401);
        } catch (AuthorizationException) {
            return $this->failure('Operação não autorizada.', 403);
        } catch (ModelNotFoundException) {
            return $this->failure('Recurso não encontrado.', 404);
        } catch (InvalidArgumentException) {
            return $this->failure('Os dados ou o estado actual não permitem concluir a operação.', 422);
        }
    }

    /**
     * @param  list<string>  $fields
     * @return array<string, mixed>
     */
    protected function attributes(Model $model, array $fields): array
    {
        return array_intersect_key(
            $model->attributesToArray(),
            array_fill_keys($fields, true),
        );
    }

    protected function authenticatedUser(Request $request): User
    {
        $user = $request->user();

        if (! $user instanceof User) {
            throw new AuthenticationException;
        }

        return $user;
    }

    protected function failure(string $message, int $status): JsonResponse
    {
        return response()->json([
            'success' => false,
            'message' => $message,
        ], $status);
    }
}
