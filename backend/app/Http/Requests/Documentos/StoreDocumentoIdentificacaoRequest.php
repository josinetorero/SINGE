<?php

namespace App\Http\Requests\Documentos;

use App\Http\Requests\SingeFormRequest;
use Illuminate\Validation\Rule;

class StoreDocumentoIdentificacaoRequest extends SingeFormRequest
{
    /** @return array<string, mixed> */
    public function rules(): array
    {
        $dataValidadeRules = ['nullable', 'date'];
        if ($this->filled('data_emissao')) {
            $dataValidadeRules[] = 'after_or_equal:data_emissao';
        }

        return [
            'tipo_documento' => ['required', 'string', 'max:50'],
            'numero_documento' => [
                'required',
                'string',
                'max:100',
                Rule::unique('documentos_identificacao', 'numero_documento')
                    ->where(fn ($query) => $query->where('tipo_documento', $this->input('tipo_documento'))),
            ],
            'nome_documento' => ['nullable', 'string', 'max:150'],
            'data_nascimento' => ['nullable', 'date', 'before_or_equal:today'],
            'data_emissao' => ['nullable', 'date', 'before_or_equal:today'],
            'data_validade' => $dataValidadeRules,
            'ficheiro' => ['nullable', 'file', 'mimes:jpg,jpeg,png,pdf', 'max:10240'],
            'utilizador_id' => ['prohibited'],
            'estado_verificacao' => ['prohibited'],
            'caminho_documento' => ['prohibited'],
        ];
    }

    public function messages(): array
    {
        return [
            ...parent::messages(),
            'numero_documento.unique' => 'Já existe um documento com este tipo e número.',
            'data_nascimento.before_or_equal' => 'A data de nascimento não pode ser futura.',
            'data_emissao.before_or_equal' => 'A data de emissão não pode ser futura.',
            'data_validade.after_or_equal' => 'A data de validade não pode preceder a data de emissão.',
        ];
    }
}
