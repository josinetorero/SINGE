<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('verificacoes_identidade', function (Blueprint $table) {
            $table->foreignId('utilizador_solicitante_id')
                ->nullable()
                ->constrained('users')
                ->restrictOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('verificacoes_identidade', function (Blueprint $table) {
            $table->dropConstrainedForeignId('utilizador_solicitante_id');
        });
    }
};
