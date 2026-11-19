import { api, ApiError } from './api';

export const validacoesService = {
  async registar({ ocorrencia_id, estado, motivo, observacoes }) {
    const response = await api.post('/validacoes/ocorrencias', {
      ocorrencia_id,
      estado,
      ...(motivo ? { motivo } : {}),
      ...(observacoes ? { observacoes } : {}),
    });

    if (!response?.success || !Number.isInteger(response.data?.id)) {
      throw new ApiError('A API devolveu uma resposta inválida para a validação.', 502, response);
    }
    return response.data;
  },
};

export default validacoesService;
