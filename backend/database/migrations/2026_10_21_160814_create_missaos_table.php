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
    Schema::create('missoes', function (Blueprint $table) {
        $table->id();

        $table->foreignId('ocorrencia_id')
            ->constrained('ocorrencias')
            ->restrictOnDelete();

        $table->foreignId('equipa_id')
            ->constrained('equipas')
            ->restrictOnDelete();

        $table->enum('estado', [
            'atribuida',
            'em_deslocacao',
            'em_execucao',
            'concluida',
            'cancelada',
        ])->default('atribuida');

        $table->dateTime('data_atribuicao');
        $table->dateTime('data_inicio')->nullable();
        $table->dateTime('data_conclusao')->nullable();

        $table->text('observacoes')->nullable();

        $table->timestamps();

        $table->index(['ocorrencia_id', 'estado']);
        $table->index(['equipa_id', 'estado']);
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('missaos');
    }
};
