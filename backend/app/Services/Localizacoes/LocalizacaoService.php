<?php

namespace App\Services\Localizacoes;

use App\Enums\EstadoOcorrencia;
use App\Models\Bairro;
use App\Models\Distrito;
use App\Models\Localizacao;
use App\Models\Municipio;
use App\Models\Ocorrencia;
use App\Models\Perfil;
use App\Models\PostoAdministrativo;
use App\Models\Provincia;
use App\Models\Quarteirao;
use App\Models\User;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Support\Facades\DB;
use InvalidArgumentException;

class LocalizacaoService
{
    private const PERFIS_GESTAO = ['Administrador', 'Operador', 'Coordenador'];

    /** @param array<string, mixed> $dados */
    public function criar(array $dados, User $utilizador): Localizacao
    {
        $this->autorizarGestaoGeografia($utilizador);

        return DB::transaction(function () use ($dados): Localizacao {
            $this->validarCoerenciaGeografica($dados);

            return Localizacao::query()->create($dados);
        });
    }

    /** @param array<string, mixed> $dados */
    public function create(array $dados, User $utilizador): Localizacao
    {
        return $this->criar($dados, $utilizador);
    }

    /** @param array<string, mixed> $dados */
    public function atualizar(Localizacao $localizacao, array $dados, User $utilizador): Localizacao
    {
        $this->autorizarGestaoGeografia($utilizador);

        return DB::transaction(function () use ($localizacao, $dados): Localizacao {
            $actual = Localizacao::query()->lockForUpdate()->findOrFail($localizacao->id);
            $valoresFinais = array_replace($actual->only([
                'provincia_id',
                'distrito_id',
                'municipio_id',
                'posto_administrativo_id',
                'bairro_id',
                'quarteirao_id',
                'latitude',
                'longitude',
            ]), $dados);
            $this->validarCoerenciaGeografica($valoresFinais);
            $actual->fill($dados);
            $actual->save();

            return $actual->fresh(['provincia', 'distrito', 'municipio', 'postoAdministrativo', 'bairro', 'quarteirao']);
        });
    }

    public function associarAUtilizador(User $utilizador, int $localizacaoId, User $ator): User
    {
        if ((int) $utilizador->id !== (int) $ator->id
            && $this->nomePerfil($ator) !== 'Administrador') {
            throw new AuthorizationException('Só o titular ou um administrador pode alterar a localização habitual do utilizador.');
        }

        $localizacao = Localizacao::query()->findOrFail($localizacaoId);
        $utilizador->localizacao_id = $localizacao->id;
        $utilizador->save();

        return $utilizador->fresh('localizacao');
    }

    /** @param array<string, mixed> $dados */
    public function registrar(array $dados, User $utilizador): Localizacao
    {
        return $this->criar($dados, $utilizador);
    }

    public function associarAOcorrencia(Ocorrencia $ocorrencia, int $localizacaoId, User $ator): Ocorrencia
    {
        $perfil = $this->nomePerfil($ator);
        $podeAlterarComoCidadao = $perfil === 'Cidadão'
            && (int) $ocorrencia->utilizador_id === (int) $ator->id
            && $ocorrencia->getRawOriginal('estado') === EstadoOcorrencia::REGISTADA->value;

        if (! $podeAlterarComoCidadao && ! in_array($perfil, self::PERFIS_GESTAO, true)) {
            throw new AuthorizationException('O utilizador não está autorizado a alterar a localização da ocorrência.');
        }

        return DB::transaction(function () use ($ocorrencia, $localizacaoId): Ocorrencia {
            $localizacao = Localizacao::query()->findOrFail($localizacaoId);
            $actual = Ocorrencia::query()->lockForUpdate()->findOrFail($ocorrencia->id);
            $actual->localizacao_id = $localizacao->id;
            $actual->save();

            return $actual->fresh('localizacaoGeografica');
        });
    }

