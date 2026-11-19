<?php

namespace Database\Factories;

use App\Models\User;
use App\Models\Perfil;
use App\Models\Equipa;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

/**
 * @extends Factory<User>
 */
class UserFactory extends Factory
{
    /**
     * The current password being used by the factory.
     */
    protected static ?string $password;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => fake()->name(),
            'email' => fake()->unique()->safeEmail(),
            'email_verified_at' => now(),
            'password' => static::$password ??= Hash::make('password'),
            'remember_token' => Str::random(10),
        ];
    }

    /**
     * Indicate that the model's email address should be unverified.
     */
    public function unverified(): static
    {
        return $this->state(fn (array $attributes) => [
            'email_verified_at' => null,
        ]);
    }

    public function withProfile(string $profile): static
    {
        $perfil = Perfil::query()->firstOrCreate(['nome' => $profile], ['descricao' => "Perfil de teste: {$profile}."]);

        return $this->state(fn (array $attributes): array => ['perfil_id' => $perfil->id]);
    }

    public function administrator(): static { return $this->withProfile('Administrador'); }
    public function coordinator(): static { return $this->withProfile('Coordenador'); }
    public function operator(): static { return $this->withProfile('Operador'); }
    public function agent(?Equipa $team = null): static
    {
        $factory = $this->withProfile('Agente');
        return $team ? $factory->state(fn (array $attributes): array => ['equipa_id' => $team->id]) : $factory;
    }
    public function citizen(): static { return $this->withProfile('Cidadão'); }
}
