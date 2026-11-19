<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('localizacoes', function (Blueprint $table) {
            $table->id();

            $table->foreignId('provincia_id')
                ->constrained('provincias')
                ->restrictOnDelete();
            $table->foreignId('distrito_id')
                ->constrained('distritos')
                ->restrictOnDelete();
            $table->foreignId('municipio_id')
                ->nullable()
                ->constrained('municipios')
                ->nullOnDelete();
            $table->foreignId('posto_administrativo_id')
                ->nullable()
                ->constrained('postos_administrativos')
                ->nullOnDelete();
            $table->foreignId('bairro_id')
                ->nullable()
                ->constrained('bairros')
                ->nullOnDelete();
            $table->foreignId('quarteirao_id')
                ->nullable()
                ->constrained('quarteiroes')
                ->nullOnDelete();

            $table->text('endereco_referencia')->nullable();
            $table->decimal('latitude', 10, 7)->nullable();
            $table->decimal('longitude', 10, 7)->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('localizacoes');
    }
};
