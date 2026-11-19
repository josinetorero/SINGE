<?php

namespace App\Services\Admin;

use Illuminate\Support\Facades\DB;

class DashboardAdminService
{
    /** @return array<string, mixed> */
    public function dados(): array
    {
        $usersByProfile = DB::table('perfis')->leftJoin('users', 'users.perfil_id', '=', 'perfis.id')
            ->selectRaw('perfis.nome as perfil, COUNT(users.id) as total, SUM(CASE WHEN users.activo = 1 THEN 1 ELSE 0 END) as activos')
            ->groupBy('perfis.id', 'perfis.nome')->orderBy('perfis.nome')->get();
        $occurrencesByState = DB::table('ocorrencias')->selectRaw('estado, COUNT(*) as total')->groupBy('estado')->orderBy('estado')->get();
        $occurrencesByType = DB::table('tipos_ocorrencia')->leftJoin('ocorrencias', 'ocorrencias.tipo_ocorrencia_id', '=', 'tipos_ocorrencia.id')
            ->selectRaw('tipos_ocorrencia.nome as tipo, COUNT(ocorrencias.id) as total')
            ->groupBy('tipos_ocorrencia.id', 'tipos_ocorrencia.nome')->orderByDesc('total')->get();
        $missionsByState = DB::table('missoes')->selectRaw('estado, COUNT(*) as total')->groupBy('estado')->orderBy('estado')->get();
        $teamsByState = DB::table('equipas')->selectRaw('estado, COUNT(*) as total')->groupBy('estado')->orderBy('estado')->get();
        $occurrenceTrend = DB::table('ocorrencias')
            ->where('created_at', '>=', now()->subDays(13)->startOfDay())
            ->selectRaw('DATE(created_at) as dia, COUNT(*) as total')
            ->groupByRaw('DATE(created_at)')->orderBy('dia')->get();
        $missionTrend = DB::table('missoes')
            ->where('updated_at', '>=', now()->subDays(13)->startOfDay())
            ->selectRaw('DATE(updated_at) as dia, estado, COUNT(*) as total')
            ->groupByRaw('DATE(updated_at), estado')->orderBy('dia')->get();
        $alertsActive = DB::table('alertas_publicos')->where('estado', 'publicado')
            ->where('valido_desde', '<=', now())->where('valido_ate', '>=', now())->count();

        return [
            'utilizadores' => [
                'total' => (int) DB::table('users')->count(),
                'activos' => (int) DB::table('users')->where('activo', true)->count(),
                'inactivos' => (int) DB::table('users')->where('activo', false)->count(),
                'por_perfil' => $usersByProfile,
            ],
            'ocorrencias' => [
                'total' => (int) DB::table('ocorrencias')->count(),
                'por_estado' => $occurrencesByState,
                'por_tipo' => $occurrencesByType,
                'evolucao_14_dias' => $occurrenceTrend,
            ],
            'missoes' => [
                'por_estado' => $missionsByState,
                'evolucao_14_dias' => $missionTrend,
            ],
            'equipas' => ['total' => (int) DB::table('equipas')->count(), 'por_estado' => $teamsByState],
            'alertas_activos' => (int) $alertsActive,
        ];
    }
}
