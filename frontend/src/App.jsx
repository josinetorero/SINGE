import React, { useState } from 'react';
import { ThemeProvider } from './contexts/ThemeContext';
import { ToastProvider } from './contexts/ToastContext';

// Layouts
import { InstitutionalLayout } from './components/layout/InstitutionalLayout';
import { CitizenLayout } from './components/layout/CitizenLayout';

// Public Pages
import { Login } from './pages/public/Login';

// Common Components
import { EmptyState } from './components/common/CommonComponents';

// Operador Pages
import { OperadorDashboard } from './pages/operador/OperadorDashboard';
import { OperadorOcorrencias } from './pages/operador/OperadorOcorrencias';
import { RegistarOcorrencia } from './pages/operador/RegistarOcorrencia';
import { DetalheOcorrencia } from './pages/operador/DetalheOcorrencia';

// Coordenador Pages
import { CoordenadorDashboard } from './pages/coordenador/CoordenadorDashboard';
import { Prioridades } from './pages/coordenador/Prioridades';
import { Equipas } from './pages/coordenador/Equipas';
import { DetalheEquipa } from './pages/coordenador/DetalheEquipa';
import { Missoes } from './pages/coordenador/Missoes';
import { DetalheMissaoCoord } from './pages/coordenador/DetalheMissaoCoord';

// Agente Pages
import { AgenteDashboard } from './pages/agente/AgenteDashboard';
import { MinhasMissoes } from './pages/agente/MinhasMissoes';
import { DetalheMissao } from './pages/agente/DetalheMissao';
import { ActualizarEstado } from './pages/agente/ActualizarEstado';

// Administrador Pages
import { GestaoUtilizadores } from './pages/admin/GestaoUtilizadores';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { ParametrosSistema } from './pages/admin/ParametrosSistema';
import { AuditoriaLogs } from './pages/admin/AuditoriaLogs';

// Shared Pages
import { Relatorios } from './pages/shared/Relatorios';
import { Notificacoes } from './pages/shared/Notificacoes';
import { HistoricoSistema } from './pages/shared/HistoricoSistema';
import { Definicoes } from './pages/shared/Definicoes';

// Cidadão Pages
import { CidadaoDashboard } from './pages/cidadao/CidadaoDashboard';
import { CidadaoComunicar } from './pages/cidadao/CidadaoComunicar';
import { CidadaoMinhasOcorrencias } from './pages/cidadao/CidadaoMinhasOcorrencias';
import { CidadaoDetalheOcorrencia } from './pages/cidadao/CidadaoDetalheOcorrencia';
import { CidadaoAlertas } from './pages/cidadao/CidadaoAlertas';
import { CidadaoDetalheAlerta } from './pages/cidadao/CidadaoDetalheAlerta';
import { CidadaoInformacoes } from './pages/cidadao/CidadaoInformacoes';
import { CidadaoDetalheInfo } from './pages/cidadao/CidadaoDetalheInfo';
import { CidadaoPerfil } from './pages/cidadao/CidadaoPerfil';
import { CidadaoNotificacoes } from './pages/cidadao/CidadaoNotificacoes';

// Mock Data
import { OCORRENCIAS, USERS } from './data/mockData';
import { ocorrenciasService } from './services/ocorrenciasService';

