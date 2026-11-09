<?php

namespace App\Http\Requests\Localizacoes;

use App\Http\Requests\SingeFormRequest;
use Illuminate\Validation\Validator;

class StoreLocalizacaoRequest extends SingeFormRequest
{
    use LocationRules;

    public function authorize(): bool
    {
        return parent::authorize()
            && $this->userHasAnyProfile(['Administrador', 'Operador']);
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        return $this->locationRules();
    }

    public function withValidator(Validator $validator): void
    {
        $this->validateLocationHierarchy($validator);
    }

    public function messages(): array
    {
        return [
            ...parent::messages(),
            'latitude.required_with' => 'A latitude e a longitude devem ser fornecidas em conjunto.',
            'longitude.required_with' => 'A latitude e a longitude devem ser fornecidas em conjunto.',
            'latitude.between' => 'A latitude deve estar entre -90 e 90 graus.',
            'longitude.between' => 'A longitude deve estar entre -180 e 180 graus.',
        ];
    }
}
