import { api, ApiError } from './api';

function extractData(response, expected) {
  if (!response?.success || !expected(response.data)) {
    throw new ApiError('A API devolveu uma resposta inválida para evidências.', 502, response);
  }
  return response.data;
}

export const evidenciasService = {
  async listar(ocorrenciaId) {
    return extractData(
      await api.get(`/ocorrencias/${encodeURIComponent(ocorrenciaId)}/evidencias`),
      Array.isArray,
    );
  },

  async anexar(ocorrenciaId, file, descricao = '') {
    const formData = new FormData();
    formData.append('ocorrencia_id', String(ocorrenciaId));
    formData.append('ficheiro', file);
    if (descricao.trim()) formData.append('descricao', descricao.trim());

    return extractData(
      await api.postForm('/evidencias', formData),
      data => data && typeof data === 'object' && Number.isInteger(data.id),
    );
  },

  descarregar(id) {
    return api.getBlob(`/evidencias/${encodeURIComponent(id)}/download`);
  },
};

export default evidenciasService;
