<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterRequest;
use App\Models\Perfil;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    // Registo público de cidadãos
    public function register(RegisterRequest $request)
    {
        $dados = $request->validated();

        // Procurar o perfil de cidadão
        $perfil = Perfil::where('nome', 'Cidadão')->first();

        if (! $perfil) {
            return response()->json([
                'message' => 'O perfil de cidadão não está configurado.',
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
    public function login(LoginRequest $request)
    {
        $dados = $request->validated();

        $utilizador = User::where('email', $dados['email'])
            ->with('perfil', 'localizacao')
            ->first();

        if (! $utilizador || ! Hash::check($dados['password'], $utilizador->password)) {
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
            'message' => 'Sessão terminada com sucesso.',
        ], 200);
    }

    // Consultar utilizador autenticado
    public function user(Request $request)
    {
        return response()->json([
            'user' => $request->user()->load('perfil', 'equipa', 'localizacao'),
        ], 200);
    }
}
