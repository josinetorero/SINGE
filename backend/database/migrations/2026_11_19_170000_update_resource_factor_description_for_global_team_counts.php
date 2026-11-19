<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::table('fatores_prioridade')
            ->where('nome', 'Escassez de recursos')
            ->update([
                'descricao' => 'Número total de equipas actualmente disponíveis como recursos operacionais.',
                'updated_at' => now(),
            ]);
    }

    public function down(): void
    {
        DB::table('fatores_prioridade')
            ->where('nome', 'Escassez de recursos')
            ->update([
                'descricao' => 'Quantidade de equipas disponíveis com capacidade para responder à ocorrência.',
                'updated_at' => now(),
            ]);
    }
};
