<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class PrioridadesSeeder extends Seeder
{
    public function run(): void
    {
        $prioridades = [
            [
                'nome' => 'Crítica',
                'descricao' => 'Emergência com necessidade de resposta imediata.',
                'nivel' => 1,
            ],
            [
                'nome' => 'Alta',
                'descricao' => 'Emergência que exige resposta prioritária.',
                'nivel' => 2,
            ],
            [
                'nome' => 'Média',
                'descricao' => 'Emergência que requer resposta programada.',
                'nivel' => 3,
            ],
            [
                'nome' => 'Baixa',
                'descricao' => 'Ocorrência sem necessidade de resposta urgente.',
                'nivel' => 4,
            ],
        ];

        foreach ($prioridades as $prioridade) {
            DB::table('prioridades')->updateOrInsert(
                ['nome' => $prioridade['nome']],
                [
                    'descricao' => $prioridade['descricao'],
                    'nivel' => $prioridade['nivel'],
                    'updated_at' => now(),
                    'created_at' => now(),
                ]
            );
        }
    }
}