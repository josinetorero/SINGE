/**
 * SINGE - Serviço de Gestão de Utilizadores (RBAC)
 * Comunica com o backend Laravel / Sanctum API
 */
import { api, ApiError } from './api';

function dataOf(response) {
  if (!response?.success || response.data === undefined) {
    throw new ApiError('A API devolveu uma resposta inválida para a gestão de utilizadores.', 502, response);
  }
  return response.data;
}

export const utilizadoresService = {
  /**
   * Lista todos os utilizadores registados
   */
  async listar() {
    return dataOf(await api.get('/utilizadores'));
  },

  /**
   * [R2] Cria um novo utilizador
   */
  async criar(dados) {
    return dataOf(await api.post('/utilizadores', dados));
  },

  /**
   * Atualiza dados de um utilizador existente
   */
  async atualizar(id, dados) {
    return dataOf(await api.put(`/utilizadores/${id}`, dados));
  },

  /**
   * [RF02/RNF05] Desativa um utilizador (nunca apaga)
   * Altera o estado para "Inactivo"
   */
  async desativar(id) {
    return dataOf(await api.patch(`/utilizadores/${id}/desativar`, {}));
  },
};

