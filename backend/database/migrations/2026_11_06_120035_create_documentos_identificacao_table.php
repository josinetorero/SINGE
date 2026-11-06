<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('documentos_identificacao', function (Blueprint $table) {
            $table->id();
            $table->foreignId('utilizador_id')
                ->constrained('users')
                ->restrictOnDelete();
            $table->string('tipo_documento', 50);
            $table->string('numero_documento', 100);
            $table->string('nome_documento', 150)->nullable();
            $table->date('data_nascimento')->nullable();
            $table->date('data_emissao')->nullable();
            $table->date('data_validade')->nullable();
            $table->string('caminho_documento')->nullable();
            $table->string('estado_verificacao', 30)->default('PENDENTE');
            $table->timestamps();

            $table->unique(['tipo_documento', 'numero_documento']);
            $table->index(['utilizador_id', 'estado_verificacao']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('documentos_identificacao');
    }
};
