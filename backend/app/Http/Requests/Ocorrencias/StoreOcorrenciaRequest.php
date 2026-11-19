<?php

namespace App\Http\Requests\Ocorrencias;

use App\Http\Requests\SingeFormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class StoreOcorrenciaRequest extends SingeFormRequest
{
    public function authorize(): bool
    {
        return parent::authorize() && $this->userHasAnyProfile(['Cidadão']);
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
            'prioridade_id' => ['prohibited'],
            'utilizador_id' => ['prohibited'],
            'estado' => ['prohibited'],
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator): void {
            $location = $this->input('referencia_geografica', []);
            if (! is_array($location)) $location = [];
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
            $user = $this->user();
            if ($user && ! $user->verificacoesIdentidadeSolicitadas()->where('estado', 'APROVADA')->exists()) {
                $validator->errors()->add('identidade', 'Para comunicar uma ocorrência como cidadão, primeiro submeta os documentos e aguarde a aprovação da identidade. O canal institucional continua disponível através do Operador.');
            }
        });
    }

    public function messages(): array
    {
        return [
            ...parent::messages(),
            'latitude.required_with' => 'A latitude e a longitude devem ser fornecidas em conjunto.',
            'longitude.required_with' => 'A latitude e a longitude devem ser fornecidas em conjunto.',
            'latitude.between' => 'A latitude deve estar entre -90 e 90 graus.',
            'longitude.between' => 'A longitude deve estar entre -180 e 180 graus.',
            'tipo_ocorrencia_id.exists' => 'O tipo de ocorrência seleccionado não existe.',
        ];
    }
}
