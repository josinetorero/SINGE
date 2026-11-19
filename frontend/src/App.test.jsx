import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import App from './App';

function jsonResponse(data, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: vi.fn().mockResolvedValue(data),
  };
}

describe('protecção do painel do Cidadão', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('mostra o login sem uma sessão autenticada', async () => {
    render(<App />);

    expect(await screen.findByRole('heading', { name: 'Faça Login' })).toBeInTheDocument();
    expect(fetch).not.toHaveBeenCalled();
  });

  it('encaminha o Administrador para o espaço operacional, não para o painel do Cidadão', async () => {
    localStorage.setItem('singe_token', 'admin-token');
    fetch.mockResolvedValue(jsonResponse({
      user: {
        id: 8,
        name: 'Utilizador Administrador',
        email: 'admin@example.test',
        perfil: { nome: 'Administrador' },
      },
    }));

    render(<App />);

    expect(await screen.findByRole('heading', { name: 'Painel geral' }, { timeout: 10000 })).toBeInTheDocument();
    expect(screen.queryByText(/Bem-vindo\(a\),/)).not.toBeInTheDocument();
  });

  it('encaminha o Coordenador para o seu espaço operacional, não para o módulo do Operador', async () => {
    localStorage.setItem('singe_token', 'coordinator-token');
    fetch.mockResolvedValue(jsonResponse({
      user: {
        id: 9,
        name: 'Carlos Coordenador',
        email: 'carlos@example.test',
        perfil: { nome: 'Coordenador' },
      },
    }));

    render(<App />);

    expect(await screen.findByText('Centro de Coordenação')).toBeInTheDocument();
    expect(screen.queryByText('Painel do Operador')).not.toBeInTheDocument();
  });

  it('integra o Agente com as missões da sua equipa e regista a recepção pela API', async () => {
    localStorage.setItem('singe_token', 'agent-token');
    const mission = {
      id: 12,
      estado: 'atribuida',
      data_atribuicao: '2026-11-12T09:00:00Z',
      data_prevista_conclusao: '2026-11-13T09:00:00Z',
      objectivos: 'Prestar assistência.',
      instrucoes: 'Manter contacto com o Coordenador.',
      ocorrencia: { id: 31, titulo: 'Cheia junto ao mercado', localizacao: 'Beira', distrito: 'Beira', provincia: 'Sofala' },
      equipa: { id: 4, nome: 'Equipa Resgate', membros: [{ id: 9, nome: 'Ana Agente', perfil: 'Agente' }] },
      historico: [],
    };
    fetch.mockImplementation((url, options = {}) => {
      if (url === '/api/me') return Promise.resolve(jsonResponse({ user: {
        id: 9, name: 'Ana Agente', email: 'ana@example.test', perfil: { nome: 'Agente' },
        equipa_id: 4, equipa: { id: 4, nome: 'Equipa Resgate' },
      } }));
      if (url === '/api/equipas/4/missoes') return Promise.resolve(jsonResponse({ success: true, data: [
        { id: 12, estado: 'atribuida', data_atribuicao: mission.data_atribuicao, ocorrencia_id: 31 },
      ] }));
      if (url === '/api/notificacoes' || url.startsWith('/api/alertas-publicos')) return Promise.resolve(jsonResponse({ success: true, data: [] }));
      if (url === '/api/missoes/12') return Promise.resolve(jsonResponse({ success: true, data: mission }));
      if (url === '/api/missoes/12/actividades' && options.method === 'POST') return Promise.resolve(jsonResponse({
        success: true, data: { ...mission, historico: [{ id: 80, operacao: 'conhecimento_confirmado', estado_anterior: 'atribuida', estado_novo: 'atribuida', utilizador: 'Ana Agente' }] },
      }, 201));
      throw new Error(`Pedido inesperado: ${url}`);
    });

    render(<App />);
    expect(await screen.findByRole('heading', { name: 'Painel do Agente' })).toBeInTheDocument();
    fireEvent.click(await screen.findByRole('button', { name: /Missão #12/ }));
    fireEvent.click(await screen.findByRole('button', { name: 'Confirmar recepção' }));

    await waitFor(() => expect(fetch).toHaveBeenCalledWith('/api/missoes/12/actividades', expect.objectContaining({
      method: 'POST',
      body: JSON.stringify({ operacao: 'conhecimento' }),
    })));
  });

  it('apresenta a identidade real e dados vazios da API, sem ocorrências mock', async () => {
    localStorage.setItem('singe_token', 'citizen-token');
    fetch.mockImplementation((url) => {
      if (url === '/api/me') {
        return Promise.resolve(jsonResponse({
          user: {
            id: 7,
            name: 'Maria Cidadã',
            email: 'maria@example.test',
            perfil: { nome: 'Cidadão' },
          },
        }));
      }
      if (url === '/api/notificacoes' || url === '/api/tipos-ocorrencia') {
        return Promise.resolve(jsonResponse({ success: true, data: [] }));
      }
      if (url.startsWith('/api/ocorrencias?')) {
        return Promise.resolve(jsonResponse({
          success: true,
          data: {
            items: [],
            pagination: { current_page: 1, per_page: 5, last_page: 1, total: 0 },
            estatisticas: { total: 0, em_acompanhamento: 0, resolvidas: 0 },
          },
        }));
      }
      throw new Error(`Pedido inesperado: ${url}`);
    });

    render(<App />);

    await waitFor(() => expect(screen.getByText('Bem-vindo(a), Maria Cidadã')).toBeInTheDocument());
    expect(await screen.findByText('Ainda não existem ocorrências registadas na sua conta.')).toBeInTheDocument();
    expect(screen.queryByText('OC-2025-001')).not.toBeInTheDocument();
    expect(screen.getByText('Maria Cidadã')).toBeInTheDocument();
    expect(fetch).toHaveBeenCalledWith('/api/notificacoes', expect.objectContaining({
      headers: expect.objectContaining({ Authorization: expect.stringMatching(/^Bearer /) }),
    }));
  });

  it('integra o painel, filtros, detalhe e validação do Operador com a API', async () => {
    localStorage.setItem('singe_token', 'operator-token');
    const occurrence = {
      id: 42,
      titulo: 'Cheia junto à escola',
      descricao: 'Água acumulada na entrada da escola.',
      localizacao: 'Bairro Central',
      estado: 'registada',
      created_at: '2026-11-11T09:30:00Z',
      updated_at: '2026-11-11T09:30:00Z',
      tipo_ocorrencia: { id: 3, nome: 'Inundação' },
      localizacao_geografica: { provincia: 'Sofala', distrito: 'Beira' },
      latitude: null,
      longitude: null,
      comunicante: { id: 7, name: 'Maria Cidadã', email: 'maria@example.test' },
      historico: [],
      validacoes: [],
      evidencias: [],
    };
    const listData = {
      items: [occurrence],
      pagination: { current_page: 1, per_page: 15, last_page: 1, total: 1 },
      estatisticas: {
        total: 1,
        pendentes_analise: 1,
        validadas: 0,
        nao_confirmadas: 0,
        rejeitadas: 0,
        duplicadas: 0,
      },
    };
    let validationRejectedOnce = false;
    fetch.mockImplementation((url, options = {}) => {
      if (url === '/api/me') {
        return Promise.resolve(jsonResponse({
          user: {
            id: 8,
            name: 'Ana Operadora',
            email: 'ana@example.test',
            perfil: { nome: 'Operador' },
          },
        }));
      }
      if (url === '/api/operador/tipos-ocorrencia') {
        return Promise.resolve(jsonResponse({ success: true, data: [{ id: 3, nome: 'Inundação', ativo: true }] }));
      }
      if (url.startsWith('/api/operador/ocorrencias?')) {
        return Promise.resolve(jsonResponse({ success: true, data: listData }));
      }
      if (url === '/api/ocorrencias/42') {
        return Promise.resolve(jsonResponse({ success: true, data: occurrence }));
      }
      if (url === '/api/validacoes/ocorrencias' && options.method === 'POST') {
        if (!validationRejectedOnce) {
          validationRejectedOnce = true;
          return Promise.resolve(jsonResponse({
            message: 'A justificação precisa de mais detalhe.',
            errors: { motivo: ['Indique factos observáveis no motivo.'] },
          }, 422));
        }
        return Promise.resolve(jsonResponse({
          success: true,
          data: { id: 92, ocorrencia_id: 42, estado: 'REJEITADA', utilizador_id: 8 },
        }, 201));
      }
      throw new Error(`Pedido inesperado: ${url}`);
    });

    render(<App />);

    expect(await screen.findByText('Painel do Operador')).toBeInTheDocument();
    expect(await screen.findByText('Ana Operadora')).toBeInTheDocument();
    expect(screen.getByText('Total de ocorrências')).toBeInTheDocument();
    expect(screen.queryByText('Registar Nova Ocorrência')).not.toBeInTheDocument();
    expect(screen.queryByText('Hoje, 08:35')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Ocorrências' }));
    expect(await screen.findByText('Cheia junto à escola')).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('Filtrar por estado'), { target: { value: 'registada' } });
    await waitFor(() => expect(fetch.mock.calls.some(([url]) => (
      url.startsWith('/api/operador/ocorrencias?') && url.includes('estado=registada')
    ))).toBe(true));

    fireEvent.click(screen.getByRole('button', { name: 'Consultar ocorrência 42' }));
    expect(await screen.findByText('Maria Cidadã')).toBeInTheDocument();
    fireEvent.change(screen.getByRole('combobox', { name: /Resultado/ }), { target: { value: 'REJEITADA' } });
    fireEvent.change(screen.getByRole('textbox', { name: /Motivo/ }), { target: { value: 'Informação não confirmada.' } });
    fireEvent.click(screen.getByRole('button', { name: 'Registar validação' }));
    expect(await screen.findByText('Indique factos observáveis no motivo.')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Registar validação' }));

    await waitFor(() => expect(fetch).toHaveBeenCalledWith('/api/validacoes/ocorrencias', expect.objectContaining({
      method: 'POST',
      body: JSON.stringify({
        ocorrencia_id: 42,
        estado: 'REJEITADA',
        motivo: 'Informação não confirmada.',
      }),
    })));
    expect(await screen.findByText('Validação registada pelo servidor.')).toBeInTheDocument();
  });

  it('apresenta erros reais da API no painel do Operador', async () => {
    localStorage.setItem('singe_token', 'operator-token');
    fetch.mockImplementation((url) => {
      if (url === '/api/me') {
        return Promise.resolve(jsonResponse({
          user: {
            id: 8,
            name: 'Ana Operadora',
            email: 'ana@example.test',
            perfil: { nome: 'Operador' },
          },
        }));
      }
      if (url === '/api/operador/tipos-ocorrencia') {
        return Promise.resolve(jsonResponse({ success: true, data: [] }));
      }
      if (url.startsWith('/api/operador/ocorrencias?')) {
        return Promise.resolve(jsonResponse({ message: 'Serviço de ocorrências indisponível.' }, 503));
      }
      throw new Error(`Pedido inesperado: ${url}`);
    });

    render(<App />);

    expect(await screen.findByText('Serviço de ocorrências indisponível.')).toBeInTheDocument();
    expect(screen.queryByText('OC-2025-0142')).not.toBeInTheDocument();
  });
});
