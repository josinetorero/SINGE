<?php

namespace Database\Seeders;

use App\Models\Bairro;
use App\Models\Distrito;
use App\Models\Localizacao;
use App\Models\Municipio;
use App\Models\PostoAdministrativo;
use App\Models\Provincia;
use App\Models\Quarteirao;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class DemoGeographySeeder extends Seeder
{
    public function run(): void
    {
        DB::transaction(function (): void {
            foreach ([
                'Maputo Cidade' => 'MPM',
                'Sofala' => 'SFL',
                'Nampula' => 'NPL',
                'Cabo Delgado' => 'CDG',
            ] as $name => $code) {
                Provincia::query()->firstOrCreate(['nome' => $name], ['codigo' => $code]);
            }

            foreach ([
                ['Maputo Cidade', 'KaMpfumu', 'KaMpfumu', 'KaMpfumu', 'Polana Cimento A', 'Quarteirão 12', 'Zona urbana de Maputo', -25.9692, 32.5732],
                ['Sofala', 'Beira', 'Beira', 'Chiveve', 'Macurungo', 'Quarteirão 4', 'Macurungo, Beira', -19.8436, 34.8389],
                ['Nampula', 'Nampula', 'Nampula', 'Napipine', 'Namicopo', 'Quarteirão A', 'Namicopo, Nampula', -15.1165, 39.2663],
                ['Cabo Delgado', 'Pemba', 'Pemba', 'Paquitequete', 'Cariacó', 'Quarteirão 3', 'Cariacó, Pemba', -12.9730, 40.5178],
            ] as [$provinceName, $districtName, $municipalityName, $postName, $neighbourhoodName, $blockName, $reference, $latitude, $longitude]) {
                $province = Provincia::query()->where('nome', $provinceName)->firstOrFail();
                $district = Distrito::query()->firstOrCreate(
                    ['provincia_id' => $province->id, 'nome' => $districtName],
                );
                $municipality = Municipio::query()->firstOrCreate(
                    ['distrito_id' => $district->id, 'nome' => $municipalityName],
                );
                $post = PostoAdministrativo::query()->firstOrCreate(
                    ['distrito_id' => $district->id, 'nome' => $postName],
                );
                $neighbourhood = Bairro::query()->firstOrCreate(
                    ['municipio_id' => $municipality->id, 'nome' => $neighbourhoodName],
                    ['posto_administrativo_id' => $post->id],
                );
                $block = Quarteirao::query()->firstOrCreate(
                    ['bairro_id' => $neighbourhood->id, 'nome' => $blockName],
                    ['descricao' => 'Quarteirão de referência para dados de demonstração.'],
                );
                Localizacao::query()->firstOrCreate(
                    ['endereco_referencia' => $reference],
                    [
                        'provincia_id' => $province->id,
                        'distrito_id' => $district->id,
                        'municipio_id' => $municipality->id,
                        'posto_administrativo_id' => $post->id,
                        'bairro_id' => $neighbourhood->id,
                        'quarteirao_id' => $block->id,
                        'latitude' => $latitude,
                        'longitude' => $longitude,
                    ],
                );
            }
        });
    }
}
