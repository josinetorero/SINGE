<?php

namespace App\Http\Requests\Localizacoes;

use App\Models\Localizacao;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

trait LocationRules
{
    /**
     * @return array<string, array<int, mixed>>
     */
    protected function locationRules(bool $partial = false): array
    {
        $required = $partial ? 'sometimes|required' : 'required';
        $provinciaId = $this->locationValue('provincia_id');
        $distritoId = $this->locationValue('distrito_id');
        $municipioId = $this->locationValue('municipio_id');
        $postoId = $this->locationValue('posto_administrativo_id');
        $bairroId = $this->locationValue('bairro_id');

        $distrito = Rule::exists('distritos', 'id');
        if ($provinciaId !== null) {
            $distrito->where('provincia_id', $provinciaId);
        }

        $municipio = Rule::exists('municipios', 'id');
        if ($distritoId !== null) {
            $municipio->where('distrito_id', $distritoId);
        }

        $posto = Rule::exists('postos_administrativos', 'id');
        if ($distritoId !== null) {
            $posto->where('distrito_id', $distritoId);
        }

        $bairro = Rule::exists('bairros', 'id');
        if ($municipioId !== null) {
            $bairro->where('municipio_id', $municipioId);
        }
        if ($postoId !== null) {
            $bairro->where('posto_administrativo_id', $postoId);
        }

        $quarteirao = Rule::exists('quarteiroes', 'id');
        if ($bairroId !== null) {
            $quarteirao->where('bairro_id', $bairroId);
        }

        return [
            'provincia_id' => [$required, 'integer', 'exists:provincias,id'],
            'distrito_id' => [$required, 'integer', $distrito],
            'municipio_id' => ['sometimes', 'nullable', 'integer', $municipio],
            'posto_administrativo_id' => ['sometimes', 'nullable', 'integer', $posto],
            'bairro_id' => ['sometimes', 'nullable', 'integer', $bairro],
            'quarteirao_id' => ['sometimes', 'nullable', 'integer', $quarteirao],
            'endereco_referencia' => ['sometimes', 'nullable', 'string'],
            'latitude' => ['sometimes', 'nullable', 'numeric', 'between:-90,90', 'required_with:longitude'],
            'longitude' => ['sometimes', 'nullable', 'numeric', 'between:-180,180', 'required_with:latitude'],
        ];
    }

    protected function validateLocationHierarchy(Validator $validator): void
    {
        $validator->after(function (Validator $validator): void {
            $provinciaId = $this->locationValue('provincia_id');
            $distritoId = $this->locationValue('distrito_id');
            $municipioId = $this->locationValue('municipio_id');
            $postoId = $this->locationValue('posto_administrativo_id');
            $bairroId = $this->locationValue('bairro_id');
            $quarteiraoId = $this->locationValue('quarteirao_id');

            if ($bairroId !== null && $municipioId === null && $postoId === null) {
                $validator->errors()->add(
                    'bairro_id',
                    'Indique o município ou o posto administrativo a que pertence o bairro.',
                );
            }

            if ($this->relationDoesNotMatch('distritos', $distritoId, 'provincia_id', $provinciaId)) {
                $validator->errors()->add('distrito_id', 'O distrito não pertence à província seleccionada.');
            }
            if ($this->relationDoesNotMatch('municipios', $municipioId, 'distrito_id', $distritoId)) {
                $validator->errors()->add('municipio_id', 'O município não pertence ao distrito seleccionado.');
            }
            if ($this->relationDoesNotMatch('postos_administrativos', $postoId, 'distrito_id', $distritoId)) {
                $validator->errors()->add('posto_administrativo_id', 'O posto administrativo não pertence ao distrito seleccionado.');
            }
            if ($this->relationDoesNotMatch('bairros', $bairroId, 'municipio_id', $municipioId)) {
                $validator->errors()->add('bairro_id', 'O bairro não pertence ao município seleccionado.');
            }
            if ($this->relationDoesNotMatch('bairros', $bairroId, 'posto_administrativo_id', $postoId)) {
                $validator->errors()->add('bairro_id', 'O bairro não pertence ao posto administrativo seleccionado.');
            }
            if ($this->relationDoesNotMatch('quarteiroes', $quarteiraoId, 'bairro_id', $bairroId)) {
                $validator->errors()->add('quarteirao_id', 'O quarteirão não pertence ao bairro seleccionado.');
            }
        });
    }

    private function relationDoesNotMatch(string $table, mixed $id, string $parentColumn, mixed $parentId): bool
    {
        if ($id === null || $parentId === null) {
            return false;
        }

        return ! DB::table($table)
            ->where('id', $id)
            ->where($parentColumn, $parentId)
            ->exists();
    }

    private function locationValue(string $key): mixed
    {
        if (array_key_exists($key, $this->all())) {
            return $this->input($key);
        }

        $location = $this->route('localizacao');

        return $location instanceof Localizacao ? $location->getAttribute($key) : null;
    }
}
