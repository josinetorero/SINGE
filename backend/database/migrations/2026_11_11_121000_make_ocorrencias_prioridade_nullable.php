<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('ocorrencias', function (Blueprint $table): void {
            $table->foreignId('prioridade_id')->nullable()->change();
        });
    }

    public function down(): void
    {
        if (DB::table('ocorrencias')->whereNull('prioridade_id')->exists()) {
            throw new RuntimeException(
                'Não é possível tornar prioridade_id obrigatória enquanto existirem ocorrências pendentes de triagem.',
            );
        }

        Schema::table('ocorrencias', function (Blueprint $table): void {
            $table->foreignId('prioridade_id')->nullable(false)->change();
        });
    }
};
