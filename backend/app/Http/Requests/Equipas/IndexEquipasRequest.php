<?php

namespace App\Http\Requests\Equipas;

use App\Enums\EstadoEquipa;
use App\Http\Requests\SingeFormRequest;

class IndexEquipasRequest extends SingeFormRequest
{
    public function authorize(): bool
    {
        return parent::authorize() && $this->userHasAnyProfile(['Administrador', 'Coordenador']);
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        return [
            'q' => ['sometimes', 'string', 'max:120'],
            'tipo_equipa_id' => ['sometimes', 'integer', 'exists:tipos_equipa,id'],
            'estado' => ['sometimes', 'string', \Illuminate\Validation\Rule::enum(EstadoEquipa::class)],
        ];
    }
}
