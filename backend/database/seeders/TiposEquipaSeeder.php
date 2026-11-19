<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class TiposEquipaSeeder extends Seeder
{
    public function run(): void
    {
        $tipos = [
            [
                'nome' => 'Bombeiros',
                'descricao' => 'Combate a incêndios e operações de salvamento.',
            ],
            [
                'nome' => 'Saúde',
                'descricao' => 'Assistência médica e transporte de vítimas.',
            ],
            [
                'nome' => 'Resgate',
                'descricao' => 'Operações de busca e salvamento.',
            ],
            [
                'nome' => 'Polícia',
                'descricao' => 'Segurança e controlo das áreas de emergência.',
            ],
            [
                'nome' => 'Proteção Civil',
                'descricao' => 'Coordenação e apoio em situações de emergência.',
            ],
        ];

        foreach ($tipos as $tipo) {
            DB::table('tipos_equipa')->updateOrInsert(
                ['nome' => $tipo['nome']],
                [
                    'descricao' => $tipo['descricao'],
                    'ativo' => true,
                    'updated_at' => now(),
                    'created_at' => now(),
                ]
            );
        }
    }
}