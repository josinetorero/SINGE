<?php

namespace App\Http\Requests\Ocorrencias;

use App\Enums\EstadoOcorrencia;
use App\Http\Requests\SingeFormRequest;
use App\Models\Ocorrencia;
use Illuminate\Validation\Rule;

class UpdateOcorrenciaRequest extends SingeFormRequest
{
    private const PERFIS_GESTORES = ['Administrador', 'Coordenador'];

    /** @return array<string, mixed> */
    public function rules(): array
    {
        $isManager = $this->userHasAnyProfile(self::PERFIS_GESTORES);
        $isOperator = $this->userHasAnyProfile(['Operador']);

        return [
            'titulo' => ['sometimes', 'required', 'string', 'max:150'],
            'descricao' => ['sometimes', 'required', 'string'],
            'localizacao' => $isOperator ? ['prohibited'] : ['sometimes', 'required', 'string', 'max:255'],
            'localizacao_id' => $isOperator ? ['prohibited'] : ['sometimes', 'nullable', 'integer', 'exists:localizacoes,id'],
            'tipo_ocorrencia_id' => $isOperator ? ['prohibited'] : ['sometimes', 'required', 'integer', 'exists:tipos_ocorrencia,id'],
            'latitude' => ['sometimes', 'nullable', 'numeric', 'between:-90,90', 'required_with:longitude'],
            'longitude' => ['sometimes', 'nullable', 'numeric', 'between:-180,180', 'required_with:latitude'],
            'estado' => $isManager
                ? ['sometimes', 'required', Rule::enum(EstadoOcorrencia::class)]
                : ['prohibited'],
            'prioridade_id' => ['prohibited'],
            'utilizador_id' => ['prohibited'],
        ];
    }

    public function authorize(): bool
    {
        $ocorrencia = $this->route('ocorrencia');

        return parent::authorize()
            && $ocorrencia instanceof Ocorrencia
            && (
                (int) $ocorrencia->utilizador_id === (int) $this->user()->getAuthIdentifier()
                || $this->userHasAnyProfile([...self::PERFIS_GESTORES, 'Operador'])
            );
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
