import { api, ApiError } from './api';

function dataOf(response) {
  if (!response?.success || response.data === undefined) {
    throw new ApiError('A API devolveu uma resposta inválida para alertas públicos.', 502, response);
  }
  return response.data;
}

export const alertasPublicosService = {
  async listar(filters = {}) {
    const params = new URLSearchParams(Object.entries(filters)
      .filter(([, value]) => value !== '' && value !== null && value !== undefined)
      .map(([key, value]) => [key, String(value)]));
    return dataOf(await api.get(`/alertas-publicos?${params}`));
  },
  async listarGestao() {
    return dataOf(await api.get('/alertas-publicos/gestao/lista'));
  },
  async obter(id) {
    return dataOf(await api.get(`/alertas-publicos/${encodeURIComponent(id)}`));
  },
  async criar(payload) {
    return dataOf(await api.post('/alertas-publicos', payload));
  },
  async actualizar(id, payload) {
    return dataOf(await api.put(`/alertas-publicos/${encodeURIComponent(id)}`, payload));
  },
  async publicar(id) {
    return dataOf(await api.post(`/alertas-publicos/${encodeURIComponent(id)}/publicar`, {}));
  },
  async encerrar(id) {
    return dataOf(await api.post(`/alertas-publicos/${encodeURIComponent(id)}/encerrar`, {}));
  },
};

export default alertasPublicosService;
