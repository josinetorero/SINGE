<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class FatoresPrioridadeSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('fatores_prioridade')
            ->whereIn('nome', [
                'Número de vítimas',
                'Gravidade dos danos',
                'População em risco',
                'Urgência da intervenção',
            ])
            ->update([
                'ativo' => false,
                'updated_at' => now(),
            ]);

        $fatores = [
            ['nome' => 'Gravidade', 'descricao' => 'Severidade do evento e risco para a vida.', 'peso' => 0.30],
            ['nome' => 'Pessoas afectadas', 'descricao' => 'Número estimado de pessoas em risco.', 'peso' => 0.25],
            ['nome' => 'Vulnerabilidade', 'descricao' => 'Presença de pessoas vulneráveis e condições especiais.', 'peso' => 0.20],
            ['nome' => 'Localização', 'descricao' => 'Acessibilidade e proximidade das equipas.', 'peso' => 0.15],
            ['nome' => 'Escassez de recursos', 'descricao' => 'Disponibilidade dos recursos necessários para resposta.', 'peso' => 0.10],
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
                ],
            );
        }
    }
}