    /** @param array<string, mixed> $dados */
    public function validarCoerenciaGeografica(array $dados): bool
    {
        if (empty($dados['provincia_id'] ?? null) || empty($dados['distrito_id'] ?? null)) {
            throw new InvalidArgumentException('A província e o distrito são obrigatórios.');
        }

        $provincia = Provincia::query()->findOrFail((int) $dados['provincia_id']);
        $distrito = Distrito::query()->findOrFail((int) $dados['distrito_id']);
        if ((int) $distrito->provincia_id !== (int) $provincia->id) {
            throw new InvalidArgumentException('A província e o distrito não pertencem à mesma entidade geográfica.');
        }

        if (! empty($dados['municipio_id'] ?? null)) {
            $municipio = Municipio::query()->findOrFail((int) $dados['municipio_id']);
            if ((int) $municipio->distrito_id !== (int) $distrito->id) {
                throw new InvalidArgumentException('O município não pertence ao distrito escolhido.');
            }
        }

        if (! empty($dados['posto_administrativo_id'] ?? null)) {
            $posto = PostoAdministrativo::query()->findOrFail((int) $dados['posto_administrativo_id']);
            if ((int) $posto->distrito_id !== (int) $distrito->id) {
                throw new InvalidArgumentException('O posto administrativo não pertence ao distrito escolhido.');
            }
        }

        if (! empty($dados['bairro_id'] ?? null)) {
            $bairro = Bairro::query()->findOrFail((int) $dados['bairro_id']);
            $this->validarBairro($bairro, $dados, $distrito);
        }

        if (! empty($dados['quarteirao_id'] ?? null)) {
            $quarteirao = Quarteirao::query()->findOrFail((int) $dados['quarteirao_id']);
            if ((int) $quarteirao->bairro_id !== (int) ($dados['bairro_id'] ?? 0)) {
                throw new InvalidArgumentException('O quarteirão não pertence ao bairro indicado.');
            }
        }

        if (isset($dados['latitude']) && (! is_numeric($dados['latitude']) || $dados['latitude'] < -90 || $dados['latitude'] > 90)) {
            throw new InvalidArgumentException('A latitude deve estar compreendida entre -90 e 90.');
        }
        if (isset($dados['longitude']) && (! is_numeric($dados['longitude']) || $dados['longitude'] < -180 || $dados['longitude'] > 180)) {
            throw new InvalidArgumentException('A longitude deve estar compreendida entre -180 e 180.');
        }

        return true;
    }

    /** @param array<string, mixed> $dados */
    private function validarBairro(Bairro $bairro, array $dados, Distrito $distrito): void
    {
        if ($bairro->municipio_id !== null) {
            $municipio = Municipio::query()->findOrFail($bairro->municipio_id);
            if ((int) $municipio->distrito_id !== (int) $distrito->id
                || (isset($dados['municipio_id']) && (int) $dados['municipio_id'] !== (int) $municipio->id)) {
                throw new InvalidArgumentException('O bairro não pertence ao município ou distrito indicado.');
            }
        }

        if ($bairro->posto_administrativo_id !== null) {
            $posto = PostoAdministrativo::query()->findOrFail($bairro->posto_administrativo_id);
            if ((int) $posto->distrito_id !== (int) $distrito->id
                || (isset($dados['posto_administrativo_id']) && (int) $dados['posto_administrativo_id'] !== (int) $posto->id)) {
                throw new InvalidArgumentException('O bairro não pertence ao posto administrativo ou distrito indicado.');
            }
        }
    }

    private function autorizarGestaoGeografia(User $utilizador): void
    {
        if (! in_array($this->nomePerfil($utilizador), self::PERFIS_GESTAO, true)) {
            throw new AuthorizationException('O perfil do utilizador não pode gerir referências geográficas.');
        }
    }

    private function nomePerfil(User $utilizador): ?string
    {
        $perfil = $utilizador->perfil;

        return $perfil instanceof Perfil ? $perfil->nome : null;
    }
}
