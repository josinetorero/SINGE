<?php

namespace App\Http\Requests\Ocorrencias;

use App\Enums\EstadoOcorrencia;
use App\Http\Requests\SingeFormRequest;
use Illuminate\Validation\Rule;

class IndexOperadorOcorrenciasRequest extends SingeFormRequest
{
    public function authorize(): bool
    {
        return parent::authorize() && $this->userHasAnyProfile(['Operador']);
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        return [
            'q' => ['sometimes', 'string', 'max:150'],
            'estado' => ['sometimes', 'string', Rule::enum(EstadoOcorrencia::class)],
            'tipo_ocorrencia_id' => ['sometimes', 'integer', 'exists:tipos_ocorrencia,id'],
            'provincia' => ['sometimes', 'string', 'max:120'],
            'distrito' => ['sometimes', 'string', 'max:120'],
            'localizacao' => ['sometimes', 'string', 'max:255'],
            'data_inicio' => ['sometimes', 'date_format:Y-m-d'],
            'data_fim' => ['sometimes', 'date_format:Y-m-d', 'after_or_equal:data_inicio'],
            'ordenar_por' => ['sometimes', Rule::in(['created_at', 'updated_at', 'id'])],
            'ordem' => ['sometimes', Rule::in(['asc', 'desc'])],
            'per_page' => ['sometimes', 'integer', 'between:1,100'],
            'page' => ['sometimes', 'integer', 'min:1'],
        ];
    }

    public function messages(): array
    {
        return [
            ...parent::messages(),
            'data_fim.after_or_equal' => 'A data final deve ser igual ou posterior à data inicial.',
        ];
    }
}
