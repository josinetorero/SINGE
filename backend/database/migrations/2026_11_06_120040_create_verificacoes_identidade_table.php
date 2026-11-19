<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('verificacoes_identidade', function (Blueprint $table) {
            $table->id();
            $table->foreignId('documento_identificacao_id')
                ->constrained('documentos_identificacao')
                ->restrictOnDelete();
            $table->foreignId('utilizador_verificador_id')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();
            $table->string('estado', 30)->default('PENDENTE');
            $table->text('observacoes')->nullable();
            $table->text('motivo_rejeicao')->nullable();
            $table->dateTime('data_verificacao')->nullable();
            $table->timestamps();

            $table->index(['documento_identificacao_id', 'estado']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('verificacoes_identidade');
    }
};
