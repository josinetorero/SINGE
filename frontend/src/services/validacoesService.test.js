import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { validacoesService } from './validacoesService';

function jsonResponse(data) {
  return { ok: true, status: 201, json: vi.fn().mockResolvedValue(data) };
}

describe('serviço de validações', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    localStorage.setItem('singe_token', 'operator-token');
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('envia apenas o resultado e justificação ao endpoint, sem identificar o actor no cliente', async () => {
    fetch.mockResolvedValue(jsonResponse({
      success: true,
      data: { id: 21, ocorrencia_id: 7, estado: 'REJEITADA', utilizador_id: 3 },
    }));

    await expect(validacoesService.registar({
      ocorrencia_id: 7,
      estado: 'REJEITADA',
      motivo: 'Informação não confirmada.',
      observacoes: '',
    })).resolves.toMatchObject({ id: 21, utilizador_id: 3 });

    expect(fetch).toHaveBeenCalledWith('/api/validacoes/ocorrencias', expect.objectContaining({
      method: 'POST',
      body: JSON.stringify({
        ocorrencia_id: 7,
        estado: 'REJEITADA',
        motivo: 'Informação não confirmada.',
      }),
    }));
  });
});
