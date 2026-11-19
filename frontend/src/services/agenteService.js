import { api, ApiError } from './api';

function dataOf(response) {
  if (!response?.success || response.data === undefined) {
    throw new ApiError('A API devolveu uma resposta inválida para o módulo do Agente.', 502, response);
  }
  return response.data;
}

export const agenteService = {
  async missoesDaEquipa(teamId) {
    return dataOf(await api.get(`/equipas/${encodeURIComponent(teamId)}/missoes`));
  },
  async missao(id) {
    return dataOf(await api.get(`/missoes/${encodeURIComponent(id)}`));
  },
  async registarActividade(id, payload) {
    return dataOf(await api.post(`/missoes/${encodeURIComponent(id)}/actividades`, payload));
  },
};

export default agenteService;
