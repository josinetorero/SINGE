<?php

namespace App\Http\Requests\Validacoes;

use App\Http\Requests\SingeFormRequest;
use Illuminate\Validation\Rule;

class StoreValidacaoOcorrenciaRequest extends SingeFormRequest
{
    private const ESTADOS = [
        'PENDENTE',
        'EM_VERIFICACAO',
        'VALIDADA',
        'NAO_CONFIRMADA',
        'REJEITADA',
        'DUPLICADA',
    ];

    public function authorize(): bool
    {
        return parent::authorize()
            && $this->userHasAnyProfile(['Administrador', 'Operador', 'Coordenador']);
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
       $estadosPermitidos = $this->userHasAnyProfile(['Operador'])
            ? ['VALIDADA', 'NAO_CONFIRMADA', 'REJEITADA', 'DUPLICADA']
            : self::ESTADOS;

        return [

            'ocorrencia_id' => [
                'required',
                'integer',
                'exists:ocorrencias,id',
            ],

            'ocorrencia_original_id' => [
                'required_if:estado,DUPLICADA',
                'nullable',
                'integer',
                'exists:ocorrencias,id',
                'different:ocorrencia_id',
                'prohibited_unless:estado,DUPLICADA',
            ],
            
            'estado' => ['required', Rule::in($estadosPermitidos)],
            'observacoes' => ['nullable', 'string'],
            'motivo' => [
                Rule::requiredIf(in_array($this->input('estado'), ['NAO_CONFIRMADA', 'REJEITADA'], true)),
                'nullable',
                'string',
            ],
            'utilizador_id' => ['prohibited'],
            'data_validacao' => ['prohibited'],
        ];
    }

    public function messages(): array
    {
        return [
            ...parent::messages(),
            'estado.in' => 'O estado da validação seleccionado é inválido.',
            'motivo.required' => 'É obrigatório indicar o motivo quando a ocorrência é rejeitada ou não confirmada.',
        ];
    }
}