function MainApp() {
  const [role, setRole] = useState(null);
  const [page, setPage] = useState('dashboard');
  const [selOc, setSelOc] = useState(null);
  const [selMs, setSelMs] = useState(null);
  const [selEq, setSelEq] = useState(null);
  const [selAlerta, setSelAlerta] = useState(null);
  const [selInfo, setSelInfo] = useState(null);
    const [ocorrencias, setOcorrencias] = useState(OCORRENCIAS);

  React.useEffect(() => {
    let isMounted = true;
    ocorrenciasService.listar()
      .then(res => {
        if (isMounted && Array.isArray(res) && res.length > 0) {
          setOcorrencias(res);
        }
      })
      .catch(() => {});
    return () => { isMounted = false; };
  }, []);

  const handleOcorrenciaCriada = (nova) => {
    if (nova) {
      setOcorrencias(prev => [nova, ...prev]);
    }
  };

  // [RF03] Guarda de rotas mínima por perfil RBAC
  const ALLOWED_PAGES_BY_ROLE = {
    cidadao: ['dashboard', 'comunicar', 'minhas-ocorrencias', 'detalhe-cidadao', 'alertas', 'detalhe-alerta', 'informacoes', 'detalhe-info', 'notificacoes', 'perfil'],
    operador: ['dashboard', 'ocorrencias', 'registar', 'detalhe-oc', 'notificacoes', 'relatorios', 'definicoes'],
    coordenador: ['dashboard', 'ocorrencias', 'detalhe-oc', 'prioridades', 'equipas', 'detalhe-eq', 'missoes', 'detalhe-ms-coord', 'relatorios', 'historico', 'notificacoes', 'definicoes'],
    agente: ['dashboard', 'missoes', 'detalhe-ms', 'atualizar', 'notificacoes', 'definicoes'],
    administrador: ['dashboard', 'utilizadores', 'parametros', 'auditoria', 'definicoes'],
  };

  const handleLogin = (r) => {
    setRole(r);
    setPage('dashboard');
  };

  const handleLogout = () => {
    setRole(null);
    setPage('dashboard');
    setSelOc(null);
    setSelMs(null);
    setSelEq(null);
    setSelAlerta(null);
    setSelInfo(null);
  };

  // Se não houver perfil selecionado, exibe ecrã de Login
  if (!role) {
    return <Login onLogin={handleLogin} />;
  }

  // CIDADÃO — Layout Superior (Top Nav)
  if (role === 'cidadao') {
    const renderCitizen = () => {
    // [RF03] Guarda de rotas para cidadão
    if (!ALLOWED_PAGES_BY_ROLE.cidadao.includes(page)) {
      return <EmptyState icon="Lock" title="Acesso não autorizado" description="O perfil Cidadão não tem autorização para aceder a esta funcionalidade." />;
    }
      switch (page) {
        case 'dashboard':
          return <CidadaoDashboard setPage={setPage} setSelectedOc={setSelOc} />;
        case 'comunicar':
          return <CidadaoComunicar setPage={setPage} onOcorrenciaCriada={handleOcorrenciaCriada} />;
        case 'minhas-ocorrencias':
          return <CidadaoMinhasOcorrencias setPage={setPage} setSelectedOc={setSelOc} ocorrencias={ocorrencias} />;
        case 'detalhe-cidadao':
          return <CidadaoDetalheOcorrencia o={selOc} setPage={setPage} />;
        case 'alertas':
          return <CidadaoAlertas setPage={setPage} setSelectedAlerta={setSelAlerta} />;
        case 'detalhe-alerta':
          return <CidadaoDetalheAlerta a={selAlerta} setPage={setPage} />;
        case 'informacoes':
          return <CidadaoInformacoes setPage={setPage} setSelectedInfo={setSelInfo} />;
        case 'detalhe-info':
          return <CidadaoDetalheInfo info={selInfo} setPage={setPage} />;
        case 'notificacoes':
          return <CidadaoNotificacoes setPage={setPage} />;
        case 'perfil':
          return <CidadaoPerfil user={USERS.cidadao} />;
        default:
          return <EmptyState icon="Construction" title="Em construção" />;
      }
    };

    return (
      <CitizenLayout user={USERS.cidadao} page={page} setPage={setPage} onLogout={handleLogout}>
        {renderCitizen()}
      </CitizenLayout>
    );
  }

  // INSTITUCIONAL — Layout Lateral (Sidebar Navy)
  const renderInstitutional = () => {
    // [RF03] Guarda de rotas institucionais
    if (role && ALLOWED_PAGES_BY_ROLE[role] && !ALLOWED_PAGES_BY_ROLE[role].includes(page)) {
      return <EmptyState icon="Lock" title="Acesso não autorizado" description="O seu perfil não tem autorização para aceder a esta funcionalidade." />;
    }
    if (role === 'operador') {
      switch (page) {
        case 'dashboard':
          return <OperadorDashboard setPage={setPage} setSelected={setSelOc} ocorrencias={ocorrencias} />;
        case 'ocorrencias':
          return <OperadorOcorrencias setPage={setPage} setSelected={setSelOc} ocorrencias={ocorrencias} />;
        case 'registar':
          return <RegistarOcorrencia setPage={setPage} onOcorrenciaCriada={handleOcorrenciaCriada} />;
        case 'detalhe-oc':
          return <DetalheOcorrencia o={selOc} setPage={setPage} role={role} />;
        case 'notificacoes':
          return <Notificacoes />;
        case 'relatorios':
          return <Relatorios />;
        case 'definicoes':
          return <Definicoes user={USERS[role]} role={role} />;
        default:
          return <EmptyState icon="Construction" title="Em construção" />;
      }
    }

    if (role === 'coordenador') {
      switch (page) {
        case 'dashboard':
          return <CoordenadorDashboard setPage={setPage} ocorrencias={ocorrencias} />;
        case 'ocorrencias':
          return <OperadorOcorrencias setPage={setPage} setSelected={setSelOc} ocorrencias={ocorrencias} />;
        case 'detalhe-oc':
          return <DetalheOcorrencia o={selOc} setPage={setPage} role={role} />;
        case 'prioridades':
          return <Prioridades ocorrencias={ocorrencias} setPage={setPage} setSelected={setSelOc} />;
        case 'equipas':
          return <Equipas setPage={setPage} setSelectedEquipa={setSelEq} />;
        case 'detalhe-eq':
          return <DetalheEquipa e={selEq} setPage={setPage} />;
        case 'missoes':
          return <Missoes setPage={setPage} setSelectedMissao={setSelMs} />;
        case 'detalhe-ms-coord':
          return <DetalheMissaoCoord m={selMs} setPage={setPage} />;
        case 'relatorios':
          return <Relatorios />;
        case 'historico':
          return <HistoricoSistema />;
        case 'notificacoes':
          return <Notificacoes />;
        case 'definicoes':
          return <Definicoes user={USERS[role]} role={role} />;
        default:
          return <EmptyState icon="Construction" title="Em construção" />;
      }
    }

    if (role === 'agente') {
      switch (page) {
        case 'dashboard':
          return <AgenteDashboard setPage={setPage} setSelectedMissao={setSelMs} />;
        case 'missoes':
          return <MinhasMissoes setPage={setPage} setSelectedMissao={setSelMs} />;
        case 'detalhe-ms':
          return <DetalheMissao m={selMs} setPage={setPage} />;
        case 'atualizar':
          return <ActualizarEstado m={selMs} setPage={setPage} />;
        case 'notificacoes':
          return <Notificacoes />;
        case 'definicoes':
          return <Definicoes user={USERS[role]} role={role} />;
        default:
          return <EmptyState icon="Construction" title="Em construção" />;
      }
    }

        if (role === 'administrador') {
      switch (page) {
        case 'dashboard':
          return <AdminDashboard setPage={setPage} />;
        case 'utilizadores':
          return <GestaoUtilizadores />;
        case 'parametros':
          return <ParametrosSistema />;
        case 'auditoria':
          return <AuditoriaLogs />;
        case 'definicoes':
          return <Definicoes user={USERS[role]} role={role} />;
        default:
          return <EmptyState icon="Construction" title="Em construção" />;
      }
    }

    return null;
  };

  return (
    <InstitutionalLayout
      role={role}
      user={USERS[role]}
      page={page}
      setPage={setPage}
      onLogout={handleLogout}
    >
      {renderInstitutional()}
    </InstitutionalLayout>
  );
}

export function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <MainApp />
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App;
