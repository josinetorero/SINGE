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
    Schema::create('historico_ocorrencias', function (Blueprint $table) {
        $table->id();

        $table->foreignId('ocorrencia_id')
            ->constrained('ocorrencias')
            ->restrictOnDelete();

        $table->foreignId('utilizador_id')
            ->nullable()
            ->constrained('users')
            ->nullOnDelete();

        $table->string('estado_anterior', 30)->nullable();
        $table->string('estado_novo', 30);

        $table->text('observacoes')->nullable();

        $table->timestamps();

        $table->index(['ocorrencia_id', 'created_at']);
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('historico_ocorrencias');
    }
};
