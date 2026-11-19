<?php

namespace App\Http\Middleware;

use App\Models\Perfil;
use App\Models\User;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class VerificarPerfil
{
    private const PERFIS_VALIDOS = [
        'Administrador',
        'Operador',
        'Coordenador',
        'Agente',
        'Cidadão',
    ];

    public function handle(Request $request, Closure $next, string ...$perfis): Response
    {
        $utilizador = $request->user();

        if (! $utilizador instanceof User) {
            return response()->json([
                'success' => false,
                'message' => 'Autenticação necessária.',
            ], 401);
        }

        $perfil = $utilizador->perfil;
        if (! $perfil instanceof Perfil || ! in_array($perfil->nome, self::PERFIS_VALIDOS, true)) {
            return response()->json([
                'success' => false,
                'message' => 'O utilizador não possui um perfil válido.',
            ], 403);
        }

        $perfisPermitidos = [];
        foreach ($perfis as $perfilPermitido) {
            $perfisPermitidos = [...$perfisPermitidos, ...explode(',', $perfilPermitido)];
        }
        $perfisPermitidos = array_map('trim', $perfisPermitidos);

        if (! in_array($perfil->nome, $perfisPermitidos, true)) {
            return response()->json([
                'success' => false,
                'message' => 'O perfil do utilizador não está autorizado a executar esta operação.',
            ], 403);
        }

        return $next($request);
    }
}
