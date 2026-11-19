import { api, ApiError } from './api';

function dataOf(response) {
  if (!response?.success || response.data === undefined) {
    throw new ApiError('A API devolveu uma resposta inválida para o módulo do Coordenador.', 502, response);
  }
  return response.data;
}

export const coordenadorService = {
  async dashboard() {
    return dataOf(await api.get('/coordenador/dashboard'));
  },
  async tiposOcorrencia() {
    return dataOf(await api.get('/coordenador/tipos-ocorrencia'));
  },
  async ocorrencias(filters = {}) {
    const params = new URLSearchParams(Object.entries(filters)
      .filter(([, value]) => value !== '' && value !== null && value !== undefined)
      .map(([key, value]) => [key, String(value)]));
    return dataOf(await api.get(`/coordenador/ocorrencias?${params}`));
  },
  async ocorrencia(id) {
    return dataOf(await api.get(`/coordenador/ocorrencias/${encodeURIComponent(id)}`));
  },
  async factors() {
    return dataOf(await api.get('/fatores-prioridade'));
  },
  async evaluations(id) {
    return dataOf(await api.get(`/avaliacoes-prioridade?ocorrencia_id=${encodeURIComponent(id)}`));
  },
  async evaluate(payload) {
    return dataOf(await api.post('/avaliacoes-prioridade', payload));
  },

  async suggestPriority(ocorrenciaId) {
    return dataOf(await api.post('/avaliacoes-prioridade/sugerir', {
      ocorrencia_id: ocorrenciaId,
    }));
  },

  async teams(filters = {}) {
    const params = new URLSearchParams(Object.entries(filters)
      .filter(([, value]) => value !== '' && value !== null && value !== undefined)
      .map(([key, value]) => [key, String(value)]));
    return dataOf(await api.get(`/equipas?${params}`));
  },
  async tiposEquipa() {
    return dataOf(await api.get('/tipos-equipa'));
  },
  async teamAvailability(id, estado) {
    return dataOf(await api.patch(`/equipas/${encodeURIComponent(id)}/disponibilidade`, { estado }));
  },
  async updateTeamLocation(id, latitude, longitude) {
    return dataOf(await api.patch(`/equipas/${encodeURIComponent(id)}/localizacao`, { latitude, longitude }));
  },
  async missions(filters = {}) {
    const params = new URLSearchParams(Object.entries(filters)
      .filter(([, value]) => value !== '' && value !== null && value !== undefined)
      .map(([key, value]) => [key, String(value)]));
    return dataOf(await api.get(`/missoes?${params}`));
  },
  async mission(id) {
    return dataOf(await api.get(`/missoes/${encodeURIComponent(id)}`));
  },
  async createMission(payload) {
    return dataOf(await api.post('/missoes', payload));
  },
  async reassignMission(id, equipa_id) {
    return dataOf(await api.patch(`/missoes/${encodeURIComponent(id)}/equipa`, { equipa_id }));
  },
  async updateMissionState(id, estado) {
    return dataOf(await api.patch(`/missoes/${encodeURIComponent(id)}/estado`, { estado }));
  },
  async cancelMission(id) {
    return dataOf(await api.post(`/missoes/${encodeURIComponent(id)}/cancelar`, {}));
  },
};

export default coordenadorService;
