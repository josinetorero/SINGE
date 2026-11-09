<?php

namespace App\Http\Requests\Ocorrencias;

use App\Http\Requests\SingeFormRequest;

class StoreOcorrenciaRequest extends SingeFormRequest
{
    /** @return array<string, mixed> */
    public function rules(): array
    {
        return [
            'titulo' => ['required', 'string', 'max:150'],
            'descricao' => ['required', 'string'],
            'localizacao' => ['required', 'string', 'max:255'],
            'localizacao_id' => ['nullable', 'integer', 'exists:localizacoes,id'],
            'tipo_ocorrencia_id' => ['required', 'integer', 'exists:tipos_ocorrencia,id'],
            'latitude' => ['nullable', 'numeric', 'between:-90,90', 'required_with:longitude'],
            'longitude' => ['nullable', 'numeric', 'between:-180,180', 'required_with:latitude'],
            'prioridade_id' => ['prohibited'],
            'utilizador_id' => ['prohibited'],
            'estado' => ['prohibited'],
        ];
    }

    public function messages(): array
    {
        return [
            ...parent::messages(),
            'latitude.required_with' => 'A latitude e a longitude devem ser fornecidas em conjunto.',
            'longitude.required_with' => 'A latitude e a longitude devem ser fornecidas em conjunto.',
            'latitude.between' => 'A latitude deve estar entre -90 e 90 graus.',
            'longitude.between' => 'A longitude deve estar entre -180 e 180 graus.',
            'tipo_ocorrencia_id.exists' => 'O tipo de ocorrência seleccionado não existe.',
        ];
    }
}
