<?php

namespace App\Http\Controllers\Identificacao;

use App\Http\Controllers\SingeApiController;
use App\Http\Requests\Documentos\StoreDocumentoIdentificacaoRequest;
use App\Http\Requests\Documentos\UpdateDocumentoIdentificacaoRequest;
use App\Models\DocumentoIdentificacao;
use App\Models\VerificacaoIdentidade;
use App\Services\Identificacao\DocumentoIdentificacaoService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\StreamedResponse;

class DocumentoIdentificacaoController extends SingeApiController
{
    public function myStatus(Request $request): JsonResponse
    {
        return $this->execute(function () use ($request): array {
            $user = $this->authenticatedUser($request);
            $documents = DocumentoIdentificacao::query()->where('utilizador_id', $user->id)
                ->with(['verificacoes' => fn ($query) => $query->with('historico.utilizador')->latest()])->latest()->get();
            $latest = $documents->flatMap(fn ($document) => $document->verificacoes)->sortByDesc('created_at')->first();
            $approved = $documents->flatMap(fn ($document) => $document->verificacoes)->contains(fn ($verification) => $verification->estado === 'APROVADA');

            return [
                'estado' => $approved ? 'APROVADA' : ($latest?->estado ?? 'NAO_SUBMETIDA'),
                'elegivel' => $approved,
                'motivo_rejeicao' => $latest?->motivo_rejeicao,
                'documentos' => $documents->map(fn (DocumentoIdentificacao $document): array => [
                    'id' => $document->id,
                    'tipo_documento' => $document->tipo_documento,
                    'numero_documento_mascarado' => $this->mascararNumero($document->numero_documento),
                    'estado_verificacao' => $document->estado_verificacao,
                    'data_validade' => $document->data_validade?->toDateString(),
                    'ficheiro_submetido' => filled($document->caminho_documento),
                    'verificacoes' => $document->verificacoes->map(fn ($verification): array => [
                        'id' => $verification->id,
                        'estado' => $verification->estado,
                        'motivo_rejeicao' => $verification->motivo_rejeicao,
                        'observacoes' => $verification->observacoes,
                        'data_verificacao' => $verification->data_verificacao,
                        'created_at' => $verification->created_at,
                        'historico' => $verification->historico->map(fn ($entry): array => [
                            'estado_anterior' => $entry->estado_anterior,
                            'estado_novo' => $entry->estado_novo,
                            'motivo' => $entry->motivo,
                            'observacoes' => $entry->observacoes,
                            'responsavel' => $entry->utilizador?->name,
                            'created_at' => $entry->created_at,
                        ])->all(),
                    ])->all(),
                ])->all(),
            ];
        }, 'Estado de identidade consultado com sucesso.');
    }

    public function pendingReviews(): JsonResponse
    {
        return $this->execute(function (): array {
            return VerificacaoIdentidade::query()->with(['documentoIdentificacao.utilizador', 'utilizadorSolicitante', 'utilizadorVerificador', 'historico.utilizador'])
                ->whereIn('estado', ['PENDENTE', 'EM_ANALISE'])->latest()->get()
                ->map(fn (VerificacaoIdentidade $verification): array => [
                    'id' => $verification->id,
                    'estado' => $verification->estado,
                    'observacoes' => $verification->observacoes,
                    'created_at' => $verification->created_at,
                    'utilizador_verificador_id' => $verification->utilizador_verificador_id,
                    'historico' => $verification->historico->map(fn ($entry): array => [
                        'estado_anterior' => $entry->estado_anterior,
                        'estado_novo' => $entry->estado_novo,
                        'motivo' => $entry->motivo,
                        'observacoes' => $entry->observacoes,
                        'responsavel' => $entry->utilizador?->name,
                        'created_at' => $entry->created_at,
                    ])->all(),
                    'solicitante' => [
                        'id' => $verification->utilizadorSolicitante?->id,
                        'nome' => $verification->utilizadorSolicitante?->name,
                        'email' => $verification->utilizadorSolicitante?->email,
                    ],
                    'documento' => $verification->documentoIdentificacao ? [
                        'id' => $verification->documentoIdentificacao->id,
                        'tipo_documento' => $verification->documentoIdentificacao->tipo_documento,
                        'numero_documento_mascarado' => $this->mascararNumero($verification->documentoIdentificacao->numero_documento),
                        'nome_documento' => $verification->documentoIdentificacao->nome_documento,
                        'data_validade' => $verification->documentoIdentificacao->data_validade?->toDateString(),
                        'ficheiro_submetido' => filled($verification->documentoIdentificacao->caminho_documento),
                    ] : null,
                ])->all();
        }, 'Pedidos de verificação consultados com sucesso.');
    }

