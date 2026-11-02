<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class TiposOcorrenciaSeeder extends Seeder
{
    public function run(): void
    {
        $tipos = [
            [
                'nome' => 'Incêndio',
                'descricao' => 'Incêndios urbanos, florestais ou industriais.',
            ],
            [
                'nome' => 'Acidente rodoviário',
                'descricao' => 'Acidentes envolvendo veículos e pessoas.',
            ],
            [
                'nome' => 'Inundação',
                'descricao' => 'Inundações e situações de alagamento.',
            ],
            [
                'nome' => 'Emergência médica',
                'descricao' => 'Situações que exigem assistência médica urgente.',
            ],
            [
                'nome' => 'Deslizamento de terra',
                'descricao' => 'Deslizamentos e movimentos de terras.',
            ],
        ];

        foreach ($tipos as $tipo) {
            DB::table('tipos_ocorrencia')->updateOrInsert(
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