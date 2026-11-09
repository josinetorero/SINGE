<?php

namespace App\Http\Requests\Documentos;

use App\Http\Requests\SingeFormRequest;
use App\Models\DocumentoIdentificacao;
use Illuminate\Validation\Rule;

class UpdateDocumentoIdentificacaoRequest extends SingeFormRequest
{
    /** @return array<string, mixed> */
    public function rules(): array
    {
        $documento = $this->route('documentoIdentificacao');
        $documentoId = $documento instanceof DocumentoIdentificacao ? $documento->getKey() : $documento;
        $tipoDocumento = $this->input(
            'tipo_documento',
            $documento instanceof DocumentoIdentificacao ? $documento->tipo_documento : null,
        );
        $dataEmissaoActual = $documento instanceof DocumentoIdentificacao
            ? $documento->getRawOriginal('data_emissao')
            : null;
        $dataEmissao = $this->input(
            'data_emissao',
            is_string($dataEmissaoActual) ? $dataEmissaoActual : null,
        );
        $dataValidadeRules = ['sometimes', 'nullable', 'date'];
        if ($dataEmissao !== null) {
            $dataValidadeRules[] = 'after_or_equal:'.$dataEmissao;
        }

        return [
            'tipo_documento' => ['sometimes', 'required', 'string', 'max:50'],
            'numero_documento' => [
                'sometimes',
                'required',
                'string',
                'max:100',
                Rule::unique('documentos_identificacao', 'numero_documento')
                    ->where(fn ($query) => $query->where('tipo_documento', $tipoDocumento))
                    ->ignore($documentoId),
            ],
            'nome_documento' => ['sometimes', 'nullable', 'string', 'max:150'],
            'data_nascimento' => ['sometimes', 'nullable', 'date', 'before_or_equal:today'],
            'data_emissao' => ['sometimes', 'nullable', 'date', 'before_or_equal:today'],
            'data_validade' => $dataValidadeRules,
            'ficheiro' => ['sometimes', 'nullable', 'file', 'mimes:jpg,jpeg,png,pdf', 'max:10240'],
            'utilizador_id' => ['prohibited'],
            'estado_verificacao' => ['prohibited'],
            'caminho_documento' => ['prohibited'],
        ];
    }

    public function authorize(): bool
    {
        $documento = $this->route('documentoIdentificacao');

        return parent::authorize()
            && $documento instanceof DocumentoIdentificacao
            && (int) $documento->utilizador_id === (int) $this->user()->getAuthIdentifier();
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
