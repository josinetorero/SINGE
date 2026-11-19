
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('validacoes_ocorrencia', function (Blueprint $table) {
            $table->foreignId('ocorrencia_original_id')
                ->nullable()
                ->after('ocorrencia_id')
                ->constrained('ocorrencias')
                ->restrictOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('validacoes_ocorrencia', function (Blueprint $table) {
            $table->dropForeign(['ocorrencia_original_id']);
            $table->dropColumn('ocorrencia_original_id');
        });
    }
};
