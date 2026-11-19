<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('bairros', function (Blueprint $table) {
            $table->id();
            $table->foreignId('municipio_id')
                ->nullable()
                ->constrained('municipios')
                ->nullOnDelete();
            $table->foreignId('posto_administrativo_id')
                ->nullable()
                ->constrained('postos_administrativos')
                ->nullOnDelete();
            $table->string('nome');
            $table->string('codigo')->nullable();
            $table->timestamps();

            $table->unique(['municipio_id', 'nome']);
            $table->unique(['posto_administrativo_id', 'nome']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('bairros');
    }
};
