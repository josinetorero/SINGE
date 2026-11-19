<?php

namespace App\Http\Requests\Missoes;

use App\Enums\EstadoMissao;
use App\Enums\EstadoOcorrencia;
use App\Http\Requests\SingeFormRequest;
use Illuminate\Validation\Rule;

class StoreMissaoRequest extends SingeFormRequest
{
    public function authorize(): bool
    {
        return parent::authorize()
            && $this->userHasAnyProfile(['Administrador', 'Coordenador']);
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        return [
            'ocorrencia_id' => [
                'required',
                'integer',
                Rule::exists('ocorrencias', 'id')->whereNotIn('estado', [
                    EstadoOcorrencia::RESOLVIDA->value,
                    EstadoOcorrencia::CANCELADA->value,
                ]),
            ],
            'equipa_id' => [
                'required',
                'integer',
                Rule::exists('equipas', 'id')->where('estado', 'disponivel'),
            ],
            'coordenador_id' => ['prohibited'],
            'estado' => ['prohibited'],
            'data_inicio' => ['prohibited'],
            'data_conclusao' => ['prohibited'],
            'data_atribuicao' => ['required', 'date'],
            'data_prevista_conclusao' => ['required', 'date', 'after_or_equal:data_atribuicao'],
            'objectivos' => ['required', 'string'],
            'instrucoes' => ['required', 'string'],
            'observacoes' => ['nullable', 'string'],
        ];
    }

    public function messages(): array
    {
        return [
            ...parent::messages(),
            'ocorrencia_id.exists' => 'A ocorrência não existe ou já não aceita novas missões.',
            'equipa_id.exists' => 'A equipa não existe ou não está disponível para atribuição.',
            'coordenador_id.prohibited' => 'O Coordenador responsável é obtido a partir da sessão autenticada.',
            'data_prevista_conclusao.after_or_equal' => 'A data prevista não pode preceder a atribuição.',
        ];
    }
}
