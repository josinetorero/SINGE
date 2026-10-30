/**
 * SINGE - Cliente HTTP centralizado para a API Laravel Sanctum
 * Mapeia erros 422 (errors.campo[0]) e trata falhas de rede [RNF12].
 */

const BASE_URL = import.meta.env?.VITE_API_URL || '/api';

export class NetworkError extends Error {
  constructor(message = 'Sem ligação. Os seus dados foram mantidos.') {
    super(message);
    this.name = 'NetworkError';
    this.isNetworkError = true;
  }
}

export class ValidationError extends Error {
  constructor(errors = {}, message = 'Erro de validação dos dados.') {
    super(message);
    this.name = 'ValidationError';
    this.errors = errors; // { campo: 'mensagem' }
    this.status = 422;
  }
}

export class ApiError extends Error {
  constructor(message = 'Erro na resposta do servidor.', status = 500, data = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

/**
 * Função utilitária para mapear a resposta de erro 422 do Laravel
 * Formato Laravel: { message: "...", errors: { campo: ["mensagem 1", ...] } }
 */
export function formatarErrosLaravel(data) {
  const result = {};
  if (data && typeof data === 'object') {
    if (data.errors && typeof data.errors === 'object') {
      for (const [campo, msgs] of Object.entries(data.errors)) {
        if (Array.isArray(msgs) && msgs.length > 0) {
          result[campo] = msgs[0];
        } else if (typeof msgs === 'string') {
          result[campo] = msgs;
        }
      }
    } else if (data.message) {
      result.geral = data.message;
    }
  }
  return result;
}

export async function request(endpoint, options = {}) {
  const url = endpoint.startsWith('http') ? endpoint : `${BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  const headers = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    ...options.headers,
  };

  const token = localStorage.getItem('singe_token') || sessionStorage.getItem('singe_token');
  if (token && !headers.Authorization) {
    headers.Authorization = `Bearer ${token}`;
  }

  let response;
  try {
    response = await fetch(url, {
      ...options,
      headers,
    });
  } catch (err) {
    // Falha de rede pura (sem conexão, offline, DNS, timeout) [RNF12]
    throw new NetworkError('Sem ligação. Os seus dados foram mantidos.');
  }

  // Tratamento de respostas de erro
  if (!response.ok) {
    let responseData = null;
    try {
      responseData = await response.json();
    } catch {
      responseData = null;
    }

    if (response.status === 422) {
      const fieldErrors = formatarErrosLaravel(responseData);
      throw new ValidationError(
        fieldErrors,
        responseData?.message || 'Dados inválidos fornecidos.'
      );
    }

    throw new ApiError(
      responseData?.message || `Erro do servidor (${response.status})`,
      response.status,
      responseData
    );
  }

  // Resposta bem sucedida
  if (response.status === 204) {
    return null;
  }

  try {
    return await response.json();
  } catch {
    return null;
  }
}

export const api = {
  get: (endpoint, headers) => request(endpoint, { method: 'GET', headers }),
  post: (endpoint, body, headers) => request(endpoint, { method: 'POST', body: JSON.stringify(body), headers }),
  put: (endpoint, body, headers) => request(endpoint, { method: 'PUT', body: JSON.stringify(body), headers }),
  patch: (endpoint, body, headers) => request(endpoint, { method: 'PATCH', body: JSON.stringify(body), headers }),
  delete: (endpoint, headers) => request(endpoint, { method: 'DELETE', headers }),
};

