/**
 * SINGE - Serviço de Gestão de Utilizadores (RBAC)
 * Comunica com o backend Laravel / Sanctum API
 */
import { api } from './api';

export const utilizadoresService = {
  /**
   * Lista todos os utilizadores registados
   */
  async listar() {
    return api.get('/utilizadores');
  },

  /**
   * [R2] Cria um novo utilizador
   */
  async criar(dados) {
    return api.post('/utilizadores', dados);
  },

  /**
   * Atualiza dados de um utilizador existente
   */
  async atualizar(id, dados) {
    return api.put(`/utilizadores/${id}`, dados);
  },

  /**
   * [RF02/RNF05] Desativa um utilizador (nunca apaga)
   * Altera o estado para "Inactivo"
   */
  async desativar(id) {
    return api.patch(`/utilizadores/${id}/desativar`);
  },
};

