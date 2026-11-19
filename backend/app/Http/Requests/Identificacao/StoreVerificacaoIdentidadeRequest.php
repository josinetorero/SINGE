<?php

namespace App\Http\Requests\Identificacao;

use App\Http\Requests\SingeFormRequest;

class StoreVerificacaoIdentidadeRequest extends SingeFormRequest
{
    public function authorize(): bool
    {
        return parent::authorize() && $this->userHasAnyProfile(['Cidadão']);
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        return [
            'documento_identificacao_id' => ['required', 'integer', 'exists:documentos_identificacao,id'],
            'observacoes' => ['nullable', 'string'],
            'utilizador_id' => ['prohibited'],
            'utilizador_solicitante_id' => ['prohibited'],
            'utilizador_verificador_id' => ['prohibited'],
            'estado' => ['prohibited'],
            'motivo_rejeicao' => ['prohibited'],
            'data_verificacao' => ['prohibited'],
        ];
    }
}
