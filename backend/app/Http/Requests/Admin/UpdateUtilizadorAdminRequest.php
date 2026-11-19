<?php

namespace App\Http\Requests\Admin;

use App\Http\Requests\SingeFormRequest;
use Illuminate\Validation\Rule;

class UpdateUtilizadorAdminRequest extends SingeFormRequest
{
    public function authorize(): bool
    {
        return parent::authorize() && $this->userHasAnyProfile(['Administrador']);
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        $user = $this->route('utilizador');

        return [
            'nome' => ['sometimes', 'required', 'string', 'max:255'],
            'email' => ['sometimes', 'required', 'email', 'max:255', Rule::unique('users', 'email')->ignore($user?->id)],
            'perfil' => ['sometimes', 'required', 'string', Rule::exists('perfis', 'nome')],
            'equipa_id' => ['nullable', 'required_if:perfil,Agente', 'integer', 'exists:equipas,id'],
            'estado' => ['sometimes', Rule::in(['Activo', 'Inactivo'])],
            'password' => ['prohibited'],
        ];
    }
}
