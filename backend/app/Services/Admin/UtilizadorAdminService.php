<?php

namespace App\Services\Admin;

use App\Enums\EstadoMissao;
use App\Models\Perfil;
use App\Models\Missao;
use App\Models\User;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;
use InvalidArgumentException;

class UtilizadorAdminService
{
    /** @param array<string, mixed> $filters
     *  @return Collection<int, User>
     */
    public function listar(array $filters = []): Collection
    {
        return User::query()->with(['perfil', 'equipa'])
            ->when(isset($filters['q']), function ($query) use ($filters): void {
                $term = trim((string) $filters['q']);
                $query->where(fn ($builder) => $builder
                    ->where('name', 'like', "%{$term}%")
                    ->orWhere('email', 'like', "%{$term}%"));
            })
            ->when(isset($filters['perfil']), fn ($query) => $query->whereHas(
                'perfil', fn ($profile) => $profile->where('nome', $filters['perfil']),
            ))
            ->when(isset($filters['estado']), fn ($query) => $query->where('activo', $filters['estado'] === 'Activo'))
            ->orderBy('name')
            ->get();
    }

    /** @param array<string, mixed> $data */
    public function criar(array $data): User
    {
        $profile = Perfil::query()->where('nome', $data['perfil'])->firstOrFail();

        return DB::transaction(fn (): User => User::query()->create([
            'name' => trim($data['nome']),
            'email' => strtolower(trim($data['email'])),
            'password' => $data['password'],
            'perfil_id' => $profile->id,
            'equipa_id' => $profile->nome === 'Agente' ? ($data['equipa_id'] ?? null) : null,
            'activo' => ($data['estado'] ?? 'Activo') === 'Activo',
        ])->load(['perfil', 'equipa']));
    }

    /** @param array<string, mixed> $data */
    public function actualizar(User $target, array $data, User $actor): User
    {
        return DB::transaction(function () use ($target, $data, $actor): User {
            $user = User::query()->lockForUpdate()->findOrFail($target->id);
            $profileName = $data['perfil'] ?? $user->perfil?->nome;
            $profile = $profileName ? Perfil::query()->where('nome', $profileName)->firstOrFail() : $user->perfil;

            if ((int) $user->id === (int) $actor->id
                && ($profile->nome !== 'Administrador' || ($data['estado'] ?? 'Activo') !== 'Activo')) {
                throw new AuthorizationException('Não pode remover ou desactivar a sua própria conta de Administrador.');
            }

            $nextTeamId = $profile->nome === 'Agente'
                ? (int) ($data['equipa_id'] ?? $user->equipa_id ?? 0) ?: null
                : null;
            if ($user->perfil?->nome === 'Agente'
                && ((int) $user->equipa_id !== (int) $nextTeamId || $profile->nome !== 'Agente')
                && Missao::query()->where('equipa_id', $user->equipa_id)->whereIn('estado', [
                    EstadoMissao::ATRIBUIDA->value,
                    EstadoMissao::EM_DESLOCACAO->value,
                    EstadoMissao::EM_EXECUCAO->value,
                ])->exists()) {
                throw new InvalidArgumentException('O Agente não pode mudar de equipa enquanto tiver missões activas.');
            }

            if (array_key_exists('nome', $data)) $user->name = trim($data['nome']);
            if (array_key_exists('email', $data)) $user->email = strtolower(trim($data['email']));
            $user->perfil_id = $profile->id;
            $user->equipa_id = $nextTeamId;
            if (array_key_exists('estado', $data)) {
                $user->activo = $data['estado'] === 'Activo';
                if (! $user->activo) $user->tokens()->delete();
            }
            $user->save();

            return $user->fresh(['perfil', 'equipa']);
        });
    }

    public function desactivar(User $target, User $actor): User
    {
        if ((int) $target->id === (int) $actor->id) {
            throw new AuthorizationException('Não pode desactivar a sua própria conta.');
        }

        return $this->actualizar($target, ['estado' => 'Inactivo'], $actor);
    }
}
