<?php

namespace App\Http\Requests\Ocorrencias;

use App\Http\Requests\SingeFormRequest;
use Illuminate\Validation\Rule;

class StoreOperatorOcorrenciaRequest extends SingeFormRequest
{
    public function authorize(): bool
    {
        return parent::authorize() && $this->userHasAnyProfile(['Operador']);
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        return [
            'titulo' => ['required', 'string', 'max:150'],
            'descricao' => ['required', 'string'],
            'localizacao' => ['required', 'string', 'max:255'],
            'localizacao_id' => ['nullable', 'integer', 'exists:localizacoes,id'],
            'referencia_geografica' => ['sometimes', 'array'],
            'referencia_geografica.provincia_id' => ['required_with:referencia_geografica', 'integer', 'exists:provincias,id'],
            'referencia_geografica.distrito_id' => ['required_with:referencia_geografica', 'integer', Rule::exists('distritos', 'id')->where('provincia_id', $this->input('referencia_geografica.provincia_id'))],
            'referencia_geografica.municipio_id' => ['nullable', 'integer', Rule::exists('municipios', 'id')->where('distrito_id', $this->input('referencia_geografica.distrito_id'))],
            'referencia_geografica.posto_administrativo_id' => ['nullable', 'integer', Rule::exists('postos_administrativos', 'id')->where('distrito_id', $this->input('referencia_geografica.distrito_id'))],
            'referencia_geografica.bairro_id' => ['nullable', 'integer', Rule::exists('bairros', 'id')],
            'referencia_geografica.quarteirao_id' => ['nullable', 'integer', Rule::exists('quarteiroes', 'id')->where('bairro_id', $this->input('referencia_geografica.bairro_id'))],
            'referencia_geografica.endereco_referencia' => ['nullable', 'string', 'max:1000'],
            'tipo_ocorrencia_id' => [
                'required',
                'integer',
                'exists:tipos_ocorrencia,id,ativo,1',
            ],
            'latitude' => ['nullable', 'numeric', 'between:-90,90', 'required_with:longitude'],
            'longitude' => ['nullable', 'numeric', 'between:-180,180', 'required_with:latitude'],
            'origem' => ['required', Rule::in([
                'observacao_directa',
                'telefone',
                'instituicao',
                'autoridades_locais',
                'outra',
            ])],
            'comunicante_nome' => ['nullable', 'string', 'max:150'],
            'comunicante_contacto' => ['nullable', 'string', 'max:80', 'regex:/^\+?[0-9\s().-]{7,25}$/'],
            'data_ocorrencia' => ['nullable', 'date', 'before_or_equal:now'],
            'prioridade_id' => ['prohibited'],
            'utilizador_id' => ['prohibited'],
            'estado' => ['prohibited'],
            'data_registo' => ['prohibited'],
        ];
    }

    public function messages(): array
    {
        return [
            ...parent::messages(),
            'tipo_ocorrencia_id.exists' => 'O tipo de ocorrência seleccionado não existe ou está inactivo.',
            'comunicante_contacto.regex' => 'Indique um contacto telefónico válido, incluindo o indicativo do país quando necessário.',
            'data_ocorrencia.before_or_equal' => 'A data da ocorrência não pode estar no futuro.',
        ];
    }

    public function withValidator(\Illuminate\Validation\Validator $validator): void
    {
        $validator->after(function (\Illuminate\Validation\Validator $validator): void {
            $location = $this->input('referencia_geografica', []);
            if (! is_array($location)) return;
            if (! empty($location['municipio_id']) && ! empty($location['posto_administrativo_id'])) {
                $validator->errors()->add('referencia_geografica', 'Seleccione um município ou um posto administrativo, não ambos.');
            }
            if (! empty($location['bairro_id'])) {
                $belongs = \Illuminate\Support\Facades\DB::table('bairros')->where('id', $location['bairro_id'])
                    ->when(! empty($location['municipio_id']), fn ($query) => $query->where('municipio_id', $location['municipio_id']))
                    ->when(! empty($location['posto_administrativo_id']), fn ($query) => $query->where('posto_administrativo_id', $location['posto_administrativo_id']))
                    ->exists();
                if (! $belongs || (empty($location['municipio_id']) && empty($location['posto_administrativo_id']))) {
                    $validator->errors()->add('referencia_geografica.bairro_id', 'Seleccione um bairro pertencente ao município ou posto administrativo indicado.');
                }
            }
        });
    }
}
