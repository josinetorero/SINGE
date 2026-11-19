<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('validacoes_ocorrencia', function (Blueprint $table) {
            $table->id();
            $table->foreignId('ocorrencia_id')
                ->constrained('ocorrencias')
                ->restrictOnDelete();
            $table->foreignId('utilizador_id')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();
            $table->string('estado', 30)->default('PENDENTE');
            $table->text('observacoes')->nullable();
            $table->text('motivo')->nullable();
            $table->dateTime('data_validacao')->nullable();
            $table->timestamps();

            $table->index(['ocorrencia_id', 'estado']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('validacoes_ocorrencia');
    }
};
