<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('detalhes_avaliacao', function (Blueprint $table) {
            $table->id();

            $table->foreignId('avaliacao_prioridade_id')
                ->constrained('avaliacoes_prioridade')
                ->restrictOnDelete();

            $table->foreignId('fator_prioridade_id')
                ->constrained('fatores_prioridade')
                ->restrictOnDelete();

            $table->decimal('pontuacao', 8, 2);

            $table->text('observacao')->nullable();

            $table->timestamps();

            $table->unique(
                ['avaliacao_prioridade_id', 'fator_prioridade_id'],
                'avaliacao_fator_unique'
            );
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('detalhes_avaliacao');
    }
};
