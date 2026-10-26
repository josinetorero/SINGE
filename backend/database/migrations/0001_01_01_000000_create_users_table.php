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
    Schema::table('users', function (Blueprint $table) {
        $table->foreignId('perfil_id')
            ->constrained('perfis')
            ->restrictOnDelete();

        $table->foreignId('equipa_id')
            ->nullable()
            ->constrained('equipas')
            ->nullOnDelete();
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
{
    Schema::table('users', function (Blueprint $table) {
        $table->dropForeign(['perfil_id']);
        $table->dropForeign(['equipa_id']);

        $table->dropColumn(['perfil_id', 'equipa_id']);
    });
}
};
