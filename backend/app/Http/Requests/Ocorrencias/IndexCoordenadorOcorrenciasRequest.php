<?php

namespace App\Http\Requests\Ocorrencias;

use App\Enums\EstadoOcorrencia;
use App\Http\Requests\SingeFormRequest;
use Illuminate\Validation\Rule;

class IndexCoordenadorOcorrenciasRequest extends SingeFormRequest
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
            'estado' => ['sometimes', Rule::enum(EstadoOcorrencia::class)],
            'tipo_ocorrencia_id' => ['sometimes', 'integer', 'exists:tipos_ocorrencia,id'],
            'prioridade_id' => ['sometimes', 'integer', 'exists:prioridades,id'],
            'provincia' => ['sometimes', 'string', 'max:120'],
            'distrito' => ['sometimes', 'string', 'max:120'],
            'per_page' => ['sometimes', 'integer', 'between:1,100'],
            'page' => ['sometimes', 'integer', 'min:1'],
            'sem_prioridade' => ['sometimes', 'boolean'],
        ];
    }
}
