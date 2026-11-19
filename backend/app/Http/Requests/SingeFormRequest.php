<?php

namespace App\Http\Requests;

use App\Models\User;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Exists;

abstract class SingeFormRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    /**
     * @param  array<int, string>  $profileNames
     */
    protected function userHasAnyProfile(array $profileNames): bool
    {
        $user = $this->user();

        return $user instanceof User
            && in_array($user->perfil()->value('nome'), $profileNames, true);
    }

    protected function coordinatorExistsRule(): Exists
    {
        return Rule::exists('users', 'id')->where(
            fn ($query) => $query->whereIn(
                'perfil_id',
                DB::table('perfis')->select('id')->whereIn('nome', ['Administrador', 'Coordenador']),
            ),
        );
    }

    /**
     * @return array<string, string|array<string, string>>
     */
    public function messages(): array
    {
        return [
            'required' => 'O campo :attribute é obrigatório.',
            'required_if' => 'O campo :attribute é obrigatório.',
            'required_with' => 'O campo :attribute é obrigatório.',
            'required_without' => 'O campo :attribute é obrigatório.',
            'string' => 'O campo :attribute deve ser texto.',
            'integer' => 'O campo :attribute deve ser um número inteiro.',
            'numeric' => 'O campo :attribute deve ser numérico.',
            'email' => 'O campo :attribute deve conter um endereço de e-mail válido.',
            'exists' => 'O valor seleccionado para :attribute não existe.',
            'unique' => 'O valor do campo :attribute já está em utilização.',
            'confirmed' => 'A confirmação do campo :attribute não corresponde.',
            'date' => 'O campo :attribute deve ser uma data válida.',
            'date_format' => 'O campo :attribute tem um formato inválido.',
            'after_or_equal' => 'O campo :attribute deve ser posterior ou igual à data indicada.',
            'before_or_equal' => 'O campo :attribute deve ser anterior ou igual à data indicada.',
            'min' => [
                'numeric' => 'O campo :attribute deve ser no mínimo :min.',
                'file' => 'O ficheiro :attribute deve ter pelo menos :min kilobytes.',
                'string' => 'O campo :attribute deve conter pelo menos :min caracteres.',
            ],
            'max' => [
                'numeric' => 'O campo :attribute não pode ser superior a :max.',
                'file' => 'O ficheiro :attribute não pode exceder :max kilobytes.',
                'string' => 'O campo :attribute não pode exceder :max caracteres.',
            ],
            'between' => 'O campo :attribute deve estar entre :min e :max.',
            'mimes' => 'O ficheiro :attribute deve ter um dos formatos permitidos.',
            'file' => 'O campo :attribute deve ser um ficheiro válido.',
            'prohibited' => 'Não é permitido enviar o campo :attribute.',
            'in' => 'O valor seleccionado para :attribute é inválido.',
            'enum' => 'O valor seleccionado para :attribute é inválido.',
            'boolean' => 'O campo :attribute deve ser verdadeiro ou falso.',
            'required_without_all' => 'Indique pelo menos uma das referências administrativas para :attribute.',
        ];
    }

    /**
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return [
            'name' => 'nome',
            'email' => 'e-mail',
            'password' => 'palavra-passe',
            'titulo' => 'título',
            'descricao' => 'descrição',
            'localizacao' => 'localização',
            'localizacao_id' => 'localização',
            'latitude' => 'latitude',
            'longitude' => 'longitude',
            'tipo_ocorrencia_id' => 'tipo de ocorrência',
            'prioridade_id' => 'prioridade',
            'utilizador_id' => 'utilizador',
            'ocorrencia_id' => 'ocorrência',
            'equipa_id' => 'equipa',
            'coordenador_id' => 'coordenador',
            'estado' => 'estado',
            'estado_verificacao' => 'estado de verificação',
            'pontuacao_total' => 'pontuação total',
            'justificacao' => 'justificação',
            'ficheiro' => 'ficheiro',
            'tipo_documento' => 'tipo de documento',
            'numero_documento' => 'número do documento',
            'data_nascimento' => 'data de nascimento',
            'data_emissao' => 'data de emissão',
            'data_validade' => 'data de validade',
            'provincia_id' => 'província',
            'distrito_id' => 'distrito',
            'municipio_id' => 'município',
            'posto_administrativo_id' => 'posto administrativo',
            'bairro_id' => 'bairro',
            'quarteirao_id' => 'quarteirão',
            'endereco_referencia' => 'endereço de referência',
            'mensagem' => 'mensagem',
            'tipo' => 'tipo',
            'lida' => 'lida',
            'data_leitura' => 'data de leitura',
            'observacoes' => 'observações',
            'motivo' => 'motivo',
            'motivo_rejeicao' => 'motivo da rejeição',
            'data_validacao' => 'data de validação',
            'data_atribuicao' => 'data de atribuição',
            'data_inicio' => 'data de início',
            'data_conclusao' => 'data de conclusão',
            'tamanho_bytes' => 'tamanho do ficheiro',
        ];
    }
}
