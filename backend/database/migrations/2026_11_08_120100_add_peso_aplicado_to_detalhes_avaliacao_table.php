<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('detalhes_avaliacao', function (Blueprint $table) {
            $table->decimal('peso_aplicado', 5, 2)->nullable()->after('pontuacao');
        });
    }

    public function down(): void
    {
        Schema::table('detalhes_avaliacao', function (Blueprint $table) {
            $table->dropColumn('peso_aplicado');
        });
    }
};
