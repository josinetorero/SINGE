<?php

namespace App\Http\Requests\Ocorrencias;

use App\Enums\EstadoOcorrencia;
use App\Http\Requests\SingeFormRequest;
use Illuminate\Validation\Rule;

class IndexOcorrenciasRequest extends SingeFormRequest
{
    public function authorize(): bool
    {
        return parent::authorize() && $this->userHasAnyProfile(['Cidadão']);
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        return [
            'estado' => ['sometimes', 'string', Rule::enum(EstadoOcorrencia::class)],
            'tipo_ocorrencia_id' => ['sometimes', 'integer', 'exists:tipos_ocorrencia,id,ativo,1'],
            'per_page' => ['sometimes', 'integer', 'between:1,100'],
            'page' => ['sometimes', 'integer', 'min:1'],
        ];
    }
}
