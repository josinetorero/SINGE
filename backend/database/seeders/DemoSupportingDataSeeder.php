<?php

namespace Database\Seeders;

use App\Models\AlertaPublico;
use App\Models\DocumentoIdentificacao;
use App\Models\Evidencia;
use App\Models\HistoricoAlertaPublico;
use App\Models\HistoricoVerificacaoIdentidade;
use App\Models\Missao;
use App\Models\Notificacao;
use App\Models\Ocorrencia;
use App\Models\User;
use App\Models\VerificacaoIdentidade;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use RuntimeException;

class DemoSupportingDataSeeder extends Seeder
{
    public function run(): void
    {
        DB::transaction(function (): void {
            $coordinator = User::query()->where('email', 'coord@singe.test')->firstOrFail();
            $admin = User::query()->where('email', 'admin@singe.test')->firstOrFail();
            $citizen = User::query()->where('email', 'cidadao@singe.test')->firstOrFail();
            $occurrences = Ocorrencia::query()->whereIn('titulo', [
                'Cheias na zona baixa de Maputo',
                'Incêndio habitacional na Beira',
                'Acidente rodoviário na EN1',
                'Emergência médica em Nampula',
                'Ciclone costeiro em Pemba',
                'Deslizamento de terra em Nampula',
            ])->get()->keyBy('titulo');
            $mission = Missao::query()->where('ocorrencia_id', $occurrences['Acidente rodoviário na EN1']->id)->firstOrFail();

            $pdf = $this->demoPdf();
            foreach ($occurrences as $occurrence) {
                $path = "evidencias/demo-occurrence-{$occurrence->id}.pdf";
                if (! Storage::disk('local')->exists($path)
                    && ! Storage::disk('local')->put($path, $pdf)) {
                    throw new RuntimeException('Não foi possível gravar o ficheiro de evidência de demonstração.');
                }
                Evidencia::query()->firstOrCreate(
                    ['caminho_ficheiro' => $path],
                    [
                        'ocorrencia_id' => $occurrence->id,
                        'utilizador_id' => $occurrence->utilizador_id,
                        'nome_ficheiro' => "relatorio-demo-ocorrencia-{$occurrence->id}.pdf",
                        'tipo_mime' => 'application/pdf',
                        'tamanho_bytes' => Storage::disk('local')->size($path),
                        'descricao' => 'Relatório PDF sintético, criado exclusivamente para demonstração do SINGE.',
                    ],
                );
            }

            $documents = [
                ['cidadao@singe.test', 'DEMO-BI-CIDADAO-001', 'SINGE Demo Cidadão', 'PENDENTE'],
                ['operador@singe.test', 'DEMO-BI-OPERADOR-001', 'SINGE Demo Operador', 'APROVADA'],
            ];
            foreach ($documents as [$email, $number, $holder, $verificationState]) {
                $owner = User::query()->where('email', $email)->firstOrFail();
                $document = DocumentoIdentificacao::query()->firstOrCreate(
                    ['tipo_documento' => 'BI-DEMO', 'numero_documento' => $number],
                    [
                        'utilizador_id' => $owner->id,
                        'nome_documento' => $holder,
                        'data_nascimento' => '1990-01-01',
                        'data_emissao' => '2024-01-01',
                        'data_validade' => '2034-01-01',
                        'estado_verificacao' => $verificationState,
                    ],
                );
                if (! $document->caminho_documento) {
                    $path = 'documentos-identificacao/'.strtolower($number).'.pdf';
                    if (! Storage::disk('local')->exists($path)
                        && ! Storage::disk('local')->put($path, $pdf)) {
                        throw new RuntimeException('Não foi possível gravar o documento de identidade sintético.');
                    }
                    $document->caminho_documento = $path;
                    $document->save();
                }
                $verification = VerificacaoIdentidade::query()->firstOrCreate(
                    ['documento_identificacao_id' => $document->id],
                    [
                        'utilizador_solicitante_id' => $owner->id,
                        'utilizador_verificador_id' => $verificationState === 'APROVADA' ? $admin->id : null,
                        'estado' => $verificationState,
                        'observacoes' => 'Registo sintético para testar a verificação de identidade.',
                        'data_verificacao' => $verificationState === 'APROVADA' ? now()->subDay() : null,
                    ],
                );
                HistoricoVerificacaoIdentidade::query()->firstOrCreate(
                    ['verificacao_identidade_id' => $verification->id, 'estado_novo' => 'PENDENTE'],
                    ['utilizador_id' => $owner->id, 'estado_anterior' => null, 'observacoes' => 'Pedido de demonstração submetido.'],
                );
                if ($verificationState === 'APROVADA') {
                    HistoricoVerificacaoIdentidade::query()->firstOrCreate(
                        ['verificacao_identidade_id' => $verification->id, 'estado_novo' => 'APROVADA'],
                        ['utilizador_id' => $admin->id, 'estado_anterior' => 'PENDENTE', 'observacoes' => 'Verificação de demonstração aprovada.'],
                    );
                }
            }

            foreach ([
                ['Aviso de chuva intensa na região sul', 'Chuvas intensas', 'alta', 'Maputo e Sofala', 'publicado', 'Evite atravessar zonas inundadas e acompanhe as comunicações das autoridades.', 'Macurungo, Beira'],
                ['Vigilância costeira no Norte', 'Ciclone', 'media', 'Cabo Delgado e Nampula', 'rascunho', 'Acompanhe os avisos oficiais e prepare um plano familiar de emergência.', 'Cariacó, Pemba'],
                ['Aviso costeiro encerrado de demonstração', 'Agitação marítima', 'baixa', 'Nampula', 'encerrado', 'Este aviso de demonstração já terminou.', 'Namicopo, Nampula'],
            ] as [$title, $hazard, $severity, $area, $targetState, $recommendation, $locationReference]) {
                $locationId = DB::table('localizacoes')->where('endereco_referencia', $locationReference)->value('id');
                $validFrom = $targetState === 'encerrado' ? now()->subDays(8) : now()->subDay();
                $validUntil = $targetState === 'encerrado' ? now()->subDay() : now()->addDays(3);
                $alert = AlertaPublico::query()->firstOrCreate(
                    ['titulo' => $title],
                    [
                        'descricao' => 'Alerta sintético de demonstração para validação do fluxo público de avisos.',
                        'tipo_perigo' => $hazard,
                        'severidade' => $severity,
                        'localizacao_id' => $locationId,
                        'area_geografica' => $area,
                        'data_publicacao' => $targetState === 'rascunho' ? null : $validFrom->copy()->addHours(1),
                        'valido_desde' => $validFrom,
                        'valido_ate' => $validUntil,
                        'fonte' => 'SINGE — demonstração institucional',
                        'utilizador_id' => $coordinator->id,
                        'estado' => $targetState,
                        'recomendacoes' => $recommendation,
                    ],
                );
                $states = $targetState === 'rascunho'
                    ? [['criado', null, 'rascunho']]
                    : ($targetState === 'encerrado'
                        ? [['criado', null, 'rascunho'], ['publicado', 'rascunho', 'publicado'], ['encerrado', 'publicado', 'encerrado']]
                        : [['criado', null, 'rascunho'], ['publicado', 'rascunho', 'publicado']]);
                foreach ($states as [$operation, $before, $after]) {
                    HistoricoAlertaPublico::query()->firstOrCreate(
                        ['alerta_publico_id' => $alert->id, 'operacao' => $operation],
                        [
                            'utilizador_id' => $coordinator->id,
                            'estado_anterior' => $before,
                            'estado_novo' => $after,
                            'observacoes' => 'Histórico sintético coerente com o estado de demonstração.',
                        ],
                    );
                }
            }

            $users = User::query()->whereIn('email', [
                'admin@singe.test', 'coord@singe.test', 'operador@singe.test', 'cidadao@singe.test',
                'agente@singe.test', 'agente.resgate@singe.test', 'agente.saude@singe.test', 'agente.logistica@singe.test',
            ])->get();
            foreach ($users as $user) {
                $assignedMission = in_array($user->email, ['agente.resgate@singe.test'], true) ? $mission : null;
                $relatedOccurrence = $user->email === 'cidadao@singe.test'
                    ? $occurrences['Cheias na zona baixa de Maputo']
                    : null;
                Notificacao::query()->firstOrCreate(
                    ['utilizador_id' => $user->id, 'titulo' => 'SINGE — actualização de demonstração'],
                    [
                        'mensagem' => $assignedMission
                            ? 'Consulte a missão da sua equipa e reporte o progresso através do painel operacional.'
                            : 'Esta notificação privada demonstra a caixa de entrada do perfil autenticado.',
                        'tipo' => $assignedMission ? 'missao' : 'sistema',
                        'ocorrencia_id' => $relatedOccurrence?->id,
                        'missao_id' => $assignedMission?->id,
                        'lida' => false,
                    ],
                );
            }
        });
    }

    private function demoPdf(): string
    {
        $stream = "BT /F1 12 Tf 72 720 Td (SINGE DEMO - documento sintetico de teste) Tj ET";
        $objects = [
            '<< /Type /Catalog /Pages 2 0 R >>',
            '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
            '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>',
            '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
            '<< /Length '.strlen($stream)." >>\nstream\n{$stream}\nendstream",
        ];
        $pdf = "%PDF-1.4\n";
        $offsets = [0];
        foreach ($objects as $index => $object) {
            $offsets[] = strlen($pdf);
            $pdf .= ($index + 1)." 0 obj\n{$object}\nendobj\n";
        }
        $xrefOffset = strlen($pdf);
        $pdf .= "xref\n0 ".(count($objects) + 1)."\n0000000000 65535 f \n";
        foreach (array_slice($offsets, 1) as $offset) {
            $pdf .= sprintf('%010d 00000 n ', $offset)."\n";
        }
        return $pdf."trailer\n<< /Size ".(count($objects) + 1)." /Root 1 0 R >>\nstartxref\n{$xrefOffset}\n%%EOF\n";
    }
}
