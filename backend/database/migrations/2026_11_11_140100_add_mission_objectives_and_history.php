<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('missoes', function (Blueprint $table): void {
            $table->text('objectivos')->nullable()->after('observacoes');
            $table->text('instrucoes')->nullable()->after('objectivos');
            $table->dateTime('data_prevista_conclusao')->nullable()->after('data_inicio');
        });

        Schema::create('historico_missoes', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('missao_id')->constrained('missoes')->restrictOnDelete();
            $table->foreignId('utilizador_id')->constrained('users')->restrictOnDelete();
            $table->string('operacao', 30);
            $table->string('estado_anterior', 30)->nullable();
            $table->string('estado_novo', 30)->nullable();
            $table->text('observacoes')->nullable();
            $table->timestamps();
            $table->index(['missao_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('historico_missoes');
        Schema::table('missoes', function (Blueprint $table): void {
            $table->dropColumn(['objectivos', 'instrucoes', 'data_prevista_conclusao']);
        });
    }
};
