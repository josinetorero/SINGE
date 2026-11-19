/**
 * SINGE - Validação de Ocorrências
 * Regras puras e testáveis conforme especificações RF04, RF05 e Tela 3.
 */

/**
 * [RF04] Tipo de ocorrência é obrigatório
 */
export function validarTipo(tipo) {
  if (!tipo || typeof tipo !== 'string' || !tipo.trim()) {
    return 'O tipo de ocorrência é obrigatório.';
  }
  return null;
}

/**
 * [Parte I, Tela 3] Título obrigatório, entre 5 e 100 caracteres após trim
 */
export function validarTitulo(titulo) {
  const val = (titulo ?? '').trim();
  if (!val) {
    return 'O título é obrigatório.';
  }
  if (val.length < 5 || val.length > 100) {
    return 'O título deve ter entre 5 e 100 caracteres.';
  }
  return null;
}

/**
 * [Assumida] Descrição obrigatória, entre 10 e 1000 caracteres após trim
 */
export function validarDescricao(descricao) {
  const val = (descricao ?? '').trim();
  if (!val) {
    return 'A descrição é obrigatória.';
  }
  if (val.length < 10 || val.length > 1000) {
    return 'A descrição deve ter entre 10 e 1000 caracteres.';
  }
  return null;
}

/**
 * [RF05] Latitude (-90..90) e Longitude (-180..180)
 * Ambas vazias ou ambas preenchidas; sem NaN; o valor 0 é válido.
 */
export function validarCoordenadas(lat, lng) {
  const emptyLat = lat === null || lat === undefined || lat === '';
  const emptyLng = lng === null || lng === undefined || lng === '';

  // Ambas vazias é válido
  if (emptyLat && emptyLng) {
    return null;
  }

  // Apenas uma preenchida é inválido
  if (emptyLat || emptyLng) {
    return 'Latitude e longitude devem ser ambas preenchidas ou ambas vazias.';
  }

  const nLat = Number(lat);
  const nLng = Number(lng);

  if (Number.isNaN(nLat) || Number.isNaN(nLng)) {
    return 'Coordenadas inválidas. Insira valores numéricos.';
  }

  if (nLat < -90 || nLat > 90) {
    return 'A latitude deve estar entre -90 e 90.';
  }

  if (nLng < -180 || nLng > 180) {
    return 'A longitude deve estar entre -180 e 180.';
  }

  return null;
}

/**
 * [RF04] Localização válida = coordenadas válidas OU (província + distrito)
 */
export function validarLocalizacao(dados = {}) {
  const { lat, lng, provincia, distrito } = dados;
  const emptyLat = lat === null || lat === undefined || lat === '';
  const emptyLng = lng === null || lng === undefined || lng === '';
  const hasCoords = !emptyLat || !emptyLng;

  // Se coordenadas foram indicadas, validá-las
  const coordErr = validarCoordenadas(lat, lng);
  if (coordErr) {
    return coordErr;
  }

  const validCoords = hasCoords && coordErr === null;
  const hasProvDist = Boolean((provincia ?? '').trim() && (distrito ?? '').trim());

  if (!validCoords && !hasProvDist) {
    return 'A localização é obrigatória. Indique província e distrito ou coordenadas válidas.';
  }

  return null;
}

/**
 * [Assumida] Data e hora de observação opcional; se preenchida, não pode ser futura
 */
export function validarDataObservacao(data) {
  if (!data) {
    return null;
  }
  const dt = new Date(data);
  if (Number.isNaN(dt.getTime())) {
    return 'Data e hora inválida.';
  }
  if (dt > new Date()) {
    return 'A data e hora de observação não pode ser futura.';
  }
  return null;
}

/**
 * Validação agregada de uma ocorrência
 * @returns {Record<string, string>} Mapa de { [campo]: mensagem }
 */
export function validarOcorrencia(dados = {}) {
  const errors = {};

  const tipoErr = validarTipo(dados.tipo);
  if (tipoErr) errors.tipo = tipoErr;

  const tituloErr = validarTitulo(dados.titulo);
  if (tituloErr) errors.titulo = tituloErr;

  const descErr = validarDescricao(dados.descricao);
  if (descErr) errors.descricao = descErr;

  const locErr = validarLocalizacao(dados);
  if (locErr) {
    errors.localizacao = locErr;
    const coordErr = validarCoordenadas(dados.lat, dados.lng);
    if (coordErr) {
      errors.coordenadas = coordErr;
    }
    if (!dados.provincia && !dados.lat) {
      errors.provincia = 'Selecione a província.';
    }
    if (!dados.distrito && !dados.lat) {
      errors.distrito = 'Indique o distrito.';
    }
  }

  const dataErr = validarDataObservacao(dados.data);
  if (dataErr) errors.data = dataErr;

  return errors;
}

