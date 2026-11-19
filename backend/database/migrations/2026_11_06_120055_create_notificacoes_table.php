<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('notificacoes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('utilizador_id')
                ->constrained('users')
                ->restrictOnDelete();
            $table->string('titulo', 150);
            $table->text('mensagem');
            $table->string('tipo', 50);
            $table->foreignId('ocorrencia_id')
                ->nullable()
                ->constrained('ocorrencias')
                ->nullOnDelete();
            $table->foreignId('missao_id')
                ->nullable()
                ->constrained('missoes')
                ->nullOnDelete();
            $table->boolean('lida')->default(false);
            $table->dateTime('data_leitura')->nullable();
            $table->timestamps();

            $table->index(['utilizador_id', 'lida']);
            $table->index(['utilizador_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('notificacoes');
    }
};
