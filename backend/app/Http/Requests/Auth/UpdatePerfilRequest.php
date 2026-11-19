<?php

namespace App\Http\Requests\Auth;

use App\Http\Requests\SingeFormRequest;
use Illuminate\Validation\Rule;

class UpdatePerfilRequest extends SingeFormRequest
{
    public function authorize(): bool
    {
        return parent::authorize() && $this->userHasAnyProfile(['Cidadão']);
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        return [
            'name' => ['sometimes', 'required', 'string', 'max:255'],
            'email' => [
                'sometimes',
                'required',
                'email',
                'max:255',
                Rule::unique('users', 'email')->ignore($this->user()?->getAuthIdentifier()),
            ],
            'id' => ['prohibited'],
            'perfil' => ['prohibited'],
            'perfil_id' => ['prohibited'],
            'role' => ['prohibited'],
            'equipa_id' => ['prohibited'],
            'localizacao_id' => ['prohibited'],
            'estado' => ['prohibited'],
            'permissions' => ['prohibited'],
            'password' => ['prohibited'],
        ];
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($validator): void {
            if (! $this->has('name') && ! $this->has('email')) {
                $validator->errors()->add('name', 'Indique pelo menos um dado pessoal para actualizar.');
            }
        });
    }
}
