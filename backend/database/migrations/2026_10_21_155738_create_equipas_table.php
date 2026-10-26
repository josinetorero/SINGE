<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
{
    Schema::create('equipas', function (Blueprint $table) {
        $table->id();

        $table->string('nome', 100)->unique();
        $table->foreignId('tipo_equipa_id')
              ->constrained('tipos_equipa')
              ->restrictOnDelete();

        $table->enum('estado', [
            'disponivel',
            'em_missao',
            'indisponivel',
        ])->default('disponivel');

        $table->text('descricao')->nullable();

        $table->timestamps();
    });
}
    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('equipas');
    }
};
