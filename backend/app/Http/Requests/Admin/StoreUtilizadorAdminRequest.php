<?php

namespace App\Http\Requests\Admin;

use App\Http\Requests\SingeFormRequest;
use Illuminate\Validation\Rule;

class StoreUtilizadorAdminRequest extends SingeFormRequest
{
    public function authorize(): bool
    {
        return parent::authorize() && $this->userHasAnyProfile(['Administrador']);
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        return [
            'nome' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'perfil' => ['required', 'string', Rule::exists('perfis', 'nome')],
            'equipa_id' => ['nullable', 'required_if:perfil,Agente', 'integer', 'exists:equipas,id'],
            'estado' => ['sometimes', Rule::in(['Activo', 'Inactivo'])],
            'password' => ['required', 'string', 'min:8'],
        ];
    }
}
