<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::table('fatores_prioridade')->where('nome', 'Localização')->update(['ativo' => false]);

        foreach ([
            'Gravidade' => 0.35,
            'Pessoas afectadas' => 0.29,
            'Vulnerabilidade' => 0.24,
            'Escassez de recursos' => 0.12,
        ] as $nome => $peso) {
            DB::table('fatores_prioridade')->where('nome', $nome)->update([
                'peso' => $peso,
                'ativo' => true,
            ]);
        }
    }

    public function down(): void
    {
        foreach ([
            'Gravidade' => 0.30,
            'Pessoas afectadas' => 0.25,
            'Vulnerabilidade' => 0.20,
            'Escassez de recursos' => 0.10,
        ] as $nome => $peso) {
            DB::table('fatores_prioridade')->where('nome', $nome)->update([
                'peso' => $peso,
                'ativo' => true,
            ]);
        }

        DB::table('fatores_prioridade')->where('nome', 'Localização')->update([
            'peso' => 0.15,
            'ativo' => true,
        ]);
    }
};
