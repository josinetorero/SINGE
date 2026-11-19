<?php

namespace App\Http\Requests\Alertas;

use App\Http\Requests\SingeFormRequest;
use Illuminate\Validation\Validator;

class StoreAlertaPublicoRequest extends SingeFormRequest
{
    public function authorize(): bool
    {
        return parent::authorize() && $this->userHasAnyProfile(['Administrador', 'Coordenador']);
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        return [
            'titulo' => ['required', 'string', 'max:180'],
            'descricao' => ['required', 'string'],
            'tipo_perigo' => ['required', 'string', 'max:100'],
            'severidade' => ['required', 'in:critica,alta,media,baixa,informativa'],
            'localizacao_id' => ['nullable', 'integer', 'exists:localizacoes,id'],
            'area_geografica' => ['nullable', 'string', 'max:255'],
            'valido_desde' => ['required', 'date'],
            'valido_ate' => ['required', 'date', 'after:valido_desde'],
            'fonte' => ['required', 'string', 'max:180'],
            'recomendacoes' => ['required', 'string'],
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator): void {
            if (! $this->filled('localizacao_id') && ! $this->filled('area_geografica')) {
                $validator->errors()->add('area_geografica', 'Indique uma localização ou a área geográfica abrangida.');
            }
        });
    }
}
