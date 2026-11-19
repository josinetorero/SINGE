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
        Schema::create('avaliacoes_prioridade', function (Blueprint $table) {
            $table->id();

            $table->foreignId('ocorrencia_id')
                ->constrained('ocorrencias')
                ->restrictOnDelete();

            $table->foreignId('utilizador_id')
                ->constrained('users')
                ->restrictOnDelete();

            $table->foreignId('prioridade_id')
                ->constrained('prioridades')
                ->restrictOnDelete();

            $table->decimal('pontuacao_total', 8, 2);

            $table->text('justificacao')->nullable();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('avaliacoes_prioridade');
    }
};
