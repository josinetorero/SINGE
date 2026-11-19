import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { operadorService } from './operadorService';

function jsonResponse(data, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: vi.fn().mockResolvedValue(data),
  };
}

describe('serviço de ocorrências do Operador', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    localStorage.setItem('singe_token', 'operator-token');
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('envia filtros e paginação ao backend e valida a estrutura de resposta', async () => {
    const data = {
      items: [],
      pagination: { current_page: 2, per_page: 15, last_page: 3, total: 40 },
      estatisticas: { total: 40, pendentes_analise: 12, validadas: 8 },
    };
    fetch.mockResolvedValue(jsonResponse({ success: true, data }));

    await expect(operadorService.listarOcorrencias({
      q: 'cheia',
      estado: 'registada',
      provincia: 'Sofala',
      data_inicio: '2026-01-01',
      page: 2,
      per_page: 15,
    })).resolves.toEqual(data);

    const [url, options] = fetch.mock.calls[0];
    expect(url).toContain('/api/operador/ocorrencias?');
    expect(url).toContain('q=cheia');
    expect(url).toContain('estado=registada');
    expect(url).toContain('provincia=Sofala');
    expect(url).toContain('data_inicio=2026-01-01');
    expect(url).toContain('page=2');
    expect(options.headers.Authorization).toMatch(/^Bearer /);
  });

  it('não transforma uma resposta malformada em lista vazia', async () => {
    fetch.mockResolvedValue(jsonResponse({ success: true, data: [] }));

    await expect(operadorService.listarOcorrencias()).rejects.toMatchObject({
      name: 'ApiError',
      status: 502,
    });
  });
});
