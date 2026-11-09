<?php

namespace App\Services\Identificacao;

use App\Models\DocumentoIdentificacao;
use App\Models\Perfil;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use InvalidArgumentException;
use RuntimeException;
use Symfony\Component\HttpFoundation\StreamedResponse;
use Throwable;

class DocumentoIdentificacaoService
{
    private const MIME_PERMITIDOS = ['image/jpeg', 'image/png', 'application/pdf'];

    /** @param array<string, mixed> $dados */
    public function criar(array $dados, User $utilizador): DocumentoIdentificacao
    {
        $this->validarDados($dados);
        $ficheiro = $dados['ficheiro'] ?? null;

        if ($ficheiro !== null && (! $ficheiro instanceof UploadedFile || ! $ficheiro->isValid()
            || ! in_array($ficheiro->getMimeType(), self::MIME_PERMITIDOS, true))) {
            throw new InvalidArgumentException('O documento deve ser um ficheiro JPG, PNG ou PDF válido.');
        }

        $caminho = $ficheiro instanceof UploadedFile
            ? $ficheiro->store('documentos-identificacao', 'local')
            : null;

        if ($ficheiro instanceof UploadedFile && (! is_string($caminho) || $caminho === '')) {
            throw new RuntimeException('Não foi possível armazenar o documento de identificação.');
        }

        try {
            return DB::transaction(function () use ($dados, $caminho, $utilizador): DocumentoIdentificacao {
                $documento = DocumentoIdentificacao::query()->create([
                    'utilizador_id' => $utilizador->id,
                    'tipo_documento' => $dados['tipo_documento'],
                    'numero_documento' => $dados['numero_documento'],
                    'nome_documento' => $dados['nome_documento'] ?? null,
                    'data_nascimento' => $dados['data_nascimento'] ?? null,
                    'data_emissao' => $dados['data_emissao'] ?? null,
                    'data_validade' => $dados['data_validade'] ?? null,
                    'caminho_documento' => $caminho,
                    'estado_verificacao' => 'PENDENTE',
                ]);

                return $documento->fresh(['utilizador']);
            });
        } catch (Throwable $exception) {
            if (is_string($caminho) && ! Storage::disk('local')->delete($caminho)) {
                throw new RuntimeException('Falhou a gravação do documento e não foi possível remover o ficheiro órfão.', previous: $exception);
            }

            throw $exception;
        }
    }

    /** @param array<string, mixed> $dados */
    public function create(array $dados, User $utilizador): DocumentoIdentificacao
    {
        return $this->criar($dados, $utilizador);
    }

    /** @param array<string, mixed> $dados */
    public function atualizar(DocumentoIdentificacao $documento, array $dados, User $utilizador): DocumentoIdentificacao
    {
        $this->autorizarEdicao($documento, $utilizador);
        $valoresFinais = array_replace($documento->only([
            'tipo_documento',
            'numero_documento',
            'data_emissao',
            'data_validade',
        ]), $dados);
        $valoresFinais['id'] = $documento->id;
        $this->validarDados($valoresFinais);

        $ficheiro = $dados['ficheiro'] ?? null;
        if ($ficheiro !== null && (! $ficheiro instanceof UploadedFile || ! $ficheiro->isValid()
            || ! in_array($ficheiro->getMimeType(), self::MIME_PERMITIDOS, true))) {
            throw new InvalidArgumentException('O documento deve ser um ficheiro JPG, PNG ou PDF válido.');
        }

        $caminhoNovo = $ficheiro instanceof UploadedFile
            ? $ficheiro->store('documentos-identificacao', 'local')
            : null;
        if ($ficheiro instanceof UploadedFile && (! is_string($caminhoNovo) || $caminhoNovo === '')) {
            throw new RuntimeException('Não foi possível armazenar o documento de identificação.');
        }

        $caminhoAnterior = $documento->caminho_documento;

        try {
            $documentoActualizado = DB::transaction(function () use ($dados, $ficheiro, $caminhoNovo, $documento): DocumentoIdentificacao {
                $documentoActual = DocumentoIdentificacao::query()->lockForUpdate()->findOrFail($documento->id);
                $campos = array_intersect_key($dados, array_flip([
                    'tipo_documento',
                    'numero_documento',
                    'nome_documento',
                    'data_nascimento',
                    'data_emissao',
                    'data_validade',
                ]));
                $documentoActual->fill($campos);
                if ($ficheiro instanceof UploadedFile) {
                    $documentoActual->caminho_documento = $caminhoNovo;
                }
                $documentoActual->save();

                return $documentoActual->fresh(['utilizador']);
            });
        } catch (Throwable $exception) {
            if (is_string($caminhoNovo) && ! Storage::disk('local')->delete($caminhoNovo)) {
                throw new RuntimeException('Falhou a actualização do documento e não foi possível remover o ficheiro órfão.', previous: $exception);
            }

            throw $exception;
        }

        if (is_string($caminhoNovo) && is_string($caminhoAnterior)
            && ! Storage::disk('local')->delete($caminhoAnterior)) {
            throw new RuntimeException('O documento foi actualizado, mas o ficheiro substituído não pôde ser removido.');
        }

        return $documentoActualizado;
    }

