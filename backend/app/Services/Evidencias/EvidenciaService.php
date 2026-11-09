<?php

namespace App\Services\Evidencias;

use App\Models\Evidencia;
use App\Models\Ocorrencia;
use App\Models\Perfil;
use App\Models\User;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use InvalidArgumentException;
use RuntimeException;
use Symfony\Component\HttpFoundation\StreamedResponse;
use Throwable;

class EvidenciaService
{
    private const PERFIS_OPERACIONAIS = ['Administrador', 'Operador', 'Coordenador', 'Agente'];

    private const MIME_PERMITIDOS = ['image/jpeg', 'image/png', 'application/pdf'];

    /** @param array<string, mixed> $dados */
    public function criar(array $dados, User $utilizador): Evidencia
    {
        $ocorrenciaId = $dados['ocorrencia_id'] ?? null;
        if (! is_scalar($ocorrenciaId) || filter_var($ocorrenciaId, FILTER_VALIDATE_INT) === false) {
            throw new InvalidArgumentException('A ocorrência da evidência deve ser um identificador inteiro válido.');
        }

        $ficheiro = $dados['ficheiro'] ?? null;
        if (! $ficheiro instanceof UploadedFile || ! $ficheiro->isValid()
            || ! in_array($ficheiro->getMimeType(), self::MIME_PERMITIDOS, true)) {
            throw new InvalidArgumentException('A evidência deve ser um ficheiro JPG, PNG ou PDF válido.');
        }

        $ocorrencia = Ocorrencia::query()->findOrFail((int) $ocorrenciaId);
        $this->autorizarAcesso($ocorrencia, $utilizador);
        $caminho = $ficheiro->store('evidencias', 'local');

        if (! is_string($caminho) || $caminho === '') {
            throw new RuntimeException('Não foi possível armazenar o ficheiro de evidência.');
        }

        try {
            return DB::transaction(function () use ($dados, $ficheiro, $caminho, $ocorrencia, $utilizador): Evidencia {
                $evidencia = Evidencia::query()->create([
                    'ocorrencia_id' => $ocorrencia->id,
                    'utilizador_id' => $utilizador->id,
                    'nome_ficheiro' => $this->nomeSeguro($ficheiro->getClientOriginalName()),
                    'caminho_ficheiro' => $caminho,
                    'tipo_mime' => $ficheiro->getMimeType(),
                    'tamanho_bytes' => $ficheiro->getSize(),
                    'descricao' => $dados['descricao'] ?? null,
                ]);

                return $evidencia->fresh(['ocorrencia', 'utilizador']);
            });
        } catch (Throwable $exception) {
            if (! Storage::disk('local')->delete($caminho)) {
                throw new RuntimeException('Falhou o registo da evidência e não foi possível remover o ficheiro órfão.', previous: $exception);
            }

            throw $exception;
        }
    }

    /** @param array<string, mixed> $dados */
    public function create(array $dados, User $utilizador): Evidencia
    {
        return $this->criar($dados, $utilizador);
    }

    public function descarregar(Evidencia $evidencia, User $utilizador): StreamedResponse
    {
        $evidencia->loadMissing('ocorrencia');
        $ocorrencia = $evidencia->ocorrencia;
        if (! $ocorrencia instanceof Ocorrencia) {
            throw (new ModelNotFoundException)->setModel(Ocorrencia::class, [$evidencia->ocorrencia_id]);
        }
        $this->autorizarAcesso($ocorrencia, $utilizador);

        if (! str_starts_with($evidencia->caminho_ficheiro, 'evidencias/')
            || ! Storage::disk('local')->exists($evidencia->caminho_ficheiro)) {
            throw (new ModelNotFoundException)->setModel(Evidencia::class, [$evidencia->id]);
        }

        return Storage::disk('local')->download(
            $evidencia->caminho_ficheiro,
            $evidencia->nome_ficheiro,
            ['Content-Type' => $evidencia->tipo_mime, 'X-Content-Type-Options' => 'nosniff'],
        );
    }

    public function podeAceder(Ocorrencia $ocorrencia, User $utilizador): bool
    {
        $perfil = $this->nomePerfil($utilizador);

        return (int) $utilizador->id === (int) $ocorrencia->utilizador_id
            || (in_array($perfil, self::PERFIS_OPERACIONAIS, true)
                && ($perfil !== 'Agente'
                    || $ocorrencia->missoes()->where('equipa_id', $utilizador->equipa_id)->exists()));
    }

    private function autorizarAcesso(Ocorrencia $ocorrencia, User $utilizador): void
    {
        if (! $this->podeAceder($ocorrencia, $utilizador)) {
            throw new AuthorizationException('O utilizador não está autorizado a aceder às evidências desta ocorrência.');
        }
    }

    private function nomeSeguro(string $nome): string
    {
        return basename(str_replace('\\', '/', $nome));
    }

    private function nomePerfil(User $utilizador): ?string
    {
        $perfil = $utilizador->perfil;

        return $perfil instanceof Perfil ? $perfil->nome : null;
    }
}
