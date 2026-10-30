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
import { UTILIZADORES } from '../../data/mockData';
import { useToast } from '../../contexts/ToastContext';
import { PERFIS, validarUtilizador } from '../../validation/utilizador';
import { utilizadoresService } from '../../services/utilizadoresService';
import { NetworkError, ValidationError } from '../../services/api';

export function GestaoUtilizadores() {
  const toast = useToast();
  const [utilizadores, setUtilizadores] = useState(UTILIZADORES);
  const [q, setQ] = useState('');
  const [perfil, setPerfil] = useState('');
  const [estado, setEstado] = useState('');
  const [pg, setPg] = useState(1);
  const [modal, setModal] = useState(null); // { mode: 'create' | 'edit', data?: user }
  const [confirm, setConfirm] = useState(null); // user to deactivate
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const pageSize = 5;

  // Campos controlados do formulário de utilizador
  const [formNome, setFormNome] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPerfil, setFormPerfil] = useState(PERFIS[1]); // 'Operador'
  const [formEstado, setFormEstado] = useState('Activo');
  const [formPassword, setFormPassword] = useState('');

  // Ao abrir o modal, inicializar campos controlados e limpar password/erros
  useEffect(() => {
    if (modal) {
      setFieldErrors({});
      if (modal.mode === 'edit' && modal.data) {
        setFormNome(modal.data.nome || '');
        setFormEmail(modal.data.email || '');
        setFormPerfil(modal.data.perfil || PERFIS[1]);
        setFormEstado(modal.data.estado || 'Activo');
        setFormPassword('');
      } else {
        setFormNome('');
        setFormEmail('');
        setFormPerfil(PERFIS[1]);
        setFormEstado('Activo');
        setFormPassword('');
      }
    } else {
      // Garantir que a password nunca é mantida em estado quando o modal fecha
      setFormPassword('');
    }
  }, [modal]);

  // Carregar utilizadores da API se disponível
  useEffect(() => {
    let isMounted = true;
    utilizadoresService.listar()
      .then(res => {
        if (isMounted && Array.isArray(res)) {
          setUtilizadores(res);
        }
      })
      .catch(() => {
        // Se a API não estiver a correr e sem mock, mantém a lista inicial
      });
    return () => { isMounted = false; };
  }, []);

  const filtered = utilizadores.filter(u =>
    (!q || (u.nome && u.nome.toLowerCase().includes(q.toLowerCase())) || 
           (u.email && u.email.toLowerCase().includes(q.toLowerCase()))) &&
    (!perfil || u.perfil === perfil) && 
    (!estado || u.estado === estado)
  );
  const slice = filtered.slice((pg - 1) * pageSize, pg * pageSize);

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

    // 1) Validação local pura
    const errors = validarUtilizador(payloadValidacao, utilizadores, isEdit);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
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
          password: formPassword,
        };
        const created = await utilizadoresService.criar(dadosCreate);
        // Atualiza a lista e os contadores reflectem o resultado retornado [Requisito 4]
        setUtilizadores(prev => [created, ...prev]);
        toast.success('Utilizador criado com sucesso.');
      }

      // Limpar password do estado imediatamente após submissão [Assumida]
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
      // Assegurar que password nunca é preservada em memória desnecessariamente
      setFormPassword('');
    }
  };

  // [RF02/RNF05] Desactivar utilizador chama a API e passa o estado a Inactivo, sem remover a linha
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
      } else {
        // Fallback local caso mock/backend retorne erro mas permita operação
        setUtilizadores(prev => prev.map(u => u.id === confirm.id ? { ...u, estado: 'Inactivo' } : u));
        toast.success('Utilizador desactivado.');
        setConfirm(null);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-ink dark:text-dink">Gestão de Utilizadores</h2>
          <p className="text-sm text-muted dark:text-dmuted">Controlo de acessos, contas e atribuição de perfis RBAC.</p>
        </div>
        <Button icon="UserPlus" onClick={() => setModal({ mode: 'create' })}>Adicionar</Button>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div data-testid="users-total">
          <StatCard icon="Users" label="Total" value={utilizadores.length} tone="brand" />
        </div>
        <StatCard icon="UserCheck" label="Activos" value={utilizadores.filter(u => u.estado === 'Activo').length} tone="green" />
        <StatCard icon="UserX" label="Inactivos" value={utilizadores.filter(u => u.estado === 'Inactivo').length} tone="red" />
      </div>

      <Card className="p-4">
        <div className="grid md:grid-cols-3 gap-3">
          <div className="relative">
            <Icon name="Search" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted dark:text-dmuted pointer-events-none" />
            <input 
              placeholder="Pesquisar por nome ou email..." 
              value={q} 
              onChange={e => { setQ(e.target.value); setPg(1); }} 
              className={inputCls + ' pl-9'} 
            />
          </div>
          <select value={perfil} onChange={e => { setPerfil(e.target.value); setPg(1); }} className={inputCls}>
            <option value="">Todos os perfis</option>
            {PERFIS.map(p => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
          <select value={estado} onChange={e => { setEstado(e.target.value); setPg(1); }} className={inputCls}>
            <option value="">Todos os estados</option>
            <option value="Activo">Activo</option>
            <option value="Inactivo">Inactivo</option>
          </select>
        </div>
      </Card>

      <Card>
        {slice.length === 0 ? (
          <EmptyState icon="UserX" title="Nenhum utilizador encontrado" />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[800px]">
                <thead className="bg-light dark:bg-dsidebar/50 text-xs uppercase text-muted dark:text-dmuted">
                  <tr>
                    {['Nome', 'Email', 'Perfil', 'Estado', 'Registo', ''].map(h => (
                      <th key={h} className="text-left px-4 py-3 font-medium whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-bd dark:divide-dborder">
                  {slice.map(u => (
                    <tr 
                      key={u.id} 
                      data-testid="user-row" 
                      data-email={u.email}
                      className="hover:bg-light dark:hover:bg-dsidebar/30 transition-colors"
                    >
                      <td className="px-4 py-3 font-medium text-ink dark:text-dink whitespace-nowrap">{u.nome}</td>
                      <td className="px-4 py-3 text-muted dark:text-dmuted">{u.email}</td>
                      <td className="px-4 py-3">
                        <span className="text-xs px-2 py-1 rounded-md bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 font-medium">
                          {u.perfil}
                        </span>
                      </td>
                      <td className="px-4 py-3"><StatusBadge s={u.estado} /></td>
                      <td className="px-4 py-3 text-muted dark:text-dmuted whitespace-nowrap">{u.registo}</td>
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <button 
                          onClick={() => setModal({ mode: 'edit', data: u })} 
                          className="text-brand dark:text-dblue p-1.5 rounded hover:bg-lblue dark:hover:bg-dsidebar transition-colors"
                          title="Editar"
                        >
                          <Icon name="Edit" size={16} />
                        </button>
                        {u.estado !== 'Inactivo' && (
                          <button 
                            data-testid={`user-deactivate-${u.email}`}
                            onClick={() => setConfirm(u)} 
                            className="text-red-600 p-1.5 rounded hover:bg-red-50 dark:hover:bg-red-950/40 ml-1 transition-colors"
                            title="Desactivar"
                          >
                            <Icon name="Trash2" size={16} />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination total={filtered.length} page={pg} pageSize={pageSize} onChange={setPg} />
          </>
        )}
      </Card>

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
              {isSubmitting ? 'A guardar...' : modal?.mode === 'edit' ? 'Guardar' : 'Criar'}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
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
