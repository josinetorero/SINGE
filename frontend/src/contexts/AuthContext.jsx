import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api, ApiError, clearStoredToken, getStoredToken, setUnauthorizedHandler } from '../services/api';
import { perfilService } from '../services/perfilService';

export const ROLES = {
  CIDADAO: 'cidadao',
  OPERADOR: 'operador',
  COORDENADOR: 'coordenador',
  AGENTE: 'agente',
  ADMIN: 'administrador',
};

const ROLE_TITLES = {
  cidadao: 'Cidadão',
  operador: 'Operador',
  coordenador: 'Coordenador',
  agente: 'Agente',
  administrador: 'Administrador',
};

export const DEMO_USERS = {};
const AuthContext = createContext(null);

function normalizeRole(profile) {
  const name = typeof profile === 'string' ? profile : profile?.nome;
  const normalized = name?.normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().toLowerCase();
  const aliases = { admin: 'administrador', cidadao: 'cidadao' };
  const role = aliases[normalized] || normalized;
  return ROLE_TITLES[role] ? role : null;
}

function normalizeUser(user) {
  const role = normalizeRole(user?.perfil);
  if (!user || !role || typeof user.name !== 'string' || typeof user.email !== 'string') {
    throw new ApiError('O perfil devolvido pelo servidor não é reconhecido.', 403);
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    teamId: user.equipa_id || user.equipa?.id || null,
    teamName: user.equipa?.nome || null,
    role,
    roleTitle: ROLE_TITLES[role],
    perfil: user.perfil,
    createdAt: user.created_at || null,
  };
}

function saveToken(token, rememberMe) {
  clearStoredToken();
  (rememberMe ? localStorage : sessionStorage).setItem('singe_token', token);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState('');

  const clearSession = useCallback(() => {
    clearStoredToken();
    setUser(null);
  }, []);

  useEffect(() => {
    let active = true;
    setUnauthorizedHandler(() => {
      if (active) {
        setUser(null);
        setAuthError('A sessão expirou. Inicie sessão novamente.');
      }
    });

    if (!getStoredToken()) {
      setLoading(false);
      return () => {
        active = false;
        setUnauthorizedHandler(null);
      };
    }

    api.get('/me')
      .then(({ user: apiUser }) => {
        if (active) setUser(normalizeUser(apiUser));
      })
      .catch((error) => {
        if (active && error.status !== 401) {
          if (error.status === 403) clearStoredToken();
          setAuthError(`Não foi possível validar a sessão: ${error.message}`);
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
      setUnauthorizedHandler(null);
    };
  }, []);

  const login = useCallback(async (email, password, rememberMe = true) => {
    setAuthError('');
    clearStoredToken();
    const response = await api.post('/login', { email, password });
    const authenticatedUser = normalizeUser(response.user);
    if (!response.token) throw new ApiError('O servidor não devolveu um token de acesso.', 500);
    saveToken(response.token, rememberMe);
    setUser(authenticatedUser);
    return authenticatedUser;
  }, []);

  const register = useCallback(async ({ name, email, password, password_confirmation }) => {
    setAuthError('');
    clearStoredToken();
    const response = await api.post('/register', { name, email, password, password_confirmation });
    const authenticatedUser = normalizeUser(response.user);
    if (!response.token) throw new ApiError('O servidor não devolveu um token de acesso.', 500);
    saveToken(response.token, true);
    setUser(authenticatedUser);
    return authenticatedUser;
  }, []);

  const logout = useCallback(async () => {
    try {
      if (getStoredToken()) await api.post('/logout', {});
    } catch (error) {
      setAuthError(`A sessão foi terminada neste dispositivo, mas o servidor não confirmou o logout: ${error.message}`);
    } finally {
      clearSession();
    }
  }, [clearSession]);

  const updateProfile = useCallback(async (profileData) => {
    const updatedUser = normalizeUser(await perfilService.actualizar(profileData));
    setUser(updatedUser);
    return updatedUser;
  }, []);

  const contextValue = useMemo(() => ({
    user,
    role: user?.role || null,
    isAuthenticated: Boolean(user),
    loading,
    authError,
    clearAuthError: () => setAuthError(''),
    login,
    register,
    logout,
    updateProfile,
    clearSession,
    switchRole: () => setAuthError('A alteração de perfil só pode ser feita pelo servidor.'),
  }), [user, loading, authError, login, register, logout, updateProfile, clearSession]);

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth deve ser utilizado dentro de AuthProvider.');
  return context;
}

export default AuthContext;
