<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class FatoresPrioridadeSeeder extends Seeder
{
    public function run(): void
    {
        $fatores = [
            [
                'nome' => 'Número de vítimas',
                'descricao' => 'Quantidade de pessoas feridas, desaparecidas ou mortas.',
                'peso' => 30.00,
            ],
            [
                'nome' => 'Gravidade dos danos',
                'descricao' => 'Dimensão dos danos materiais e estruturais provocados pela ocorrência.',
                'peso' => 25.00,
            ],
            [
                'nome' => 'População em risco',
                'descricao' => 'Quantidade de pessoas expostas ao perigo na área afectada.',
                'peso' => 25.00,
            ],
            [
                'nome' => 'Urgência da intervenção',
                'descricao' => 'Necessidade e rapidez com que a intervenção deve ser realizada.',
                'peso' => 20.00,
            ],
        ];

        foreach ($fatores as $fator) {
            DB::table('fatores_prioridade')->updateOrInsert(
                ['nome' => $fator['nome']],
                [
                    'descricao' => $fator['descricao'],
                    'peso' => $fator['peso'],
                    'ativo' => true,
                    'updated_at' => now(),
                    'created_at' => now(),
                ]
            );
        }
    }
}