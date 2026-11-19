import { api, ApiError } from './api';

export const adminService = {
  async dashboard() {
    const response = await api.get('/admin/dashboard');
    if (!response?.success || response.data === undefined) throw new ApiError('A API devolveu indicadores administrativos inválidos.', 502, response);
    return response.data;
  },
};
