<?php

namespace App\Http\Requests\Notificacoes;

use App\Http\Requests\SingeFormRequest;
use Illuminate\Validation\Rule;

class StoreNotificacaoRequest extends SingeFormRequest
{
    public function authorize(): bool
    {
        return parent::authorize()
            && $this->userHasAnyProfile(['Administrador', 'Coordenador']);
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        $missao = Rule::exists('missoes', 'id');
        if ($this->filled('ocorrencia_id')) {
            $missao->where('ocorrencia_id', $this->input('ocorrencia_id'));
        }

        return [
            'utilizador_id' => ['required', 'integer', 'exists:users,id'],
            'titulo' => ['required', 'string', 'max:150'],
            'mensagem' => ['required', 'string'],
            'tipo' => ['required', 'string', 'max:50'],
            'ocorrencia_id' => ['nullable', 'integer', 'exists:ocorrencias,id'],
            'missao_id' => ['nullable', 'integer', $missao],
            'lida' => ['prohibited'],
            'data_leitura' => ['prohibited'],
        ];
    }

    public function messages(): array
    {
        return [
            ...parent::messages(),
            'missao_id.exists' => 'A missão não existe ou não pertence à ocorrência indicada.',
        ];
    }
}
