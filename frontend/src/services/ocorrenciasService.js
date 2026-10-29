/**
 * SINGE - Serviço de Gestão de Ocorrências
 * Comunica com o backend Laravel / Sanctum API
 */
import { api } from './api';

export const ocorrenciasService = {
  /**
   * Lista todas as ocorrências disponíveis
   */
  async listar() {
    return api.get('/ocorrencias');
  },

  /**
   * [R1 e R3] Cria uma nova ocorrência (Operador ou Cidadão)
   * Devolve a ocorrência com id/ref gerado pelo servidor, estado e prioridade
   */
  async registar(dados) {
    return api.post('/ocorrencias', dados);
  },

  /**
   * Consulta os detalhes de uma ocorrência
   */
  async obterPorRef(ref) {
    return api.get(`/ocorrencias/${encodeURIComponent(ref)}`);
  },
};

