<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class VerificarPerfil
{
    public function handle(Request $request, Closure $next, ...$perfis): Response
    {
        $utilizador = $request->user();

        // Verificar se existe utilizador autenticado
        if (!$utilizador) {
            return response()->json([
                'message' => 'Não autenticado.'
            ], 401);
        }

        // Verificar se o utilizador possui um dos perfis permitidos
        if (!$utilizador->perfil || !in_array(
            $utilizador->perfil->nome,
            $perfis
        )) {
            return response()->json([
                'message' => 'Não tem permissão para realizar esta operação.'
            ], 403);
        }

        return $next($request);
    }
}