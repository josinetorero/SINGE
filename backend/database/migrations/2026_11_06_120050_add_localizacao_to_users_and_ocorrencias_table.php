<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            if (!Schema::hasColumn('users', 'localizacao_id')) {
                $table->foreignId('localizacao_id')
                    ->nullable()
                    ->constrained('localizacoes')
                    ->nullOnDelete();
            }
        });

        Schema::table('ocorrencias', function (Blueprint $table) {
            if (!Schema::hasColumn('ocorrencias', 'localizacao_id')) {
                $table->foreignId('localizacao_id')
                    ->nullable()
                    ->constrained('localizacoes')
                    ->nullOnDelete();
            }
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['localizacao_id']);
            $table->dropColumn('localizacao_id');
        });

        Schema::table('ocorrencias', function (Blueprint $table) {
            $table->dropForeign(['localizacao_id']);
            $table->dropColumn('localizacao_id');
        });
    }
};