    public function reviewStatistics(): JsonResponse
    {
        return $this->execute(function (): array {
            $counts = VerificacaoIdentidade::query()
                ->selectRaw('estado, COUNT(*) as total')
                ->groupBy('estado')
                ->pluck('total', 'estado');

            return [
                'total' => (int) $counts->sum(),
                'pendentes' => (int) $counts->get('PENDENTE', 0),
                'em_analise' => (int) $counts->get('EM_ANALISE', 0),
                'aprovadas' => (int) $counts->get('APROVADA', 0),
                'rejeitadas' => (int) $counts->get('REJEITADA', 0),
                'correccao_solicitada' => (int) $counts->get('CORRECAO_NECESSARIA', 0),
            ];
        }, 'Estatísticas de verificação consultadas com sucesso.');
    }

    public function reviewHistory(): JsonResponse
    {
        return $this->execute(function (): array {
            return VerificacaoIdentidade::query()
                ->with(['documentoIdentificacao.utilizador', 'utilizadorSolicitante', 'historico.utilizador'])
                ->latest()->limit(100)->get()
                ->map(fn (VerificacaoIdentidade $verification): array => [
                    'id' => $verification->id,
                    'estado' => $verification->estado,
                    'motivo' => $verification->motivo_rejeicao,
                    'submetido_em' => $verification->created_at,
                    'decidido_em' => $verification->data_verificacao,
                    'cidadao' => $verification->utilizadorSolicitante?->name,
                    'numero_documento_mascarado' => $this->mascararNumero($verification->documentoIdentificacao?->numero_documento),
                    'historico' => $verification->historico->map(fn ($entry): array => [
                        'estado_anterior' => $entry->estado_anterior,
                        'estado_novo' => $entry->estado_novo,
                        'motivo' => $entry->motivo,
                        'responsavel' => $entry->utilizador?->name,
                        'created_at' => $entry->created_at,
                    ])->all(),
                ])->all();
        }, 'Histórico de verificações consultado com sucesso.');
    }

    public function downloadForReview(VerificacaoIdentidade $verificacao, Request $request, DocumentoIdentificacaoService $service): StreamedResponse|JsonResponse
    {
        return $this->executeStream(function () use ($verificacao, $request, $service): StreamedResponse {
            if ($this->authenticatedUser($request)->perfil?->nome !== 'Operador') {
                throw new \Illuminate\Auth\Access\AuthorizationException;
            }
            $document = $verificacao->documentoIdentificacao;
            abort_unless($document instanceof DocumentoIdentificacao, 404);
            return $service->descarregar($document, $this->authenticatedUser($request));
        });
    }

    public function store(
        StoreDocumentoIdentificacaoRequest $request,
        DocumentoIdentificacaoService $service,
    ): JsonResponse {
        return $this->execute(
            fn (): array => $this->attributes(
                $service->criar($request->validated(), $this->authenticatedUser($request)),
                ['id', 'estado_verificacao', 'created_at'],
            ),
            'Documento de identificação registado com sucesso.',
            201,
        );
    }

    public function update(
        UpdateDocumentoIdentificacaoRequest $request,
        DocumentoIdentificacao $documentoIdentificacao,
        DocumentoIdentificacaoService $service,
    ): JsonResponse {
        return $this->execute(
            fn (): array => $this->attributes(
                $service->atualizar(
                    $documentoIdentificacao,
                    $request->validated(),
                    $this->authenticatedUser($request),
                ),
                ['id', 'estado_verificacao', 'updated_at'],
            ),
            'Documento de identificação actualizado com sucesso.',
        );
    }

    public function download(
        DocumentoIdentificacao $documentoIdentificacao,
        Request $request,
        DocumentoIdentificacaoService $service,
    ): StreamedResponse|JsonResponse {
        return $this->executeStream(
            fn (): StreamedResponse => $service->descarregar(
                $documentoIdentificacao,
                $this->authenticatedUser($request),
            ),
        );
    }

    private function mascararNumero(?string $number): ?string
    {
        if (! $number) return null;
        $last = mb_substr($number, -4);
        return str_repeat('•', max(0, mb_strlen($number) - 4)).$last;
    }
}
