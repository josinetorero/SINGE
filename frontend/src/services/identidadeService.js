import { api, ApiError } from './api';

function dataOf(response) {
  if (!response?.success || response.data === undefined) {
    throw new ApiError('A API devolveu uma resposta inválida para a verificação de identidade.', 502, response);
  }
  return response.data;
}

export const identidadeService = {
  async minha() { return dataOf(await api.get('/identificacao/minha')); },
  async submeterDocumento(fields) {
    const form = new FormData();
    Object.entries(fields).forEach(([key, value]) => { if (value !== '' && value != null) form.append(key, value); });
    return dataOf(await api.postForm('/identificacao/documentos', form));
  },
  async solicitarVerificacao(documentId) {
    return dataOf(await api.post('/identificacao/verificacoes', { documento_identificacao_id: documentId }));
  },
  async pendentes() { return dataOf(await api.get('/identificacao/verificacoes')); },
  async estatisticas() { return dataOf(await api.get('/identificacao/verificacoes/estatisticas')); },
  async historico() { return dataOf(await api.get('/identificacao/verificacoes/historico')); },
  async iniciarAnalise(id) { return dataOf(await api.post(`/identificacao/verificacoes/${id}/analise`, {})); },
  async aprovar(id, observacoes = '') { return dataOf(await api.post(`/identificacao/verificacoes/${id}/aprovar`, { observacoes })); },
  async rejeitar(id, motivo) { return dataOf(await api.post(`/identificacao/verificacoes/${id}/rejeitar`, { motivo })); },
  async solicitarCorrecao(id, motivo) { return dataOf(await api.post(`/identificacao/verificacoes/${id}/correccao`, { motivo })); },
  descarregarDocumento(id) { return api.getBlob(`/identificacao/verificacoes/${id}/documento`); },
};

export default identidadeService;
