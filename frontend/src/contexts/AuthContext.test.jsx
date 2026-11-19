import React, { useState } from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthProvider, useAuth } from './AuthContext';

function SessionProbe() {
  const { user, loading, login, register, logout, authError } = useAuth();
  const [actionError, setActionError] = useState('');
  const run = async (action) => {
    try {
      await action();
    } catch (error) {
      setActionError(error.message);
    }
  };
  return (
    <div>
      <p>{loading ? 'loading' : user ? `${user.name}:${user.role}` : 'anonymous'}</p>
      <p>{authError}</p>
      <p>{actionError}</p>
      <button onClick={() => run(() => login('cidadao@example.test', 'secret', false))}>login</button>
      <button onClick={() => run(() => register({
        name: 'Maria Cidadã',
        email: 'maria@example.test',
        password: 'secret',
        password_confirmation: 'secret',
      }))}>register</button>
      <button onClick={() => run(logout)}>logout</button>
    </div>
  );
}

function renderProvider() {
  return render(<AuthProvider><SessionProbe /></AuthProvider>);
}

const citizenResponse = {
  user: {
    id: 7,
    name: 'Maria Cidadã',
    email: 'maria@example.test',
    perfil: { nome: 'Cidadão' },
    created_at: '2025-01-02T00:00:00.000000Z',
  },
  token: 'sanctum-token',
};

function jsonResponse(data, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: vi.fn().mockResolvedValue(data),
  };
}

describe('AuthProvider', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('restaura a sessão consultando /api/me em vez de confiar apenas no token', async () => {
    localStorage.setItem('singe_token', 'stored-token');
    fetch.mockResolvedValue(jsonResponse({ user: citizenResponse.user }));

    renderProvider();

    await waitFor(() => expect(screen.getByText('Maria Cidadã:cidadao')).toBeInTheDocument());
    expect(fetch).toHaveBeenCalledWith('/api/me', expect.objectContaining({ method: 'GET' }));
  });

  it('guarda o token de login apenas na sessão quando “lembrar-me” está desactivado', async () => {
    fetch.mockResolvedValue(jsonResponse(citizenResponse));
    renderProvider();
    fireEvent.click(screen.getByText('login'));

    await waitFor(() => expect(screen.getByText('Maria Cidadã:cidadao')).toBeInTheDocument());
    expect(fetch).toHaveBeenCalledWith('/api/login', expect.objectContaining({
      method: 'POST',
      body: JSON.stringify({ email: 'cidadao@example.test', password: 'secret' }),
    }));
    expect(sessionStorage.getItem('singe_token')).toBe('sanctum-token');
    expect(localStorage.getItem('singe_token')).toBeNull();
  });

  it('regista apenas os campos públicos e guarda o token devolvido pelo backend', async () => {
    fetch.mockResolvedValue(jsonResponse(citizenResponse));
    renderProvider();
    fireEvent.click(screen.getByText('register'));

    await waitFor(() => expect(screen.getByText('Maria Cidadã:cidadao')).toBeInTheDocument());
    expect(fetch).toHaveBeenCalledWith('/api/register', expect.objectContaining({
      method: 'POST',
      body: JSON.stringify({
        name: 'Maria Cidadã',
        email: 'maria@example.test',
        password: 'secret',
        password_confirmation: 'secret',
      }),
    }));
    expect(localStorage.getItem('singe_token')).toBe('sanctum-token');
  });

  it('não autentica nem guarda token quando o servidor devolve um perfil desconhecido', async () => {
    fetch.mockResolvedValue(jsonResponse({
      ...citizenResponse,
      user: { ...citizenResponse.user, perfil: { nome: 'Perfil desconhecido' } },
    }));
    renderProvider();
    fireEvent.click(screen.getByText('login'));

    await waitFor(() => expect(screen.getByText('O perfil devolvido pelo servidor não é reconhecido.')).toBeInTheDocument());
    expect(localStorage.getItem('singe_token')).toBeNull();
    expect(sessionStorage.getItem('singe_token')).toBeNull();
  });

  it('não restaura sessão quando /me rejeita o token', async () => {
    localStorage.setItem('singe_token', 'expired-token');
    fetch.mockResolvedValue(jsonResponse({ message: 'Unauthenticated.' }, 401));

    renderProvider();

    await waitFor(() => expect(screen.getByText('A sessão expirou. Inicie sessão novamente.')).toBeInTheDocument());
    expect(fetch).toHaveBeenCalledWith('/api/me', expect.objectContaining({ method: 'GET' }));
    expect(localStorage.getItem('singe_token')).toBeNull();
  });

  it('chama o endpoint de logout e remove a sessão local', async () => {
    localStorage.setItem('singe_token', 'stored-token');
    fetch
      .mockResolvedValueOnce(jsonResponse({ user: citizenResponse.user }))
      .mockResolvedValueOnce(jsonResponse({ message: 'Sessão terminada.' }));
    renderProvider();
    await screen.findByText('Maria Cidadã:cidadao');
    fireEvent.click(screen.getByText('logout'));

    await waitFor(() => expect(fetch).toHaveBeenCalledWith('/api/logout', expect.objectContaining({
      method: 'POST',
      headers: expect.objectContaining({ Authorization: 'Bearer stored-token' }),
    })));
    await waitFor(() => expect(localStorage.getItem('singe_token')).toBeNull());
  });
});
