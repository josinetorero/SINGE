<?php

namespace App\Http\Requests\Admin;

use App\Http\Requests\SingeFormRequest;

class IndexUtilizadoresAdminRequest extends SingeFormRequest
{
    public function authorize(): bool
    {
        return parent::authorize() && $this->userHasAnyProfile(['Administrador']);
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        return [
            'q' => ['sometimes', 'string', 'max:150'],
            'perfil' => ['sometimes', 'string', 'exists:perfis,nome'],
            'estado' => ['sometimes', 'in:Activo,Inactivo'],
        ];
    }
}
