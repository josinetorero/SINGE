import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth, ROLES } from '../contexts/AuthContext';

/**
 * Componente para proteção de rotas com base em Autenticação e Perfis (RBAC)
 */
export const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-light dark:bg-dbg">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-brand border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">A carregar permissões...</p>
        </div>
      </div>
    );
  }

  // Redireciona para o login se não estiver autenticado
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Verifica se o perfil atual tem autorização para esta rota
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redireciona para o dashboard padrão do perfil do utilizador
    const defaultRedirect = {
      [ROLES.CIDADAO]: '/cidadao/dashboard',
      [ROLES.OPERADOR]: '/operador/dashboard',
      [ROLES.COORDENADOR]: '/operador/dashboard',
      [ROLES.AGENTE]: '/agente/missoes',
      [ROLES.ADMIN]: '/operador/utilizadores',
    }[user.role] || '/login';

    return <Navigate to={defaultRedirect} replace />;
  }

  return children;
};

export default ProtectedRoute;
