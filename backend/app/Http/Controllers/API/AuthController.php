<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Perfil;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    // Registo público de cidadãos
    public function register(Request $request)
    {
        $dados = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255|unique:users,email',
            'password' => 'required|string|min:8|confirmed',
        ]);

        // Procurar o perfil de cidadão
        $perfil = Perfil::where('nome', 'Cidadão')->first();

        if (!$perfil) {
            return response()->json([
                'message' => 'O perfil de cidadão não está configurado.'
            ], 500);
        }

        // Criar utilizador
        $utilizador = User::create([
            'name' => $dados['name'],
            'email' => $dados['email'],
            'password' => Hash::make($dados['password']),
            'perfil_id' => $perfil->id,
        ]);

        // Gerar token
        $token = $utilizador->createToken('singe-api')->plainTextToken;

        $utilizador->load('perfil', 'localizacao');

        return response()->json([
            'message' => 'Registo efectuado com sucesso.',
            'user' => $utilizador,
            'token' => $token,
        ], 201);
    }

    // Iniciar sessão
    public function login(Request $request)
    {
        $dados = $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        $utilizador = User::where('email', $dados['email'])
            ->with('perfil', 'localizacao')
            ->first();

        if (!$utilizador || !Hash::check($dados['password'], $utilizador->password)) {
            throw ValidationException::withMessages([
                'email' => ['As credenciais introduzidas são inválidas.'],
            ]);
        }

        $token = $utilizador->createToken('singe-api')->plainTextToken;

        return response()->json([
            'message' => 'Autenticação efectuada com sucesso.',
            'user' => $utilizador,
            'token' => $token,
        ], 200);
    }

    // Terminar sessão
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Sessão terminada com sucesso.'
        ], 200);
    }

    // Consultar utilizador autenticado
    public function user(Request $request)
    {
        return response()->json([
            'user' => $request->user()->load('perfil', 'equipa', 'localizacao')
        ], 200);
    }
}