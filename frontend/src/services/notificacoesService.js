import { api, ApiError } from './api';

function extractData(response, expected) {
  if (!response?.success || !expected(response.data)) {
    throw new ApiError('A API devolveu uma resposta inválida para notificações.', 502, response);
  }
  return response.data;
}

export const notificacoesService = {
  async listar() {
    const response = await api.get('/notificacoes');
    return extractData(response, Array.isArray);
  },

  async marcarComoLida(id) {
    const response = await api.patch(`/notificacoes/${encodeURIComponent(id)}/lida`, {});
    return extractData(response, data => data && typeof data === 'object' && data.lida === true);
  },
};

export default notificacoesService;
