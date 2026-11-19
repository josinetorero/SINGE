import { api, ApiError } from './api';

function extractData(response, expected) {
  if (!response?.success || !expected(response.data)) {
    throw new ApiError('A API devolveu uma resposta inválida para o módulo Operador.', 502, response);
  }
  return response.data;
}

export const operadorService = {
  async listarOcorrencias(filters = {}) {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(filters)) {
      if (value !== '' && value !== null && value !== undefined) params.set(key, String(value));
    }

    return extractData(
      await api.get(`/operador/ocorrencias?${params.toString()}`),
      data => Array.isArray(data?.items) && Boolean(data?.pagination) && Boolean(data?.estatisticas),
    );
  },

  async listarTipos() {
    return extractData(
      await api.get('/operador/tipos-ocorrencia'),
      Array.isArray,
    );
  },
  async registarOcorrencia(payload) {
    const response = await api.post('/operador/ocorrencias', payload);
    if (!response?.success || !response.data || !Number.isInteger(response.data.id)) {
      throw new ApiError('A API devolveu uma resposta inválida ao registar a ocorrência.', 502, response);
    }
    return response.data;
  },
  async sugerirComplementos(id) {
    return extractData(await api.get(`/operador/ocorrencias/${encodeURIComponent(id)}/sugerir-complementos`), data => data && typeof data === 'object');
  },
};

export default operadorService;
