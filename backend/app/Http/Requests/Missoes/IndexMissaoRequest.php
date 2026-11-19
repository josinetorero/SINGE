<?php

namespace App\Http\Requests\Missoes;

use App\Enums\EstadoMissao;
use App\Http\Requests\SingeFormRequest;
use Illuminate\Validation\Rule;

class IndexMissaoRequest extends SingeFormRequest
{
    public function authorize(): bool
    {
        return parent::authorize() && $this->userHasAnyProfile(['Administrador', 'Coordenador']);
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        return [
            'q' => ['sometimes', 'string', 'max:150'],
            'estado' => ['sometimes', Rule::enum(EstadoMissao::class)],
            'equipa_id' => ['sometimes', 'integer', 'exists:equipas,id'],
            'ocorrencia_id' => ['sometimes', 'integer', 'exists:ocorrencias,id'],
        ];
    }
}
