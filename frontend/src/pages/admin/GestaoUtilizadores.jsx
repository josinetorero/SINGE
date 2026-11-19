import React, { useState, useEffect } from 'react';
import Icon from '../../components/common/Icon';
import { 
  Card, 
  Button, 
  StatCard, 
  StatusBadge, 
  Pagination, 
  EmptyState, 
  Modal, 
  ConfirmModal, 
  Field, 
  inputCls 
} from '../../components/common/CommonComponents';
import { useToast } from '../../contexts/ToastContext';
import { PERFIS, validarUtilizador } from '../../validation/utilizador';
import { utilizadoresService } from '../../services/utilizadoresService';
import { NetworkError, ValidationError } from '../../services/api';
import { coordenadorService } from '../../services/coordenadorService';

const PERFIL_COLORS = {
  Operador:      'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200/70 dark:border-blue-800/60',
  Coordenador:   'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border-indigo-200/70 dark:border-indigo-800/60',
  Agente:        'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200/70 dark:border-amber-800/60',
  Administrador: 'bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200/70 dark:border-purple-800/60',
};

export function GestaoUtilizadores() {
  const toast = useToast();
  const [utilizadores, setUtilizadores] = useState([]);
  const [equipas, setEquipas] = useState([]);
  const [loadError, setLoadError] = useState('');
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [perfil, setPerfil] = useState('');
  const [estado, setEstado] = useState('');
  const [pg, setPg] = useState(1);
  const [modal, setModal] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const pageSize = 5;

  const [formNome, setFormNome] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPerfil, setFormPerfil] = useState(PERFIS[1]);
  const [formEstado, setFormEstado] = useState('Activo');
  const [formPassword, setFormPassword] = useState('');
  const [formEquipaId, setFormEquipaId] = useState('');

  useEffect(() => {
    if (modal) {
      setFieldErrors({});
      if (modal.mode === 'edit' && modal.data) {
        setFormNome(modal.data.nome || '');
        setFormEmail(modal.data.email || '');
        setFormPerfil(modal.data.perfil || PERFIS[1]);
        setFormEstado(modal.data.estado || 'Activo');
        setFormPassword('');
        setFormEquipaId(modal.data.equipa_id ? String(modal.data.equipa_id) : '');
      } else {
        setFormNome('');
        setFormEmail('');
        setFormPerfil(PERFIS[1]);
        setFormEstado('Activo');
        setFormPassword('');
        setFormEquipaId('');
      }
    } else {
      setFormPassword('');
    }
  }, [modal]);

  useEffect(() => {
    let isMounted = true;
    Promise.all([utilizadoresService.listar(), coordenadorService.teams()])
      .then(([users, teams]) => {
        if (isMounted) {
          setUtilizadores(users);
          setEquipas(teams);
          setLoadError('');
        }
      })
      .catch(error => { if (isMounted) setLoadError(error.message || 'Não foi possível carregar os utilizadores.'); })
      .finally(() => { if (isMounted) setLoading(false); });
    return () => { isMounted = false; };
  }, []);

  const filtered = utilizadores.filter(u =>
    (!q || (u.nome && u.nome.toLowerCase().includes(q.toLowerCase())) || 
           (u.email && u.email.toLowerCase().includes(q.toLowerCase()))) &&
    (!perfil || u.perfil === perfil) && 
    (!estado || u.estado === estado)
  );
  const slice = filtered.slice((pg - 1) * pageSize, pg * pageSize);
  const hasFilters = Boolean(q || perfil || estado);
  const clearFilters = () => { setQ(''); setPerfil(''); setEstado(''); setPg(1); };

  const handleSalvar = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (isSubmitting) return;

    const isEdit = modal?.mode === 'edit';
    const payloadValidacao = {
      nome: formNome,
      email: formEmail,
      perfil: formPerfil,
      password: formPassword,
      emailAtual: isEdit ? modal.data?.email : null,
    };

    const errors = validarUtilizador(payloadValidacao, utilizadores, isEdit);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }
    if (formPerfil === 'Agente' && !formEquipaId) {
      setFieldErrors({ equipa_id: 'Associe o Agente a uma equipa operacional.' });
      return;
    }

    setIsSubmitting(true);
    setFieldErrors({});

    try {
      if (isEdit) {
        const dadosUpdate = {
          nome: formNome.trim(),
          email: formEmail.trim(),
          perfil: formPerfil,
          estado: formEstado,
          equipa_id: formPerfil === 'Agente' ? Number(formEquipaId) : null,
        };
        const updated = await utilizadoresService.atualizar(modal.data.id, dadosUpdate);
        setUtilizadores(prev => prev.map(u => u.id === modal.data.id ? { ...u, ...updated } : u));
        toast.success('Utilizador actualizado.');
      } else {
        const dadosCreate = {
          nome: formNome.trim(),
          email: formEmail.trim(),
          perfil: formPerfil,
          estado: formEstado,
          equipa_id: formPerfil === 'Agente' ? Number(formEquipaId) : null,
          password: formPassword,
        };
        const created = await utilizadoresService.criar(dadosCreate);
        setUtilizadores(prev => [created, ...prev]);
        toast.success('Utilizador criado com sucesso.');
      }

      setFormPassword('');
      setModal(null);
    } catch (err) {
      if (err instanceof ValidationError) {
        setFieldErrors(err.errors);
        toast.error(err.message || 'Verifique os dados assinalados.');
      } else if (err instanceof NetworkError || err.isNetworkError) {
        toast.error('Sem ligação. Os seus dados foram mantidos.');
      } else {
        toast.error(err.message || 'Erro ao processar utilizador.');
      }
    } finally {
      setIsSubmitting(false);
      setFormPassword('');
    }
  };

  const handleDesativar = async () => {
    if (!confirm || isSubmitting) return;
    setIsSubmitting(true);

    try {
      const res = await utilizadoresService.desativar(confirm.id);
      setUtilizadores(prev => prev.map(u => {
        if (u.id === confirm.id) {
          return { ...u, estado: 'Inactivo', ...(res || {}) };
        }
        return u;
      }));
      toast.success('Utilizador desactivado com sucesso.');
      setConfirm(null);
    } catch (err) {
      if (err instanceof NetworkError || err.isNetworkError) {
        toast.error('Sem ligação. Não foi possível desactivar.');
      } else toast.error(err.message || 'Não foi possível desactivar o utilizador.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const activeCount = utilizadores.filter(u => u.estado === 'Activo').length;
  const inactiveCount = utilizadores.filter(u => u.estado === 'Inactivo').length;

  return (
    <div className="space-y-5">

      {/* ─── Cabeçalho ─────────────────────────────────────────── */}
      <header className="relative overflow-hidden rounded-2xl border border-bd dark:border-dborder bg-gradient-to-br from-blue-50/70 via-white to-indigo-50/40 dark:from-slate-900 dark:via-slate-900/80 dark:to-blue-950/30 p-5 shadow-sm">
        <div className="pointer-events-none absolute -top-24 -right-24 w-72 h-72 rounded-full bg-blue-400/10 dark:bg-blue-500/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 left-1/3 w-56 h-56 rounded-full bg-indigo-400/10 dark:bg-indigo-500/10 blur-3xl" />

        <div className="relative flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 text-[10px] px-2.5 py-1 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 font-semibold uppercase tracking-wider border border-blue-200/60 dark:border-blue-800/50">
                <Icon name="Users" size={11} />
                Controlo de Acessos RBAC
              </span>
              {!loading && (
                <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 text-[10px] font-semibold border border-emerald-200/60 dark:border-emerald-800/50">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  {activeCount} contas activas
                </span>
              )}
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-ink dark:text-dink">Gestão de Utilizadores</h2>
            <p className="mt-1 text-sm text-muted dark:text-dmuted max-w-2xl">
              Controlo de acessos, contas e atribuição de perfis RBAC.
            </p>
          </div>
          <button
            onClick={() => setModal({ mode: 'create' })}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-blue-800 hover:shadow-md active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
          >
            <Icon name="UserPlus" size={15} />
            Adicionar Utilizador
          </button>
        </div>
      </header>

      {/* ─── KPIs ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-3">
        <div data-testid="users-total">
          <StatCard icon="Users" label="Total" value={utilizadores.length} hint="Contas registadas no sistema" tone="brand" />
        </div>
        <StatCard icon="UserCheck" label="Activos" value={activeCount} hint="Acesso válido ao SINGE" tone="green" />
        <StatCard icon="UserX" label="Inactivos" value={inactiveCount} hint="Acesso revogado" tone="red" />
      </div>

      {/* ─── Erro ──────────────────────────────────────────────── */}
      {loadError && (
        <Card role="alert" className="p-4 border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950/30">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-300 flex items-center justify-center shrink-0">
              <Icon name="AlertOctagon" size={18} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-red-800 dark:text-red-200">Não foi possível carregar utilizadores</p>
              <p className="text-xs text-red-700 dark:text-red-300 mt-1 break-words">{loadError}</p>
            </div>
          </div>
        </Card>
      )}

      {/* ─── Filtros ───────────────────────────────────────────── */}
      <Card className="p-4 md:p-5">
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <h3 className="text-sm font-semibold text-ink dark:text-dink flex items-center gap-2">
            <span className="w-1 h-4 rounded-full bg-gradient-to-b from-blue-500 to-indigo-500" />
            Filtros de Pesquisa
          </h3>
          <div className="flex items-center gap-2 text-xs">
            <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-muted dark:text-dmuted font-medium tabular-nums">
              {filtered.length} de {utilizadores.length} contas
            </span>
            {hasFilters && (
              <button
                onClick={clearFilters}
                className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:underline font-semibold"
              >
                <Icon name="X" size={12} /> Limpar
              </button>
            )}
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-3">
          <div>
            <label className="text-[11px] font-semibold uppercase tracking-wider text-muted dark:text-dmuted mb-1.5 block">
              Pesquisar
            </label>
            <div className="relative">
              <Icon name="Search" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted dark:text-dmuted pointer-events-none" />
              <input 
                placeholder="Nome ou email..." 
                value={q} 
                onChange={e => { setQ(e.target.value); setPg(1); }} 
                className={inputCls + ' pl-9 pr-9'} 
              />
              {q && (
                <button
                  onClick={() => { setQ(''); setPg(1); }}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full flex items-center justify-center text-muted dark:text-dmuted hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                  aria-label="Limpar pesquisa"
                >
                  <Icon name="X" size={12} />
                </button>
              )}
            </div>
          </div>
          <div>
            <label className="text-[11px] font-semibold uppercase tracking-wider text-muted dark:text-dmuted mb-1.5 block">
              Perfil RBAC
            </label>
            <select value={perfil} onChange={e => { setPerfil(e.target.value); setPg(1); }} className={inputCls}>
              <option value="">Todos os perfis</option>
              {PERFIS.map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-[11px] font-semibold uppercase tracking-wider text-muted dark:text-dmuted mb-1.5 block">
              Estado
            </label>
            <select value={estado} onChange={e => { setEstado(e.target.value); setPg(1); }} className={inputCls}>
              <option value="">Todos os estados</option>
              <option value="Activo">Activo</option>
              <option value="Inactivo">Inactivo</option>
            </select>
          </div>
        </div>
      </Card>

      {/* ─── Tabela ────────────────────────────────────────────── */}
      <Card className="overflow-hidden">
        {loading ? (
          <div role="status" className="p-5">
            <div className="animate-pulse space-y-3">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700" />
                  <div className="h-3 flex-1 rounded bg-slate-200 dark:bg-slate-700" />
                  <div className="h-3 w-24 rounded bg-slate-100 dark:bg-slate-800" />
                  <div className="h-5 w-20 rounded-full bg-slate-100 dark:bg-slate-800" />
                </div>
              ))}
            </div>
            <span className="sr-only">A carregar utilizadores…</span>
          </div>
        ) : slice.length === 0 ? (
          <div className="py-10 px-4">
            <EmptyState icon="UserX" title="Nenhum utilizador encontrado" />
            {hasFilters && (
              <div className="text-center mt-2">
                <button
                  onClick={clearFilters}
                  className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Limpar filtros e ver todos os utilizadores
                </button>
              </div>
            )}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[800px]">
                <thead className="bg-light dark:bg-dsidebar/50 text-[11px] uppercase tracking-wider text-muted dark:text-dmuted">
                  <tr>
                    {['Utilizador', 'Email', 'Perfil', 'Estado', 'Registo', ''].map(h => (
                      <th key={h} className="text-left px-4 py-3 font-semibold whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-bd dark:divide-dborder">
                  {slice.map(u => {
                    const initials = (u.nome || '?').split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
                    const perfilCls = PERFIL_COLORS[u.perfil] || 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700';
                    return (
                      <tr 
                        key={u.id} 
                        data-testid="user-row" 
                        data-email={u.email}
                        className="hover:bg-light dark:hover:bg-dsidebar/30 transition-colors"
                      >
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex items-center gap-2.5">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-[11px] font-bold shrink-0 shadow-sm ${
                              u.estado === 'Inactivo' 
                                ? 'bg-gradient-to-br from-slate-400 to-slate-500' 
                                : 'bg-gradient-to-br from-blue-500 to-indigo-500'
                            }`}>
                              {initials}
                            </div>
                            <div className="min-w-0">
                              <p className="font-medium text-ink dark:text-dink truncate">{u.nome}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-muted dark:text-dmuted truncate max-w-[220px]">{u.email}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full border font-semibold ${perfilCls}`}>
                            <Icon name="ShieldCheck" size={10} />
                            {u.perfil}
                          </span>
                        </td>
                        <td className="px-4 py-3"><StatusBadge s={u.estado} /></td>
                        <td className="px-4 py-3 text-xs text-muted dark:text-dmuted whitespace-nowrap tabular-nums">{u.registo}</td>
                        <td className="px-4 py-3 text-right whitespace-nowrap">
                          <div className="inline-flex items-center gap-1">
                            <button 
                              onClick={() => setModal({ mode: 'edit', data: u })} 
                              className="text-blue-600 dark:text-blue-400 p-1.5 rounded-md hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors"
                              title="Editar"
                              aria-label={`Editar ${u.nome}`}
                            >
                              <Icon name="Edit" size={16} />
                            </button>
                            {u.estado !== 'Inactivo' && (
                              <button 
                                data-testid={`user-deactivate-${u.email}`}
                                onClick={() => setConfirm(u)} 
                                className="text-red-600 dark:text-red-400 p-1.5 rounded-md hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                                title="Desactivar"
                                aria-label={`Desactivar ${u.nome}`}
                              >
                                <Icon name="Trash2" size={16} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <Pagination total={filtered.length} page={pg} pageSize={pageSize} onChange={setPg} />
          </>
        )}
      </Card>

      {/* ─── Modal Criar/Editar ────────────────────────────────── */}
      <Modal 
        open={!!modal} 
        onClose={() => { if (!isSubmitting) setModal(null); }} 
        title={modal?.mode === 'edit' ? 'Editar Utilizador' : 'Adicionar Utilizador'}
        footer={
          <>
            <Button variant="secondary" onClick={() => setModal(null)} disabled={isSubmitting}>Cancelar</Button>
            <Button 
              icon="Save" 
              id="user-submit"
              data-testid="user-submit"
              onClick={handleSalvar} 
              disabled={isSubmitting}
            >
              {isSubmitting ? 'A guardar...' : modal?.mode === 'edit' ? 'Guardar Alterações' : 'Criar Utilizador'}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          {/* Cabeçalho contextual do formulário */}
          <div className={`flex items-center gap-3 p-3 rounded-xl border ${
            modal?.mode === 'edit'
              ? 'bg-blue-50 border-blue-200 dark:bg-blue-950/30 dark:border-blue-900/50'
              : 'bg-emerald-50 border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-900/50'
          }`}>
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
              modal?.mode === 'edit'
                ? 'bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-300'
                : 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-300'
            }`}>
              <Icon name={modal?.mode === 'edit' ? 'Edit' : 'UserPlus'} size={18} />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-ink dark:text-dink">
                {modal?.mode === 'edit' ? 'Edição de conta existente' : 'Nova conta de utilizador'}
              </p>
              <p className="text-[11px] text-muted dark:text-dmuted">
                {modal?.mode === 'edit' 
                  ? 'Alterações aplicam-se imediatamente após guardar.' 
                  : 'A palavra-passe será exigida no primeiro acesso.'}
              </p>
            </div>
          </div>

          <Field 
            label="Nome completo" 
            required 
            htmlFor="user-nome"
            error={fieldErrors.nome}
            errorTestId="nome-error"
          >
            <input 
              id="user-nome"
              data-testid="user-nome"
              value={formNome}
              onChange={e => {
                setFormNome(e.target.value);
                if (fieldErrors.nome) setFieldErrors(prev => ({ ...prev, nome: null }));
              }}
              aria-invalid={Boolean(fieldErrors.nome)}
              className={inputCls} 
              placeholder="Nome do utilizador" 
            />
          </Field>

          <Field 
            label="Email institucional" 
            required 
            htmlFor="user-email"
            error={fieldErrors.email}
            errorTestId="email-error"
          >
            <input 
              type="email" 
              id="user-email"
              data-testid="user-email"
              value={formEmail}
              onChange={e => {
                setFormEmail(e.target.value);
                if (fieldErrors.email) setFieldErrors(prev => ({ ...prev, email: null }));
              }}
              aria-invalid={Boolean(fieldErrors.email)}
              className={inputCls} 
              placeholder="utilizador@singe.gov.mz" 
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field 
              label="Perfil RBAC" 
              required
              htmlFor="user-perfil"
              error={fieldErrors.perfil}
              errorTestId="perfil-error"
            >
              <select 
                id="user-perfil"
                data-testid="user-perfil"
                value={formPerfil}
                onChange={e => {
                  setFormPerfil(e.target.value);
                  if (fieldErrors.perfil) setFieldErrors(prev => ({ ...prev, perfil: null }));
                }}
                className={inputCls}
              >
                {PERFIS.map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </Field>

            <Field label="Estado" htmlFor="user-estado">
              <select 
                id="user-estado"
                value={formEstado}
                onChange={e => setFormEstado(e.target.value)}
                className={inputCls}
              >
                <option value="Activo">Activo</option>
                <option value="Inactivo">Inactivo</option>
              </select>
            </Field>
          </div>

          {formPerfil === 'Agente' && (
            <Field label="Equipa operacional" required htmlFor="user-equipa" error={fieldErrors.equipa_id}>
              <select id="user-equipa" className={inputCls} value={formEquipaId} onChange={event => setFormEquipaId(event.target.value)}>
                <option value="">Seleccionar equipa</option>
                {equipas.map(team => <option key={team.id} value={team.id}>{team.nome}</option>)}
              </select>
            </Field>
          )}

          {modal?.mode === 'create' && (
            <Field 
              label="Palavra-passe temporária" 
              required 
              htmlFor="user-password"
              hint="Mínimo 8 caracteres, com letra e número."
              error={fieldErrors.password}
              errorTestId="password-error"
            >
              <input 
                type="password" 
                id="user-password"
                data-testid="user-password"
                value={formPassword}
                onChange={e => {
                  setFormPassword(e.target.value);
                  if (fieldErrors.password) setFieldErrors(prev => ({ ...prev, password: null }));
                }}
                aria-invalid={Boolean(fieldErrors.password)}
                className={inputCls} 
                placeholder="Introduza a palavra-passe" 
                autoComplete="new-password"
              />
            </Field>
          )}
        </div>
      </Modal>

      <ConfirmModal 
        open={!!confirm} 
        onClose={() => setConfirm(null)} 
        onConfirm={handleDesativar} 
        title="Desactivar utilizador?" 
        description={`${confirm?.nome} perderá acesso imediato às funcionalidades do SINGE. A conta passará ao estado Inactivo.`} 
        confirmLabel="Desactivar" 
      />
    </div>
  );
}

export default GestaoUtilizadores;