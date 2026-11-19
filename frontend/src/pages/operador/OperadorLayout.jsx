import React from 'react';
import { AuthenticatedLayout } from '../../components/layout/AuthenticatedLayout';

const NAVIGATION = [
  { id: 'dashboard',   label: 'Painel de triagem',               icon: 'LayoutDashboard' },
  { id: 'ocorrencias', label: 'Ocorrências',                     icon: 'FileText' },
  { id: 'registar',    label: 'Registar ocorrência',             icon: 'PlusCircle' },
  { id: 'identidade',  label: 'Verificar identidade',            icon: 'ShieldCheck' },
  { id: 'avisos',      label: 'Alertas públicos e notificações', icon: 'Bell' },
  { id: 'perfil',      label: 'Meu perfil',                      icon: 'User' },
];

// Títulos por página — permite títulos mais específicos que o label do menu
const PAGE_TITLES = {
  dashboard:           'Painel de triagem',
  ocorrencias:         'Ocorrências',
  'detalhe-ocorrencia':'Detalhe da ocorrência',
  registar:            'Registar ocorrência',
  identidade:          'Verificar identidade',
  avisos:              'Alertas públicos e notificações',
  perfil:              'Meu perfil',
};

// Mapeia sub-páginas para o item de navegação correspondente
const PAGE_TO_NAV = {
  'detalhe-ocorrencia': 'ocorrencias',
};

export function OperadorLayout({ user, page, setPage, onLogout, children, badges }) {
  const activePage = PAGE_TO_NAV[page] || page;
  const navItem = NAVIGATION.find(item => item.id === activePage);
  const title = PAGE_TITLES[page] || navItem?.label || 'Painel do Operador';

  // Injecta badges (contadores) nos itens de navegação sem alterar a estrutura original
  const navigation = badges
    ? NAVIGATION.map(item =>
        badges[item.id] != null ? { ...item, badge: badges[item.id] } : item
      )
    : NAVIGATION;

  return (
    <AuthenticatedLayout
      user={user}
      onLogout={onLogout}
      navigation={navigation}
      activePage={activePage}
      onNavigate={setPage}
      title={title}
    >
      {children}
    </AuthenticatedLayout>
  );
}

export default OperadorLayout;