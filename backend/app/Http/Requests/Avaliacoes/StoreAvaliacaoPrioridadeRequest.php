<?php

namespace App\Http\Requests\Avaliacoes;

use App\Http\Requests\SingeFormRequest;
use Illuminate\Validation\Rule;

class StoreAvaliacaoPrioridadeRequest extends SingeFormRequest
{
    public function authorize(): bool
    {
        if (! parent::authorize() || ! $this->userHasAnyProfile(['Administrador', 'Operador', 'Coordenador'])) {
            return false;
        }

        return ! $this->boolean('risco_iminente_morte')
            || $this->userHasAnyProfile(['Administrador', 'Coordenador']);
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        return [
            'ocorrencia_id' => ['required', 'integer', 'exists:ocorrencias,id'],
            'factores' => ['required', 'array', 'min:5', 'max:5'],
            'factores.*' => ['required', 'array:fator_prioridade_id,pontuacao,observacao'],
            'factores.*.fator_prioridade_id' => [
                'required',
                'integer',
                'distinct',
                Rule::exists('fatores_prioridade', 'id')->where('ativo', true),
            ],
            'factores.*.pontuacao' => ['required', 'numeric', 'between:0,10'],
            'factores.*.observacao' => ['nullable', 'string'],
            'justificacao' => [
                Rule::requiredIf($this->boolean('risco_iminente_morte')),
                'nullable',
                'string',
            ],
            'risco_iminente_morte' => ['sometimes', 'boolean'],
            'prioridade_id' => ['prohibited'],
            'pontuacao_total' => ['prohibited'],
            'utilizador_id' => ['prohibited'],
        ];
    }

    public function messages(): array
    {
        return [
            ...parent::messages(),
            'factores.min' => 'A avaliação deve incluir os cinco factores oficiais.',
            'factores.max' => 'A avaliação deve incluir os cinco factores oficiais.',
            'factores.*.fator_prioridade_id.distinct' => 'Não é permitido repetir factores na mesma avaliação.',
            'factores.*.fator_prioridade_id.exists' => 'O factor seleccionado não existe ou está inactivo.',
            'factores.*.pontuacao.between' => 'A pontuação de cada factor deve estar entre 0 e 10.',
            'justificacao.required' => 'A classificação crítica excepcional exige uma justificação fundamentada.',
            'prioridade_id.prohibited' => 'A prioridade é determinada pelo sistema.',
            'pontuacao_total.prohibited' => 'A pontuação total é calculada pelo sistema.',
        ];
    }
}
