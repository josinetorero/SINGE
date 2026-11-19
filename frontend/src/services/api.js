const BASE_URL = import.meta.env?.VITE_API_URL || '/api';
let unauthorizedHandler = null;

export class NetworkError extends Error {
  constructor(message = 'Não foi possível contactar o servidor.') {
    super(message);
    this.name = 'NetworkError';
    this.isNetworkError = true;
  }
}

export class ValidationError extends Error {
  constructor(errors = {}, message = 'Erro de validação dos dados.') {
    super(message);
    this.name = 'ValidationError';
    this.errors = errors;
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

export function getStoredToken() {
  return localStorage.getItem('singe_token') || sessionStorage.getItem('singe_token');
}

export function clearStoredToken() {
  localStorage.removeItem('singe_token');
  sessionStorage.removeItem('singe_token');
}

export function setUnauthorizedHandler(handler) {
  unauthorizedHandler = handler;
}

export function formatarErrosLaravel(data) {
  const result = {};
  if (data?.errors && typeof data.errors === 'object') {
    for (const [field, messages] of Object.entries(data.errors)) {
      if (Array.isArray(messages) && messages.length) result[field] = messages[0];
      else if (typeof messages === 'string') result[field] = messages;
    }
  } else if (data?.message) {
    result.geral = data.message;
  }
  return result;
}

export async function request(endpoint, options = {}) {
  const url = endpoint.startsWith('http')
    ? endpoint
    : `${BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  const headers = { Accept: 'application/json', ...options.headers };
  const { responseType, ...fetchOptions } = options;
  const hasBody = fetchOptions.body !== undefined;
  if (hasBody && !(typeof FormData !== 'undefined' && fetchOptions.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  const token = getStoredToken();
  if (token && !headers.Authorization) headers.Authorization = `Bearer ${token}`;

  let response;
  try {
    response = await fetch(url, { ...fetchOptions, headers });
  } catch {
    throw new NetworkError();
  }

  if (!response.ok) {
    let responseData = null;
    try {
      responseData = await response.json();
    } catch {
      responseData = null;
    }

    if (response.status === 401) {
      clearStoredToken();
      unauthorizedHandler?.();
    }
    if (response.status === 422) {
      throw new ValidationError(
        formatarErrosLaravel(responseData),
        responseData?.message || 'Dados inválidos fornecidos.'
      );
    }
    throw new ApiError(
      responseData?.message || `Erro do servidor (${response.status}).`,
      response.status,
      responseData
    );
  }

  if (response.status === 204) return null;
  if (responseType === 'blob') return response.blob();
  if (responseType === 'text') return response.text();
  try {
    return await response.json();
  } catch {
    throw new ApiError('O servidor devolveu uma resposta inválida.', response.status);
  }
}

export const api = {
  get: (endpoint, headers) => request(endpoint, { method: 'GET', headers }),
  post: (endpoint, body, headers) => request(endpoint, { method: 'POST', body: JSON.stringify(body), headers }),
  put: (endpoint, body, headers) => request(endpoint, { method: 'PUT', body: JSON.stringify(body), headers }),
  patch: (endpoint, body, headers) => request(endpoint, { method: 'PATCH', body: JSON.stringify(body), headers }),
  delete: (endpoint, headers) => request(endpoint, { method: 'DELETE', headers }),
  postForm: (endpoint, body, headers) => request(endpoint, { method: 'POST', body, headers }),
  getBlob: (endpoint, headers) => request(endpoint, { method: 'GET', headers, responseType: 'blob' }),
};
