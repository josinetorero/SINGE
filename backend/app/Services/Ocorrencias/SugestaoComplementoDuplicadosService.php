<?php

namespace App\Services\Ocorrencias;

use App\Models\Ocorrencia;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Throwable;

class SugestaoComplementoDuplicadosService
{
    /** @return array<string, mixed> */
    public function sugerir(Ocorrencia $ocorrencia): array
    {
        $relatos = Ocorrencia::query()
            ->whereIn('id', function ($query) use ($ocorrencia): void {
                $query->from('validacoes_ocorrencia')->select('ocorrencia_id')
                    ->where('ocorrencia_original_id', $ocorrencia->id)->where('estado', 'DUPLICADA');
            })->get(['id', 'titulo', 'descricao']);

        if ($relatos->isEmpty()) {
            return ['disponivel' => true, 'sugestoes' => [], 'aviso' => 'Ainda não existem relatos confirmados como duplicados desta ocorrência.'];
        }
        if (! config('services.openai.enabled')) {
            return ['disponivel' => false, 'sugestoes' => [], 'aviso' => 'A assistência de IA está desactivada.'];
        }

        try {
            $base = rtrim((string) config('services.openai.base_url'), '/');
            $key = trim((string) config('services.openai.api_key'));
            $model = (string) config('services.openai.model');
            if ($base === '' || $key === '' || $model === '') {
                return ['disponivel' => false, 'sugestoes' => [], 'aviso' => 'O serviço de IA não está configurado.'];
            }
            $response = Http::acceptJson()->withToken($key)
                ->timeout((int) config('services.openai.timeout', 120))
                ->post($base.'/chat/completions', [
                    'model' => $model,
                    'response_format' => ['type' => 'json_object'],
                    'messages' => [
                        ['role' => 'system', 'content' => 'És um assistente de triagem. Compara a descrição atual com relatos de ocorrências já confirmadas como duplicadas. Sugere apenas factos concretos presentes nos relatos e ausentes da descrição atual, sem inventar nem repetir. Cada sugestão deve indicar o texto adicional e os IDs dos relatos fonte. Não reescrevas nem atualizes o original. Responde em JSON: {"sugestoes":[{"texto":"...","relatos_ids":[1],"justificacao":"..."}]}'],
                        ['role' => 'user', 'content' => json_encode(['descricao_atual' => $ocorrencia->descricao, 'relatos' => $relatos->map(fn ($r) => ['id' => $r->id, 'titulo' => $r->titulo, 'descricao' => $r->descricao])->all()], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES)],
                    ],
                ]);
            $json = json_decode((string) $response->json('choices.0.message.content'), true);
            if (! $response->successful() || ! is_array($json['sugestoes'] ?? null)) {
                return ['disponivel' => false, 'sugestoes' => [], 'aviso' => 'A IA não conseguiu analisar os relatos duplicados.'];
            }
            $ids = $relatos->pluck('id')->map(fn ($id) => (int) $id)->all();
            $suggestions = collect($json['sugestoes'])->filter(fn ($item) => is_array($item) && is_string($item['texto'] ?? null))
                ->map(fn ($item) => ['texto' => mb_substr(trim($item['texto']), 0, 1000), 'relatos_ids' => array_values(array_intersect($ids, array_map('intval', $item['relatos_ids'] ?? []))), 'justificacao' => mb_substr((string) ($item['justificacao'] ?? ''), 0, 500)])
                ->filter(fn ($item) => $item['texto'] !== '' && $item['relatos_ids'] !== [])->values()->all();
            return ['disponivel' => true, 'sugestoes' => $suggestions, 'aviso' => 'Revise cada sugestão e confirme os factos antes de aplicar.'];
        } catch (Throwable $e) {
            Log::warning('Falha ao sugerir complemento com base em duplicados.', ['ocorrencia_id' => $ocorrencia->id, 'erro' => $e::class]);
            return ['disponivel' => false, 'sugestoes' => [], 'aviso' => 'A assistência de IA está temporariamente indisponível.'];
        }
    }
}
