<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('alertas_publicos', function (Blueprint $table): void {
            $table->id();
            $table->string('titulo', 180);
            $table->text('descricao');
            $table->string('tipo_perigo', 100);
            $table->string('severidade', 30);
            $table->foreignId('localizacao_id')->nullable()->constrained('localizacoes')->restrictOnDelete();
            $table->string('area_geografica', 255)->nullable();
            $table->dateTime('data_publicacao')->nullable();
            $table->dateTime('valido_desde');
            $table->dateTime('valido_ate');
            $table->string('fonte', 180);
            $table->foreignId('utilizador_id')->constrained('users')->restrictOnDelete();
            $table->string('estado', 20)->default('rascunho');
            $table->text('recomendacoes');
            $table->timestamps();
            $table->index(['estado', 'valido_desde', 'valido_ate']);
            $table->index(['tipo_perigo', 'severidade']);
        });

        Schema::create('historico_alertas_publicos', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('alerta_publico_id')->constrained('alertas_publicos')->restrictOnDelete();
            $table->foreignId('utilizador_id')->constrained('users')->restrictOnDelete();
            $table->string('operacao', 30);
            $table->string('estado_anterior', 20)->nullable();
            $table->string('estado_novo', 20)->nullable();
            $table->text('observacoes')->nullable();
            $table->timestamps();
            $table->index(['alerta_publico_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('historico_alertas_publicos');
        Schema::dropIfExists('alertas_publicos');
    }
};
