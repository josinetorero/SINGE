import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { coordenadorService } from './coordenadorService';

function jsonResponse(data, status = 200) {
  return { ok: status >= 200 && status < 300, status, json: vi.fn().mockResolvedValue(data) };
}

describe('serviço API do Coordenador', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    localStorage.setItem('singe_token', 'coordinator-token');
    vi.stubGlobal('fetch', vi.fn());
  });
  afterEach(() => vi.unstubAllGlobals());

  it('envia filtros e pontuações ao backend sem fornecer identidade do avaliador', async () => {
    fetch.mockResolvedValue(jsonResponse({ success: true, data: { id: 17 } }));
    await coordenadorService.ocorrencias({ estado: 'registada', prioridade_id: 2 });
    expect(fetch.mock.calls[0][0]).toContain('/api/coordenador/ocorrencias?');
    expect(fetch.mock.calls[0][0]).toContain('prioridade_id=2');

    const payload = {
      ocorrencia_id: 12,
      factores: [{ fator_prioridade_id: 3, pontuacao: 7 }],
    };
    await coordenadorService.evaluate(payload);
    expect(fetch.mock.calls[1][1].body).toBe(JSON.stringify(payload));
    expect(payload).not.toHaveProperty('utilizador_id');
  });
});
