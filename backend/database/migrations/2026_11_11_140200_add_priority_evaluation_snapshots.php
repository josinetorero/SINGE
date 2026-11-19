<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('detalhes_avaliacao', function (Blueprint $table): void {
            $table->string('fator_nome_snapshot', 100)->nullable()->after('fator_prioridade_id');
            $table->text('fator_descricao_snapshot')->nullable()->after('fator_nome_snapshot');
            $table->decimal('contribuicao_ponderada', 8, 2)->nullable()->after('peso_aplicado');
        });
    }

    public function down(): void
    {
        Schema::table('detalhes_avaliacao', function (Blueprint $table): void {
            $table->dropColumn([
                'fator_nome_snapshot',
                'fator_descricao_snapshot',
                'contribuicao_ponderada',
            ]);
        });
    }
};
