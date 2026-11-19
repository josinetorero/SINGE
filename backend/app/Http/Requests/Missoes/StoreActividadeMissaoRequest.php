<?php

namespace App\Http\Requests\Missoes;

use App\Http\Requests\SingeFormRequest;
use Illuminate\Validation\Rule;

class StoreActividadeMissaoRequest extends SingeFormRequest
{
    public function authorize(): bool
    {
        return parent::authorize() && $this->userHasAnyProfile(['Agente']);
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        return [
            'operacao' => ['required', 'string', Rule::in([
                'conhecimento', 'progresso', 'dificuldade', 'chegada', 'concluir',
            ])],
            'observacoes' => ['nullable', 'required_unless:operacao,conhecimento', 'string', 'max:5000'],
        ];
    }
}
