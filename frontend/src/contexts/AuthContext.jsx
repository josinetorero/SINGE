import React, { createContext, useContext, useState, useEffect } from 'react';

// Perfis suportados pelo SINGE conforme levantamento de requisitos (RBAC)
export const ROLES = {
  CIDADAO: 'CIDADAO',
  OPERADOR: 'OPERADOR',
  COORDENADOR: 'COORDENADOR',
  AGENTE: 'AGENTE',
  ADMIN: 'ADMIN',
};

// Utilizadores de demonstração pré-configurados com base no estudo de caso INGD/CENOE
export const DEMO_USERS = {
  CIDADAO: {
    id: 'usr-cid-001',
    name: 'Amélia Mondlane',
    email: 'amelia.mondlane@gmail.com',
    role: ROLES.CIDADAO,
    roleTitle: 'Cidadão',
    department: 'Munícipe de Maputo',
    location: 'Bairro Maxaquene A, Maputo',
    phone: '+258 84 123 4567',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  },
  OPERADOR: {
    id: 'usr-op-002',
    name: 'Carlos Tembe',
    email: 'carlos.tembe@cenoe.gov.mz',
    role: ROLES.OPERADOR,
    roleTitle: 'Operador de Emergência',
    department: 'CENOE - Sala de Operações',
    location: 'Maputo Central',
    phone: '+258 82 234 5678',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  },
  COORDENADOR: {
    id: 'usr-coord-003',
    name: 'Dra. Fátima Mucavele',
    email: 'fatima.mucavele@ingd.gov.mz',
    role: ROLES.COORDENADOR,
    roleTitle: 'Coordenadora de Operações',
    department: 'Direcção Geral de Resposta - INGD',
    location: 'Sede INGD, Maputo',
    phone: '+258 84 345 6789',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
  },
  AGENTE: {
    id: 'usr-agt-004',
    name: 'Sargento Mateus Sitoe',
    email: 'mateus.sitoe@bombeiros.gov.mz',
    role: ROLES.AGENTE,
    roleTitle: 'Chefe de Equipa de Resposta',
    department: 'Corpo de Salvação Pública - Equipa Alfa',
    location: 'Posto de Comando Operacional B',
    phone: '+258 87 456 7890',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
  },
  ADMIN: {
    id: 'usr-adm-005',
    name: 'Yúmin Bay',
    email: 'yumin.bay@singe.gov.mz',
    role: ROLES.ADMIN,
    roleTitle: 'Administrador do Sistema',
    department: 'Tecnologias de Informação e Gestão de Risco',
    location: 'Centro de Dados Nacional',
    phone: '+258 84 999 8888',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
  },
};

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // Inicializa o utilizador a partir da localStorage ou padrão Operador para facilitar a avaliação
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('singe_user');
    if (savedUser) {
      try {
        return JSON.parse(savedUser);
      } catch (e) {
        console.error('Erro ao ler utilizador do localStorage', e);
      }
    }
    // Por padrão no carregamento inicial, começamos com o Operador de Emergência (ator central do MVP)
    return DEMO_USERS.OPERADOR;
  });

  const [loading, setLoading] = useState(false);

  // Persistir o utilizador atual sempre que mudar
  useEffect(() => {
    if (user) {
      localStorage.setItem('singe_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('singe_user');
    }
  }, [user]);

  // Função para simular login direto com um dos 5 perfis
  const simulateLogin = (roleKey) => {
    setLoading(true);
    setTimeout(() => {
      const selectedUser = DEMO_USERS[roleKey] || DEMO_USERS.OPERADOR;
      setUser(selectedUser);
      setLoading(false);
    }, 250);
  };

  // Função para login com email/senha convencional
  const login = (email, password) => {
    setLoading(true);
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Encontra o perfil correspondente pelo email ou assume operador
        const matched = Object.values(DEMO_USERS).find(u => u.email.toLowerCase() === email.toLowerCase());
        if (matched) {
          setUser(matched);
          setLoading(false);
          resolve(matched);
        } else if (email && password) {
          // Cria um utilizador temporário se não for um demo
          const newUser = {
            id: 'usr-' + Date.now(),
            name: email.split('@')[0],
            email,
            role: ROLES.CIDADAO,
            roleTitle: 'Cidadão',
            department: 'Munícipe',
            location: 'Maputo',
            phone: '+258 84 000 0000',
            avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
          };
          setUser(newUser);
          setLoading(false);
          resolve(newUser);
        } else {
          setLoading(false);
          reject(new Error('Credenciais inválidas.'));
        }
      }, 350);
    });
  };

  // Terminar sessão
  const logout = () => {
    setUser(null);
  };

  // Alternar rapidamente entre perfis (RBAC switch)
  const switchRole = (roleKey) => {
    if (DEMO_USERS[roleKey]) {
      setUser(DEMO_USERS[roleKey]);
    }
  };

  // Verificar se o utilizador possui um dos perfis exigidos
  const hasRole = (allowedRoles) => {
    if (!user) return false;
    if (Array.isArray(allowedRoles)) {
      return allowedRoles.includes(user.role);
    }
    return user.role === allowedRoles;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role || null,
        isAuthenticated: !!user,
        loading,
        login,
        simulateLogin,
        switchRole,
        logout,
        hasRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};
