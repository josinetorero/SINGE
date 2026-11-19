import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { api, clearStoredToken, request, setUnauthorizedHandler } from './api';

function jsonResponse(data, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: vi.fn().mockResolvedValue(data),
  };
}

describe('serviço HTTP da API', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    setUnauthorizedHandler(null);
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('envia o token guardado como Bearer', async () => {
    localStorage.setItem('singe_token', 'token-de-teste');
    fetch.mockResolvedValue(jsonResponse({ user: { id: 1 } }));

    await api.get('/me');

    expect(fetch).toHaveBeenCalledWith('/api/me', expect.objectContaining({
      headers: expect.objectContaining({ Authorization: 'Bearer token-de-teste' }),
    }));
  });

  it('converte erros 422 do Laravel em ValidationError por campo', async () => {
    fetch.mockResolvedValue(jsonResponse({
      message: 'Os dados fornecidos são inválidos.',
      errors: { email: ['O email já está registado.'] },
    }, 422));

    await expect(api.post('/register', {})).rejects.toMatchObject({
      name: 'ValidationError',
      status: 422,
      errors: { email: 'O email já está registado.' },
    });
  });

  it('limpa ambos os armazenamentos e notifica o contexto em 401', async () => {
    localStorage.setItem('singe_token', 'local-token');
    sessionStorage.setItem('singe_token', 'session-token');
    const onUnauthorized = vi.fn();
    setUnauthorizedHandler(onUnauthorized);
    fetch.mockResolvedValue(jsonResponse({ message: 'Unauthenticated.' }, 401));

    await expect(api.get('/me')).rejects.toMatchObject({ name: 'ApiError', status: 401 });

    expect(localStorage.getItem('singe_token')).toBeNull();
    expect(sessionStorage.getItem('singe_token')).toBeNull();
    expect(onUnauthorized).toHaveBeenCalledOnce();
  });

  it('preserva o status 403 para a interface tratar a falta de autorização', async () => {
    fetch.mockResolvedValue(jsonResponse({ message: 'Forbidden.' }, 403));

    await expect(request('/me')).rejects.toMatchObject({
      name: 'ApiError',
      status: 403,
    });
  });

  it('reporta falhas de rede sem simular uma resposta de sucesso', async () => {
    fetch.mockRejectedValue(new TypeError('offline'));

    await expect(request('/me')).rejects.toMatchObject({
      name: 'NetworkError',
      isNetworkError: true,
    });
  });

  it('remove o token persistido em ambos os armazenamentos', () => {
    localStorage.setItem('singe_token', 'local-token');
    sessionStorage.setItem('singe_token', 'session-token');

    clearStoredToken();

    expect(localStorage.getItem('singe_token')).toBeNull();
    expect(sessionStorage.getItem('singe_token')).toBeNull();
  });
});
