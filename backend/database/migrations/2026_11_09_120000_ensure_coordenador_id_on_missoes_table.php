<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    private const COLUMN_COMMENT = 'Added by 2026_11_09_120000_ensure_coordenador_id_on_missoes_table';

    private const FOREIGN_KEY = 'missoes_coordenador_id_corrective_foreign';

    public function up(): void
    {
        if (! Schema::hasColumn('missoes', 'coordenador_id')) {
            Schema::table('missoes', function (Blueprint $table) {
                $table->foreignId('coordenador_id')
                    ->nullable()
                    ->after('equipa_id')
                    ->comment(self::COLUMN_COMMENT);
            });
        }

        $foreignKeys = Schema::getForeignKeys('missoes');
        $coordinatorForeignKeys = array_values(array_filter(
            $foreignKeys,
            fn (array $foreignKey): bool => in_array('coordenador_id', $foreignKey['columns'], true),
        ));

        if ($coordinatorForeignKeys !== []) {
            $hasUsersForeignKey = collect($coordinatorForeignKeys)->contains(
                fn (array $foreignKey): bool => $foreignKey['columns'] === ['coordenador_id']
                    && $foreignKey['foreign_table'] === 'users'
                    && $foreignKey['foreign_columns'] === ['id'],
            );

            if (! $hasUsersForeignKey) {
                throw new RuntimeException('A coluna missoes.coordenador_id já possui uma chave estrangeira incompatível.');
            }

            return;
        }

        Schema::table('missoes', function (Blueprint $table) {
            $table->foreign('coordenador_id', self::FOREIGN_KEY)
                ->references('id')
                ->on('users')
                ->restrictOnDelete();
        });
    }

    public function down(): void
    {
        $foreignKeys = Schema::getForeignKeys('missoes');
        $correctiveForeignKeyExists = collect($foreignKeys)
            ->contains(fn (array $foreignKey): bool => $foreignKey['name'] === self::FOREIGN_KEY);

        if ($correctiveForeignKeyExists) {
            Schema::table('missoes', function (Blueprint $table) {
                $table->dropForeign(self::FOREIGN_KEY);
            });
        }

        $coordinatorColumn = collect(Schema::getColumns('missoes'))
            ->firstWhere('name', 'coordenador_id');

        if (($coordinatorColumn['comment'] ?? null) === self::COLUMN_COMMENT) {
            Schema::table('missoes', function (Blueprint $table) {
                $table->dropColumn('coordenador_id');
            });
        }
    }
};
