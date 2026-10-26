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
    Schema::create('ocorrencias', function (Blueprint $table) {
        $table->id();

        $table->string('titulo', 150);
        $table->text('descricao');

        // Localização da ocorrência
        $table->string('localizacao', 255);
        $table->decimal('latitude', 10, 7)->nullable();
        $table->decimal('longitude', 10, 7)->nullable();

        // Classificação da ocorrência
        $table->foreignId('tipo_ocorrencia_id')
            ->constrained('tipos_ocorrencia')
            ->restrictOnDelete();

        $table->foreignId('prioridade_id')
            ->constrained('prioridades')
            ->restrictOnDelete();

        // Utilizador que registou a ocorrência
        $table->foreignId('utilizador_id')
            ->constrained('users')
            ->restrictOnDelete();

        // Estado atual da ocorrência
        $table->enum('estado', [
            'registada',
            'em_avaliacao',
            'em_atendimento',
            'resolvida',
            'cancelada',
        ])->default('registada');

        $table->timestamps();
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ocorrencias');
    }
};
