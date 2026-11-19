<?php

use Illuminate\Support\Facades\Schema;

it('cria a estrutura de missões com coordenador opcional e chaves estrangeiras', function () {
    expect(Schema::hasTable('missoes'))->toBeTrue()
        ->and(Schema::hasColumn('missoes', 'coordenador_id'))->toBeTrue();

    $coordenador = collect(Schema::getColumns('missoes'))
        ->firstWhere('name', 'coordenador_id');

    expect($coordenador['nullable'])->toBeTrue();

    $foreignKeys = collect(Schema::getForeignKeys('missoes'));
    foreach ([
        ['ocorrencia_id', 'ocorrencias'],
        ['equipa_id', 'equipas'],
        ['coordenador_id', 'users'],
    ] as [$column, $table]) {
        expect($foreignKeys->contains(
            fn (array $foreignKey): bool => $foreignKey['columns'] === [$column]
                && $foreignKey['foreign_table'] === $table
                && $foreignKey['foreign_columns'] === ['id'],
        ))->toBeTrue();
    }
});
