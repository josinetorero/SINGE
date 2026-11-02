<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('evidencias', function (Blueprint $table) {
            $table->id();

            // Ocorrência à qual a evidência pertence
            $table->foreignId('ocorrencia_id')
                ->constrained('ocorrencias')
                ->restrictOnDelete();

            // Utilizador que submeteu a evidência
            $table->foreignId('utilizador_id')
                ->constrained('users')
                ->restrictOnDelete();

            // Dados do ficheiro
            $table->string('nome_ficheiro', 255);
            $table->string('caminho_ficheiro', 500);
            $table->string('tipo_mime', 100);
            $table->unsignedBigInteger('tamanho_bytes');

            // Informação adicional
            $table->text('descricao')->nullable();

            $table->timestamps();

            $table->index('ocorrencia_id');
            $table->index('utilizador_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('evidencias');
    }
};