<?php

namespace App\Http\Requests\Evidencias;

use App\Http\Requests\SingeFormRequest;
use App\Models\Ocorrencia;

class StoreEvidenciaRequest extends SingeFormRequest
{
    private const PERFIS_OPERACIONAIS = ['Administrador', 'Operador', 'Coordenador', 'Agente'];

    /** @return array<string, mixed> */
    public function rules(): array
    {
        return [
            'ocorrencia_id' => ['required', 'integer', 'exists:ocorrencias,id'],
            'ficheiro' => ['required', 'file', 'mimes:jpg,jpeg,png,pdf', 'max:10240'],
            'descricao' => ['nullable', 'string'],
            'utilizador_id' => ['prohibited'],
            'nome_ficheiro' => ['prohibited'],
            'caminho_ficheiro' => ['prohibited'],
            'tipo_mime' => ['prohibited'],
            'tamanho_bytes' => ['prohibited'],
        ];
    }

    public function authorize(): bool
    {
        if (! parent::authorize()) {
            return false;
        }

        $ocorrenciaId = $this->input('ocorrencia_id');
        if (! is_scalar($ocorrenciaId) || ! is_numeric($ocorrenciaId)) {
            return true;
        }

        $ocorrencia = Ocorrencia::query()->whereKey((int) $ocorrenciaId)->first();

        return $ocorrencia === null
            || (int) $ocorrencia->utilizador_id === (int) $this->user()->getAuthIdentifier()
            || $this->userHasAnyProfile(self::PERFIS_OPERACIONAIS);
    }
}