    public function descarregar(DocumentoIdentificacao $documento, User $utilizador): StreamedResponse
    {
        $this->autorizarLeitura($documento, $utilizador);
        $caminho = $documento->caminho_documento;

        if (! is_string($caminho) || ! str_starts_with($caminho, 'documentos-identificacao/')
            || ! Storage::disk('local')->exists($caminho)) {
            throw (new ModelNotFoundException)->setModel(DocumentoIdentificacao::class, [$documento->id]);
        }

        $nome = $documento->nome_documento ?: 'documento';

        return Storage::disk('local')->download(
            $caminho,
            basename(str_replace('\\', '/', $nome)),
            ['Content-Type' => Storage::disk('local')->mimeType($caminho) ?: 'application/octet-stream',
                'X-Content-Type-Options' => 'nosniff'],
        );
    }

    public function podeAceder(DocumentoIdentificacao $documento, User $utilizador): bool
    {
        return (int) $documento->utilizador_id === (int) $utilizador->id
            || $this->nomePerfil($utilizador) === 'Administrador';
    }

    private function autorizarEdicao(DocumentoIdentificacao $documento, User $utilizador): void
    {
        if (! $this->podeAceder($documento, $utilizador)) {
            throw new AuthorizationException('O utilizador não está autorizado a alterar este documento.');
        }
    }

    private function autorizarLeitura(DocumentoIdentificacao $documento, User $utilizador): void
    {
        if (! $this->podeAceder($documento, $utilizador)) {
            throw new AuthorizationException('O utilizador não está autorizado a aceder a este documento.');
        }
    }

    /** @param array<string, mixed> $dados */
    private function validarDados(array $dados): void
    {
        if (empty($dados['tipo_documento'] ?? null)) {
            throw new InvalidArgumentException('O tipo de documento é obrigatório.');
        }

        if (empty($dados['numero_documento'] ?? null)) {
            throw new InvalidArgumentException('O número do documento é obrigatório.');
        }

        $duplicado = DocumentoIdentificacao::query()
            ->where('tipo_documento', $dados['tipo_documento'])
            ->where('numero_documento', $dados['numero_documento'])
            ->when(isset($dados['id']), fn ($query) => $query->whereKeyNot($dados['id']))
            ->exists();

        if ($duplicado) {
            throw new InvalidArgumentException('Já existe um documento com o mesmo tipo e número.');
        }

        if (isset($dados['data_emissao'], $dados['data_validade'])
            && Carbon::parse($dados['data_validade'])->lessThan(Carbon::parse($dados['data_emissao']))) {
            throw new InvalidArgumentException('A data de validade não pode preceder a data de emissão.');
        }
    }

    private function nomePerfil(User $utilizador): ?string
    {
        $perfil = $utilizador->perfil;

        return $perfil instanceof Perfil ? $perfil->nome : null;
    }
}
