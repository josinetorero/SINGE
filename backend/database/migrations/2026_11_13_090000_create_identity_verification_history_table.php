<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('historico_verificacoes_identidade')) {
            Schema::create('historico_verificacoes_identidade', function (Blueprint $table): void {
                $table->id();
                $table->unsignedBigInteger('verificacao_identidade_id');
                $table->unsignedBigInteger('utilizador_id')->nullable();
                $table->string('estado_anterior', 40)->nullable();
                $table->string('estado_novo', 40);
                $table->string('motivo', 500)->nullable();
                $table->text('observacoes')->nullable();
                $table->timestamps();
            });
        }

        Schema::table('historico_verificacoes_identidade', function (Blueprint $table): void {
            $table->foreign('verificacao_identidade_id', 'hist_verif_fk')
                ->references('id')->on('verificacoes_identidade')->cascadeOnDelete();
            $table->foreign('utilizador_id', 'hist_utilizador_fk')
                ->references('id')->on('users')->nullOnDelete();
            $table->index(['verificacao_identidade_id', 'created_at'], 'hist_verif_data_idx');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('historico_verificacoes_identidade');
    }
};
