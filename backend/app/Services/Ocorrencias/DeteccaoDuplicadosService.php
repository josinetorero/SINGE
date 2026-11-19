<?php
namespace App\Services\Ocorrencias;

use App\Models\Ocorrencia;
use App\Models\ValidacaoOcorrencia;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class DeteccaoDuplicadosService
{
    private const JANELA_HORAS = 24;
    private const RAIO_KM = 5;
    private const MAX_CANDIDATOS = 10;

    /**
     * Procura ocorrências que podem representar o mesmo evento.
     *
     * Não confirma duplicações. Apenas devolve candidatos
     * para posterior análise.
     *
     * @return array<int, array{
     *     ocorrencia: Ocorrencia,
     *     distancia_km: ?float,
     *     criterio: string
     * }>
     */
    public function buscarCandidatas(Ocorrencia $ocorrencia): array
    {
        $dataReferencia = $ocorrencia->data_ocorrencia
            ?? $ocorrencia->created_at;

        if (! $dataReferencia) {
            return [];
        }

        $dataReferencia = Carbon::parse($dataReferencia);

        $inicio = $dataReferencia->copy()
            ->subHours(self::JANELA_HORAS);

        $fim = $dataReferencia->copy()
            ->addHours(self::JANELA_HORAS);

        $ocorrencia->loadMissing('localizacaoGeografica');

        $latitude = $this->obterCoordenada(
            $ocorrencia,
            'latitude'
        );

        $longitude = $this->obterCoordenada(
            $ocorrencia,
            'longitude'
        );

        $temGps = $latitude !== null && $longitude !== null;

        // Sem GPS, só é possível procurar pela mesma localização.
        if (! $temGps && $ocorrencia->localizacao_id === null) {
            return [];
        }

        $ultimasValidacoes = DB::table('validacoes_ocorrencia')
            ->selectRaw('MAX(id) as id')
            ->groupBy('ocorrencia_id');

        $ocorrenciasJaDuplicadas = DB::table(
            'validacoes_ocorrencia as validacao'
        )
            ->joinSub(
                $ultimasValidacoes,
                'ultima_validacao',
                'validacao.id',
                '=',
                'ultima_validacao.id'
            )
            ->where('validacao.estado', 'DUPLICADA')
            ->select('validacao.ocorrencia_id');

        $candidatos = Ocorrencia::query()
            ->with('localizacaoGeografica')
            ->where('id', '!=', $ocorrencia->id)
            ->where(
                'tipo_ocorrencia_id',
                $ocorrencia->tipo_ocorrencia_id
            )
            ->whereRaw(
                'COALESCE(data_ocorrencia, created_at) BETWEEN ? AND ?',
                [$inicio, $fim]
            )
            ->whereNotIn('id', $ocorrenciasJaDuplicadas)
            ->when(
                ! $temGps,
                fn ($query) => $query->where(
                    'localizacao_id',
                    $ocorrencia->localizacao_id
                )
            )
            ->get();

        $resultado = [];

        foreach ($candidatos as $candidato) {
            if (! $temGps) {
                $resultado[] = [
                    'ocorrencia' => $candidato,
                    'distancia_km' => null,
                    'criterio' => 'MESMA_LOCALIZACAO',
                ];

                continue;
            }

            $latitudeCandidata = $this->obterCoordenada(
                $candidato,
                'latitude'
            );

            $longitudeCandidata = $this->obterCoordenada(
                $candidato,
                'longitude'
            );

            // Não comparar geograficamente sem coordenadas completas.
            if (
                $latitudeCandidata === null
                || $longitudeCandidata === null
            ) {
                continue;
            }

            $distancia = $this->calcularDistancia(
                $latitude,
                $longitude,
                $latitudeCandidata,
                $longitudeCandidata
            );

            if ($distancia > self::RAIO_KM) {
                continue;
            }

            $resultado[] = [
                'ocorrencia' => $candidato,
                'distancia_km' => round($distancia, 2),
                'criterio' => 'PROXIMIDADE_GPS',
            ];
        }

        // Ordenar pela menor distância ou, sem GPS, pela data mais próxima.
        usort($resultado, function (array $a, array $b) use ($dataReferencia): int {
            if ($a['distancia_km'] !== null && $b['distancia_km'] !== null) {
                return $a['distancia_km'] <=> $b['distancia_km'];
            }

            $dataA = Carbon::parse(
                $a['ocorrencia']->data_ocorrencia
                    ?? $a['ocorrencia']->created_at
            );

            $dataB = Carbon::parse(
                $b['ocorrencia']->data_ocorrencia
                    ?? $b['ocorrencia']->created_at
            );

            return abs($dataReferencia->diffInSeconds($dataA))
                <=> abs($dataReferencia->diffInSeconds($dataB));
        });

        return array_slice($resultado, 0, self::MAX_CANDIDATOS);
    }

    private function obterCoordenada(
        Ocorrencia $ocorrencia,
        string $campo
    ): ?float {
        $valor = $ocorrencia->{$campo};

        if ($valor === null && $ocorrencia->localizacaoGeografica) {
            $valor = $ocorrencia->localizacaoGeografica->{$campo};
        }

        return $valor !== null ? (float) $valor : null;
    }

    /**
     * Calcula a distância entre duas coordenadas usando Haversine.
     */
    private function calcularDistancia(
        float $latitude1,
        float $longitude1,
        float $latitude2,
        float $longitude2
    ): float {
        $raioTerra = 6371;

        $lat1 = deg2rad($latitude1);
        $lat2 = deg2rad($latitude2);

        $dLat = deg2rad($latitude2 - $latitude1);
        $dLon = deg2rad($longitude2 - $longitude1);

        $a = sin($dLat / 2) ** 2
            + cos($lat1)
            * cos($lat2)
            * sin($dLon / 2) ** 2;

        $c = 2 * atan2(sqrt($a), sqrt(1 - $a));

        return $raioTerra * $c;
    }
}
