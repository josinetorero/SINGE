import { api, ApiError } from './api';

export const perfilService = {
  async actualizar(dados) {
    const response = await api.patch('/me', dados);
    if (!response?.success || !response.data?.id || !response.data?.perfil) {
      throw new ApiError('A API devolveu uma resposta inválida para o perfil.', 502, response);
    }
    return response.data;
  },
};

export default perfilService;
