<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class PerfisSeeder extends Seeder
{
    public function run(): void
    {
       $perfis = [
            [
                'nome' => 'Administrador',
                'descricao' => 'Gestão e configuração do sistema.',
            ],
            [
                'nome' => 'Operador',
                'descricao' => 'Registo e acompanhamento de ocorrências.',
            ],
            [
                'nome' => 'Coordenador',
                'descricao' => 'Coordenação das equipas e missões.',
            ],
            [
                'nome' => 'Agente',
                'descricao' => 'Participação nas operações de resposta.',
            ],
            [
                'nome' => 'Cidadão',
                'descricao' => 'Registo de ocorrências e submissão de evidências.',
            ],
        ];

        foreach ($perfis as $perfil) {
            DB::table('perfis')->updateOrInsert(
                ['nome' => $perfil['nome']],
                [
                    'descricao' => $perfil['descricao'],
                    'updated_at' => now(),
                    'created_at' => now(),
                ]
            );
        }
    }
}