<?php

namespace App\Http\Requests\Missoes;

use App\Enums\EstadoMissao;
use App\Http\Requests\SingeFormRequest;
use App\Models\Missao;
use Illuminate\Validation\Rule;

class UpdateMissaoRequest extends SingeFormRequest
{
    public function authorize(): bool
    {
        return parent::authorize()
            && $this->route('missao') !== null
            && $this->userHasAnyProfile(['Administrador', 'Coordenador']);
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        $missao = $this->route('missao');
        $dataAtribuicaoActual = $missao instanceof Missao
            ? $missao->getRawOriginal('data_atribuicao')
            : null;
        $dataInicioActual = $missao instanceof Missao
            ? $missao->getRawOriginal('data_inicio')
            : null;
        $dataAtribuicao = $this->input(
            'data_atribuicao',
            is_string($dataAtribuicaoActual) ? $dataAtribuicaoActual : null,
        );
        $dataInicio = $this->input(
            'data_inicio',
            is_string($dataInicioActual) ? $dataInicioActual : null,
        );
        $dataInicioRules = ['sometimes', 'nullable', 'date'];
        if ($dataAtribuicao !== null) {
            $dataInicioRules[] = 'after_or_equal:'.$dataAtribuicao;
        }
        if ($this->filled('data_conclusao')) {
            $dataInicioRules[] = 'required_with:data_conclusao';
        }
        $dataConclusaoRules = ['sometimes', 'nullable', 'date'];
        if ($dataInicio !== null) {
            $dataConclusaoRules[] = 'after_or_equal:'.$dataInicio;
        }

        return [
            'ocorrencia_id' => ['sometimes', 'required', 'integer', 'exists:ocorrencias,id'],
            'equipa_id' => ['sometimes', 'required', 'integer', 'exists:equipas,id'],
            'coordenador_id' => ['sometimes', 'nullable', 'integer', $this->coordinatorExistsRule()],
            'estado' => ['sometimes', 'required', Rule::enum(EstadoMissao::class)],
            'data_atribuicao' => ['sometimes', 'required', 'date'],
            'data_inicio' => $dataInicioRules,
            'data_conclusao' => $dataConclusaoRules,
            'observacoes' => ['sometimes', 'nullable', 'string'],
        ];
    }

    public function messages(): array
    {
        return [
            ...parent::messages(),
            'data_inicio.after_or_equal' => 'A data de início não pode preceder a atribuição.',
            'data_conclusao.after_or_equal' => 'A data de conclusão não pode preceder a data de início.',
            'coordenador_id.exists' => 'O coordenador seleccionado não tem um perfil autorizado.',
        ];
    }
}
