<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            if (!Schema::hasColumn('users', 'perfil_id')) {
                $table->foreignId('perfil_id')
                    ->nullable()
                    ->constrained('perfis')
                    ->nullOnDelete();
            }

            if (!Schema::hasColumn('users', 'equipa_id')) {
                $table->foreignId('equipa_id')
                    ->nullable()
                    ->constrained('equipas')
                    ->nullOnDelete();
            }

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
            if (Schema::hasColumn('users', 'localizacao_id')) {
                $table->dropForeign(['localizacao_id']);
                $table->dropColumn('localizacao_id');
            }

            if (Schema::hasColumn('users', 'equipa_id')) {
                $table->dropForeign(['equipa_id']);
                $table->dropColumn('equipa_id');
            }

            if (Schema::hasColumn('users', 'perfil_id')) {
                $table->dropForeign(['perfil_id']);
                $table->dropColumn('perfil_id');
            }
        });

        Schema::table('ocorrencias', function (Blueprint $table) {
            if (Schema::hasColumn('ocorrencias', 'localizacao_id')) {
                $table->dropForeign(['localizacao_id']);
                $table->dropColumn('localizacao_id');
            }
        });
    }
};
