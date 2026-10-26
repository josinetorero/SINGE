import React from 'react';
import Icon from '../../components/common/Icon';
import { Card, Button, Field, inputCls } from '../../components/common/CommonComponents';
import { useTheme } from '../../contexts/ThemeContext';
import { useToast } from '../../contexts/ToastContext';

export function CidadaoPerfil({ user }) {
  const { theme, toggleTheme } = useTheme();
  const toast = useToast();

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold text-ink dark:text-dink">O Meu Perfil</h1>

      <Card className="p-6">
        <div className="flex items-center gap-4 mb-5">
          <div className="w-16 h-16 rounded-full bg-navy text-white flex items-center justify-center text-xl font-semibold">
            {user.nome.split(' ').map(n => n[0]).slice(0, 2).join('')}
          </div>
          <div>
            <p className="font-semibold text-ink dark:text-dink">{user.nome}</p>
            <p className="text-sm text-muted dark:text-dmuted">Cidadão Registado</p>
          </div>
        </div>
        <div className="space-y-4">
          <Field label="Nome completo"><input defaultValue={user.nome} className={inputCls} /></Field>
          <Field label="Email"><input type="email" defaultValue={user.email} className={inputCls} /></Field>
          <Field label="Telefone"><input type="tel" defaultValue={user.telefone} className={inputCls} /></Field>
          <Field label="Conta criada em">
            <input defaultValue={user.criadoEm} readOnly className={inputCls + ' opacity-60 cursor-not-allowed'} />
          </Field>
        </div>
        <div className="mt-4 flex justify-end">
          <Button icon="Save" onClick={() => toast.success('Perfil actualizado.')}>Guardar</Button>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="font-semibold text-ink dark:text-dink mb-3">Alterar palavra-passe</h3>
        <div className="space-y-3">
          <Field label="Palavra-passe actual"><input type="password" className={inputCls} /></Field>
          <Field label="Nova palavra-passe"><input type="password" className={inputCls} /></Field>
        </div>
        <div className="mt-4 flex justify-end">
          <Button variant="secondary" icon="Lock" onClick={() => toast.success('Palavra-passe alterada com sucesso.')}>
            Alterar palavra-passe
          </Button>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="font-semibold text-ink dark:text-dink mb-3 flex items-center gap-2">
          <Icon name="Palette" size={18} />Aparência
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
                  : 'border-bd dark:border-dborder'
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

      <Card className="p-6">
        <h3 className="font-semibold text-ink dark:text-dink mb-3 flex items-center gap-2">
          <Icon name="Bell" size={18} />Preferências de Notificação
        </h3>
        <div className="space-y-2">
          {[
            ['Actualizações das minhas ocorrências', 'Receber notificação quando houver alterações'],
            ['Novos alertas na minha região', 'Alertas de segurança e meteorologia próximos'],
            ['Informações preventivas', 'Recomendações e conteúdos educativos de proteção']
          ].map(([t, d], i) => (
            <label key={i} className="flex items-center justify-between p-3 rounded-lg hover:bg-light dark:hover:bg-dsidebar/40 cursor-pointer gap-3 transition-colors">
              <div className="min-w-0">
                <p className="text-sm font-medium text-ink dark:text-dink">{t}</p>
                <p className="text-xs text-muted dark:text-dmuted">{d}</p>
              </div>
              <input type="checkbox" defaultChecked={true} className="w-4 h-4 rounded text-brand focus:ring-brand shrink-0" />
            </label>
          ))}
        </div>
      </Card>

      <Card className="p-6 border-l-4 border-l-brand">
        <h3 className="font-semibold text-ink dark:text-dink mb-2 flex items-center gap-2">
          <Icon name="Lock" size={18} className="text-brand" />
          Privacidade e Proteção de Dados
        </h3>
        <p className="text-sm text-muted dark:text-dmuted leading-relaxed">
          Os seus dados pessoais são utilizados exclusivamente para acompanhar as comunicações que efectuar e para o envio de notificações relevantes. Não são partilhados publicamente nem com terceiros não autorizados. A sua localização só é recolhida com o seu consentimento explícito.
        </p>
      </Card>
    </div>
  );
}

export default CidadaoPerfil;
