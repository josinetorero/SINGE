import React from 'react';
import Icon from '../../components/common/Icon';
import { Card, Button, Field, inputCls } from '../../components/common/CommonComponents';
import { useTheme } from '../../contexts/ThemeContext';
import { useToast } from '../../contexts/ToastContext';
import { ROLE_LABEL } from '../../data/mockData';

export function Definicoes({ user, role }) {
  const { theme, toggleTheme } = useTheme();
  const toast = useToast();

  return (
    <div className="space-y-4 max-w-3xl">
      <div>
        <h2 className="text-xl font-bold text-ink dark:text-dink">Definições</h2>
        <p className="text-sm text-muted dark:text-dmuted">Configurações de perfil, preferências de interface e notificações.</p>
      </div>

      {/* Perfil */}
      <Card className="p-6">
        <h3 className="font-semibold text-ink dark:text-dink mb-4 flex items-center gap-2">
          <Icon name="User" size={18} />Perfil do Utilizador
        </h3>
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 rounded-full bg-navy text-white flex items-center justify-center text-xl font-semibold">
            {user.nome.split(' ').map(n => n[0]).slice(0, 2).join('')}
          </div>
          <div>
            <p className="font-semibold text-ink dark:text-dink text-base">{user.nome}</p>
            <p className="text-sm text-muted dark:text-dmuted">{ROLE_LABEL[role]}</p>
          </div>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <Field label="Nome completo">
            <input defaultValue={user.nome} className={inputCls} />
          </Field>
          <Field label="Email institucional">
            <input defaultValue={user.email} className={inputCls} />
          </Field>
        </div>
        <div className="mt-4 pt-4 border-t border-bd dark:border-dborder">
          <p className="text-sm font-medium text-ink dark:text-dink mb-2">Alterar palavra-passe</p>
          <div className="grid md:grid-cols-2 gap-4">
            <Field label="Palavra-passe actual"><input type="password" className={inputCls} /></Field>
            <Field label="Nova palavra-passe"><input type="password" className={inputCls} /></Field>
          </div>
        </div>
        <div className="mt-4 flex justify-end">
          <Button icon="Save" onClick={() => toast.success('Perfil actualizado.')}>Guardar</Button>
        </div>
      </Card>

      {/* Aparência */}
      <Card className="p-6">
        <h3 className="font-semibold text-ink dark:text-dink mb-4 flex items-center gap-2">
          <Icon name="Palette" size={18} />Aparência da Interface
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {[
            ['light', 'Modo Claro', 'Sun'],
            ['dark', 'Modo Escuro', 'Moon']
          ].map(([t, l, ic]) => (
            <button 
              key={t} 
              type="button"
              onClick={() => { if (theme !== t) toggleTheme(); }} 
              className={`p-4 rounded-lg border-2 flex items-center gap-3 transition-all ${
                theme === t 
                  ? 'border-brand bg-lblue/40 dark:bg-dblue/10' 
                  : 'border-bd dark:border-dborder hover:border-brand/40'
              }`}
            >
              <Icon name={ic} size={20} className="text-brand dark:text-dblue" />
              <div className="text-left">
                <p className="text-sm font-medium text-ink dark:text-dink">{l}</p>
                <p className="text-xs text-muted dark:text-dmuted">{theme === t ? 'Activo' : 'Seleccionar'}</p>
              </div>
            </button>
          ))}
        </div>
      </Card>

      {/* Notificações */}
      <Card className="p-6">
        <h3 className="font-semibold text-ink dark:text-dink mb-4 flex items-center gap-2">
          <Icon name="Bell" size={18} />Preferências de Notificações
        </h3>
        <div className="space-y-3">
          {[
            ['Alertas de emergências críticas', 'Receber aviso sonoro e pop-up imediato'],
            ['Novas missões atribuídas', 'Notificar quando uma nova missão for designada'],
            ['Actualizações de estado', 'Notificar sobre alterações de estado de ocorrências'],
            ['Resumo diário operacional', 'Relatório diário enviado às 08:00']
          ].map(([t, d], i) => (
            <label key={i} className="flex items-center justify-between p-3 rounded-lg hover:bg-light dark:hover:bg-dsidebar/40 cursor-pointer gap-3 transition-colors">
              <div className="min-w-0">
                <p className="text-sm font-medium text-ink dark:text-dink">{t}</p>
                <p className="text-xs text-muted dark:text-dmuted">{d}</p>
              </div>
              <input type="checkbox" defaultChecked={i < 3} className="w-4 h-4 rounded text-brand focus:ring-brand shrink-0" />
            </label>
          ))}
        </div>
      </Card>

      {/* Definições Admin */}
      {role === 'administrador' && (
        <Card className="p-6 border-l-4 border-l-red-500">
          <h3 className="font-semibold text-ink dark:text-dink mb-2 flex items-center gap-2">
            <Icon name="ShieldAlert" size={18} className="text-red-600" />
            Parâmetros do Sistema <span className="text-xs px-2 py-0.5 rounded bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-300 font-bold">Admin</span>
          </h3>
          <div className="space-y-3 mt-3">
            {[
              ['Modo de Manutenção', 'Suspender acessos externos temporariamente'],
              ['Registo Público de Cidadãos', 'Permitir que cidadãos submetam ocorrências anónimas'],
              ['Gateway de SMS de Emergência', 'Disparo automático de SMS para chefes de equipa'],
              ['Integração API INGD / CENOE', 'Sincronização bidirecional em tempo real']
            ].map(([t, d], i) => (
              <label key={i} className="flex items-center justify-between p-3 rounded-lg bg-light dark:bg-dsidebar/40 gap-3">
                <div>
                  <span className="text-sm font-medium text-ink dark:text-dink">{t}</span>
                  <p className="text-xs text-muted dark:text-dmuted">{d}</p>
                </div>
                <input type="checkbox" defaultChecked={i === 1 || i === 3} className="w-4 h-4 rounded text-brand shrink-0" />
              </label>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

export default Definicoes;
