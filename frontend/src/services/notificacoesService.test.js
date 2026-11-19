import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { notificacoesService } from './notificacoesService';

function jsonResponse(data, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: vi.fn().mockResolvedValue(data),
  };
}

describe('serviço de notificações do cidadão', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    localStorage.setItem('singe_token', 'citizen-token');
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('extrai a lista do envelope JSON do backend', async () => {
    const notifications = [{ id: 2, titulo: 'Aviso', mensagem: 'Mensagem', tipo: 'info', lida: false }];
    fetch.mockResolvedValue(jsonResponse({ success: true, data: notifications }));

    await expect(notificacoesService.listar()).resolves.toEqual(notifications);
    expect(fetch).toHaveBeenCalledWith('/api/notificacoes', expect.objectContaining({
      headers: expect.objectContaining({ Authorization: 'Bearer citizen-token' }),
    }));
  });

  it('marca uma notificação como lida usando o endpoint real', async () => {
    fetch.mockResolvedValue(jsonResponse({
      success: true,
      data: { id: 2, lida: true, data_leitura: '2026-01-01T10:00:00Z' },
    }));

    await expect(notificacoesService.marcarComoLida(2)).resolves.toMatchObject({ id: 2, lida: true });
    expect(fetch).toHaveBeenCalledWith('/api/notificacoes/2/lida', expect.objectContaining({
      method: 'PATCH',
      body: '{}',
    }));
  });

  it('não transforma uma resposta malformada em lista vazia', async () => {
    fetch.mockResolvedValue(jsonResponse({ success: true, data: null }));

    await expect(notificacoesService.listar()).rejects.toMatchObject({
      name: 'ApiError',
      status: 502,
    });
  });
});
