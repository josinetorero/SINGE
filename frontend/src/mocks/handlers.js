/**
 * SINGE - MSW Handlers para testes e desenvolvimento
 * Simula a API Laravel com Sanctum quando VITE_USE_MOCK=true.
 */
import { http, HttpResponse } from 'msw';
import { OCORRENCIAS, UTILIZADORES } from '../data/mockData.js';

// Estado em memória clonado dos dados de demonstração
let mockOcorrencias = [
  ...OCORRENCIAS.map(o => ({
    ...o,
    id: o.ref,
  }))
];

let mockUtilizadores = [
  ...UTILIZADORES.map(u => ({
    ...u,
  }))
];

let nextOcNumber = 143;
let nextUserNumber = 9;

export const handlers = [
  // --- OCORRÊNCIAS ---
  http.get('/api/ocorrencias', () => {
    return HttpResponse.json(mockOcorrencias);
  }),

  http.get('/api/ocorrencias/:ref', ({ params }) => {
    const oc = mockOcorrencias.find(o => o.ref === params.ref || o.id === params.ref);
    if (!oc) {
      return HttpResponse.json({ message: 'Ocorrência não encontrada.' }, { status: 404 });
    }
    return HttpResponse.json(oc);
  }),

  // [R1 e R3] Criar nova ocorrência
  // Regra: estado "Por validar", id único e prioridade nula
  http.post('/api/ocorrencias', async ({ request }) => {
    const body = await request.json();

    const uniqueRef = `OC-2025-${String(nextOcNumber++).padStart(4, '0')}`;
    const nova = {
      id: uniqueRef,
      ref: uniqueRef,
      tipo: body.tipo,
      titulo: body.titulo,
      descricao: body.descricao,
      provincia: body.provincia || 'Maputo',
      distrito: body.distrito || '',
      localidade: body.localidade || '',
      lat: body.lat !== undefined && body.lat !== '' ? Number(body.lat) : null,
      lng: body.lng !== undefined && body.lng !== '' ? Number(body.lng) : null,
      data: body.data || new Date().toISOString().slice(0, 16).replace('T', ' '),
      estado: 'Por validar', // Conforme especificado no requisito 5
      prioridade: null,       // Conforme especificado no requisito 5
      fonte: body.fonte || 'Cidadão',
      afectados: body.afectados ?? 0,
      risco: 'A avaliar',
      responsavel: body.responsavel || 'Operador',
      created_at: new Date().toISOString(),
    };

    mockOcorrencias.unshift(nova);
    return HttpResponse.json(nova, { status: 201 });
  }),

  // --- UTILIZADORES ---
  http.get('/api/utilizadores', () => {
    return HttpResponse.json(mockUtilizadores);
  }),

  // [R2] Criar utilizador
  // Regra: 422 para email duplicado
  http.post('/api/utilizadores', async ({ request }) => {
    const body = await request.json();
    const emailNorm = (body.email ?? '').trim().toLowerCase();

    // Verificação de email duplicado (case-insensitive)
    const exists = mockUtilizadores.some(u => (u.email ?? '').trim().toLowerCase() === emailNorm);
    if (exists) {
      return HttpResponse.json(
        {
          message: 'Os dados fornecidos são inválidos.',
          errors: {
            email: ['O email já se encontra registado no sistema.'],
          },
        },
        { status: 422 }
      );
    }

    const uniqueId = `US-${String(nextUserNumber++).padStart(3, '0')}`;
    const novo = {
      id: uniqueId,
      nome: (body.nome ?? '').trim(),
      email: (body.email ?? '').trim(),
      perfil: body.perfil || 'Operador',
      estado: 'Activo',
      registo: new Date().toISOString().slice(0, 10),
    };

    mockUtilizadores.unshift(novo);
    return HttpResponse.json(novo, { status: 201 });
  }),

  // [RF02/RNF05] Desativar utilizador (passa a Inactivo, nunca remove)
  http.patch('/api/utilizadores/:id/desativar', ({ params }) => {
    const idx = mockUtilizadores.findIndex(u => String(u.id) === String(params.id));
    if (idx === -1) {
      return HttpResponse.json({ message: 'Utilizador não encontrado.' }, { status: 404 });
    }

    mockUtilizadores[idx] = {
      ...mockUtilizadores[idx],
      estado: 'Inactivo',
    };

    return HttpResponse.json(mockUtilizadores[idx]);
  }),

  http.put('/api/utilizadores/:id', async ({ params, request }) => {
    const body = await request.json();
    const idx = mockUtilizadores.findIndex(u => String(u.id) === String(params.id));
    if (idx === -1) {
      return HttpResponse.json({ message: 'Utilizador não encontrado.' }, { status: 404 });
    }

    mockUtilizadores[idx] = {
      ...mockUtilizadores[idx],
      nome: body.nome || mockUtilizadores[idx].nome,
      perfil: body.perfil || mockUtilizadores[idx].perfil,
      estado: body.estado || mockUtilizadores[idx].estado,
    };

    return HttpResponse.json(mockUtilizadores[idx]);
  }),
];

/**
 * Função para reiniciar os dados do mock durante os testes
 */
export function resetMockData() {
  mockOcorrencias = [
    ...OCORRENCIAS.map(o => ({
      ...o,
      id: o.ref,
    }))
  ];
  mockUtilizadores = [
    ...UTILIZADORES.map(u => ({
      ...u,
    }))
  ];
  nextOcNumber = 143;
  nextUserNumber = 9;
}

