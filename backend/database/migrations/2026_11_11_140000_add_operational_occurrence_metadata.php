<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('ocorrencias', function (Blueprint $table): void {
            $table->string('origem', 40)->default('cidadao')->after('utilizador_id');
            $table->string('comunicante_nome', 150)->nullable()->after('origem');
            $table->string('comunicante_contacto', 80)->nullable()->after('comunicante_nome');
            $table->dateTime('data_ocorrencia')->nullable()->after('comunicante_contacto');
        });
    }

    public function down(): void
    {
        Schema::table('ocorrencias', function (Blueprint $table): void {
            $table->dropColumn([
                'origem',
                'comunicante_nome',
                'comunicante_contacto',
                'data_ocorrencia',
            ]);
        });
    }
};
