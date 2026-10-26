import React, { useState } from 'react';
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

export function GestaoUtilizadores() {
  const toast = useToast();
  const [q, setQ] = useState('');
  const [perfil, setPerfil] = useState('');
  const [estado, setEstado] = useState('');
  const [pg, setPg] = useState(1);
  const [modal, setModal] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const pageSize = 5;

  const filtered = UTILIZADORES.filter(u =>
    (!q || u.nome.toLowerCase().includes(q.toLowerCase()) || u.email.toLowerCase().includes(q.toLowerCase())) &&
    (!perfil || u.perfil === perfil) && 
    (!estado || u.estado === estado)
  );
  const slice = filtered.slice((pg - 1) * pageSize, pg * pageSize);

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
        <StatCard icon="Users" label="Total" value={UTILIZADORES.length} tone="brand" />
        <StatCard icon="UserCheck" label="Activos" value={UTILIZADORES.filter(u => u.estado === 'Activo').length} tone="green" />
        <StatCard icon="UserX" label="Inactivos" value={UTILIZADORES.filter(u => u.estado === 'Inactivo').length} tone="red" />
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
            {['Administrador', 'Coordenador', 'Operador', 'Agente'].map(p => (
              <option key={p}>{p}</option>
            ))}
          </select>
          <select value={estado} onChange={e => { setEstado(e.target.value); setPg(1); }} className={inputCls}>
            <option value="">Todos os estados</option>
            <option>Activo</option>
            <option>Inactivo</option>
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
                    <tr key={u.id} className="hover:bg-light dark:hover:bg-dsidebar/30 transition-colors">
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
                        <button 
                          onClick={() => setConfirm(u)} 
                          className="text-red-600 p-1.5 rounded hover:bg-red-50 dark:hover:bg-red-950/40 ml-1 transition-colors"
                          title="Desactivar"
                        >
                          <Icon name="Trash2" size={16} />
                        </button>
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
        onClose={() => setModal(null)} 
        title={modal?.mode === 'edit' ? 'Editar Utilizador' : 'Adicionar Utilizador'}
        footer={
          <>
            <Button variant="secondary" onClick={() => setModal(null)}>Cancelar</Button>
            <Button icon="Save" onClick={() => { setModal(null); toast.success(modal?.mode === 'edit' ? 'Utilizador actualizado.' : 'Utilizador criado.'); }}>
              {modal?.mode === 'edit' ? 'Guardar' : 'Criar'}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Field label="Nome completo" required>
            <input defaultValue={modal?.data?.nome} className={inputCls} placeholder="Nome do utilizador" />
          </Field>
          <Field label="Email institucional" required>
            <input type="email" defaultValue={modal?.data?.email} className={inputCls} placeholder="utilizador@singe.gov.mz" />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Perfil RBAC">
              <select defaultValue={modal?.data?.perfil || 'Operador'} className={inputCls}>
                {['Administrador', 'Coordenador', 'Operador', 'Agente'].map(p => (
                  <option key={p}>{p}</option>
                ))}
              </select>
            </Field>
            <Field label="Estado">
              <select defaultValue={modal?.data?.estado || 'Activo'} className={inputCls}>
                <option>Activo</option>
                <option>Inactivo</option>
              </select>
            </Field>
          </div>
          {modal?.mode === 'create' && (
            <Field label="Palavra-passe temporária" required>
              <input type="password" className={inputCls} defaultValue="Mudar@2025" />
            </Field>
          )}
        </div>
      </Modal>

      <ConfirmModal 
        open={!!confirm} 
        onClose={() => setConfirm(null)} 
        onConfirm={() => toast.success('Utilizador desactivado com sucesso.')} 
        title="Desactivar utilizador?" 
        description={`${confirm?.nome} perderá acesso imediato às funcionalidades do SINGE.`} 
        confirmLabel="Desactivar" 
      />
    </div>
  );
}

export default GestaoUtilizadores;
