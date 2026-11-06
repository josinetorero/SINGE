<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('distritos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('provincia_id')
                ->constrained('provincias')
                ->restrictOnDelete();
            $table->string('nome');
            $table->string('codigo')->nullable();
            $table->timestamps();

            $table->unique(['provincia_id', 'nome']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('distritos');
    }
};
