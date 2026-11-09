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
            'coordenador_id' => ['nullable', 'integer', $this->coordinatorExistsRule()],
            'estado' => ['sometimes', Rule::enum(EstadoMissao::class)],
            'data_atribuicao' => ['required', 'date'],
            'data_inicio' => ['nullable', 'date', 'required_with:data_conclusao', 'after_or_equal:data_atribuicao'],
            'data_conclusao' => ['nullable', 'date', 'after_or_equal:data_inicio'],
            'observacoes' => ['nullable', 'string'],
        ];
    }

    public function messages(): array
    {
        return [
            ...parent::messages(),
            'ocorrencia_id.exists' => 'A ocorrência não existe ou já não aceita novas missões.',
            'equipa_id.exists' => 'A equipa não existe ou não está disponível para atribuição.',
            'coordenador_id.exists' => 'O coordenador seleccionado não tem um perfil autorizado.',
            'data_inicio.after_or_equal' => 'A data de início não pode preceder a atribuição.',
            'data_conclusao.after_or_equal' => 'A data de conclusão não pode preceder a data de início.',
        ];
    }
}
