<?php

namespace App\Services\Auth;

use App\Models\Perfil;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use RuntimeException;

class AuthService
{
    /** @param array{name: string, email: string, password: string} $dados */
    public function registrar(array $dados): User
    {
        $perfil = Perfil::query()->where('nome', 'Cidadão')->first();

        if (! $perfil) {
            throw new RuntimeException('O perfil de cidadão não está configurado.');
        }

        $utilizador = User::query()->create([
            'name' => $dados['name'],
            'email' => $dados['email'],
            'password' => Hash::make($dados['password']),
            'perfil_id' => $perfil->id,
        ]);

        return $utilizador->load('perfil', 'localizacao');
    }

    /** @param array{name: string, email: string, password: string} $dados */
    public function register(array $dados): User
    {
        return $this->registrar($dados);
    }

    /**
     * @param  array{email: string, password: string}  $dados
     * @return array{user: User, token: string}
     */
    public function autenticar(array $dados): array
    {
        $utilizador = User::query()
            ->where('email', $dados['email'])
            ->with('perfil', 'localizacao')
            ->first();

        if (! $utilizador || ! Hash::check($dados['password'], $utilizador->password)) {
            throw ValidationException::withMessages([
                'email' => ['As credenciais introduzidas são inválidas.'],
            ]);
        }

        return [
            'user' => $utilizador,
            'token' => $utilizador->createToken('singe-api')->plainTextToken,
        ];
    }

    /**
     * @param  array{email: string, password: string}  $dados
     * @return array{user: User, token: string}
     */
    public function login(array $dados): array
    {
        return $this->autenticar($dados);
    }

    public function terminarSessao(User $utilizador): void
    {
        $utilizador->currentAccessToken()->delete();
    }

    public function logout(User $utilizador): void
    {
        $this->terminarSessao($utilizador);
    }

    public function obterUtilizadorAutenticado(User $utilizador): User
    {
        return $utilizador->load('perfil', 'equipa', 'localizacao');
    }
}
