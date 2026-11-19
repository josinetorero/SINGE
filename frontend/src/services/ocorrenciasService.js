import { api, ApiError } from './api';

function extractData(response, expected) {
  if (!response?.success || !expected(response.data)) {
    throw new ApiError('A API devolveu uma resposta inválida para ocorrências.', 502, response);
  }
  return response.data;
}

export const ocorrenciasService = {
  async listar({ estado, tipo_ocorrencia_id, page = 1, per_page = 20 } = {}) {
    const params = new URLSearchParams({ page: String(page), per_page: String(per_page) });
    if (estado) params.set('estado', estado);
    if (tipo_ocorrencia_id) params.set('tipo_ocorrencia_id', String(tipo_ocorrencia_id));

    return extractData(
      await api.get(`/ocorrencias?${params.toString()}`),
      data => Array.isArray(data?.items) && data?.pagination,
    );
  },

  async registar(dados) {
    return extractData(
      await api.post('/ocorrencias', dados),
      data => data && typeof data === 'object' && Number.isInteger(data.id),
    );
  },

  async obterPorId(id) {
    return extractData(
      await api.get(`/ocorrencias/${encodeURIComponent(id)}`),
      data => data && typeof data === 'object' && Number.isInteger(data.id),
    );
  },

  async atualizarDescricao(id, descricao) {
    return extractData(await api.patch(`/ocorrencias/${encodeURIComponent(id)}`, { descricao }), data => data && typeof data === 'object');
  },

  async listarTipos() {
    return extractData(
      await api.get('/tipos-ocorrencia'),
      Array.isArray,
    );
  },

  async opcoesGeograficas(tipo, parentId = null, parentType = null) {
    const params = new URLSearchParams({ tipo });
    if (parentId) params.set('parent_id', String(parentId));
    if (parentType) params.set('parent_type', parentType);
    return extractData(await api.get(`/referencias/geograficas?${params}`), Array.isArray);
  },
};

export default ocorrenciasService;
