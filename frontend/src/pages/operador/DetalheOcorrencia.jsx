import React, { useState } from 'react';
import Icon from '../../components/common/Icon';
import { Card, Button, StatusBadge, PrioBadge, Timeline, EmptyState, Modal, Field, inputCls } from '../../components/common/CommonComponents';
import { MozambiqueMap } from '../../components/map/MapComponents';
import { EQUIPAS } from '../../data/mockData';
import { useToast } from '../../contexts/ToastContext';

export function DetalheOcorrencia({ o, setPage, role }) {
  const toast = useToast();
  const [modalPrioridade, setModalPrioridade] = useState(false);
  const [modalMissao, setModalMissao] = useState(false);
  const [novaPrio, setNovaPrio] = useState(o?.prioridade || 'Alto');
  const [justificacao, setJustificacao] = useState('');
  const [equipaAlocada, setEquipaAlocada] = useState('');
  const [instrucoes, setInstrucoes] = useState('');

  if (!o) {
    return (
      <EmptyState 
        icon="FileText" 
        title="Nenhuma ocorrência seleccionada" 
        action={<Button onClick={() => setPage(role === 'coordenador' ? 'prioridades' : 'ocorrencias')}>Voltar</Button>}
      />
    );
  }

  // Permissões estritas segundo o documento oficial
  const isOperador = role === 'operador';
  const isCoordenador = role === 'coordenador';
  const isAdmin = role === 'administrador';

  const handleValidarOperador = () => {
    toast.success(`Ocorrência ${o.ref} validada pelo Operador e encaminhada à Coordenação de Emergências.`);
  };

  const handleSolicitarInfo = () => {
    toast.info(`Pedido de informação complementar enviado ao comunicante da ocorrência ${o.ref}.`);
  };

  const handleSalvarPrioridade = (e) => {
    e.preventDefault();
    if (!justificacao.trim()) {
      toast.error('O Coordenador deve obrigatoriamente preencher a justificação da avaliação.');
      return;
    }
    toast.success(`Prioridade de ${o.ref} fixada em "${novaPrio}" com validação humana.`);
    setModalPrioridade(false);
  };

  const handleCriarMissao = (e) => {
    e.preventDefault();
    if (!equipaAlocada) {
      toast.error('Selecione uma equipa disponível para a missão.');
      return;
    }
    toast.success(`Missão tática criada e atribuída com sucesso à equipa ${equipaAlocada}!`);
    setModalMissao(false);
  };

  return (
    <div className="space-y-4">
      {/* Botão de retorno e papel activo */}
      <div className="flex items-center justify-between">
        <button 
          onClick={() => setPage(isCoordenador ? 'dashboard' : 'ocorrencias')} 
          className="text-sm text-brand dark:text-dblue flex items-center gap-1 hover:underline font-medium"
        >
          <Icon name="ChevronLeft" size={16} /> Voltar
        </button>

        <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${
          isOperador 
            ? 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300' 
            : isCoordenador 
              ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300' 
              : 'bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300'
        }`}>
          Visão: {isOperador ? 'Operador (Triagem)' : isCoordenador ? 'Coordenador (Comando)' : 'Administrador (Auditoria)'}
        </span>
      </div>

      {/* Título e Referência */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-muted dark:text-dmuted">{o.ref}</span>
            <span className="text-xs px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              {o.tipo}
            </span>
          </div>
          <h2 className="text-xl font-bold text-ink dark:text-dink mt-1">{o.titulo}</h2>
          <p className="text-sm text-muted dark:text-dmuted">
            {o.localidade ? `${o.localidade}, ` : ''}{o.distrito}, {o.provincia} · Registado em {o.data}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge s={o.estado} />
          <PrioBadge p={o.prioridade} />
        </div>
      </div>

      {/* Conteúdo Principal */}
      <div className="grid lg:grid-cols-3 gap-4">
        {/* Coluna Esquerda: Descrição, Dados e Histórico */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="p-5 space-y-4">
            <h3 className="font-semibold text-ink dark:text-dink text-base">Relatório Detalhado da Situação</h3>
            <p className="text-sm text-ink dark:text-dink leading-relaxed bg-light/50 dark:bg-dsidebar/30 p-3.5 rounded-lg border border-bd dark:border-dborder">
              {o.descricao}
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-sm">
              <div className="p-3 rounded-lg bg-light/30 dark:bg-dsidebar/20">
                <p className="text-xs text-muted dark:text-dmuted">Fonte / Denunciante</p>
                <p className="font-semibold text-ink dark:text-dink mt-0.5">{o.fonte}</p>
              </div>
              <div className="p-3 rounded-lg bg-light/30 dark:bg-dsidebar/20">
                <p className="text-xs text-muted dark:text-dmuted">Pessoas Afectadas</p>
                <p className="font-semibold text-ink dark:text-dink mt-0.5">{o.afectados ?? 'A apurar'}</p>
              </div>
              <div className="p-3 rounded-lg bg-light/30 dark:bg-dsidebar/20">
                <p className="text-xs text-muted dark:text-dmuted">Nível de Risco</p>
                <p className="font-semibold text-ink dark:text-dink mt-0.5">{o.risco || 'Moderado'}</p>
              </div>
              <div className="p-3 rounded-lg bg-light/30 dark:bg-dsidebar/20">
                <p className="text-xs text-muted dark:text-dmuted">Responsável de Registo</p>
                <p className="font-semibold text-ink dark:text-dink mt-0.5">{o.responsavel || 'Ana Sitoe'}</p>
              </div>
            </div>
          </Card>

          {/* Histórico da Ocorrência (Diagrama de Classes: HistoricoOcorrencia) */}
          <Card className="p-5">
            <h3 className="font-semibold text-ink dark:text-dink mb-3">Histórico de Alterações e Rastreabilidade</h3>
            <Timeline items={[
              { data: o.data, txt: `Ocorrência comunicada por ${o.fonte} e registada no sistema` },
              { data: '15/01 08:45', txt: 'Triagem realizada pelo Operador: dados verificados com sucesso' },
              { data: '15/01 09:10', txt: `Avaliação de gravidade: Prioridade calculada como ${o.prioridade || 'a definir'}` },
            ]} />
          </Card>
        </div>

        {/* Coluna Direita: Mapa e Ações Específicas por Perfil */}
        <div className="space-y-4">
          <Card className="p-5 space-y-3">
            <h3 className="font-semibold text-ink dark:text-dink text-sm">Localização no Mapa</h3>
            <div className="h-44 rounded-lg overflow-hidden border border-bd dark:border-dborder">
              <MozambiqueMap ocorrencias={[o]} height={176} />
            </div>
            <p className="text-xs text-muted dark:text-dmuted text-center">
              Coordenadas: {o.lat ? `${o.lat}, ${o.lng}` : 'Georreferenciação aproximada'}
            </p>
          </Card>

          {/* AÇÕES DIFERENCIADAS CONFORME O PERFIL */}
          <Card className="p-5 space-y-3 border-t-4 border-t-brand">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-ink dark:text-dink text-sm">Painel de Ações Autorizadas</h3>
              <Icon name="ShieldCheck" size={16} className="text-brand dark:text-dblue" />
            </div>

            {/* FLUXO DO OPERADOR: Triagem e Verificação */}
            {isOperador && (
              <div className="space-y-2">
                <p className="text-xs text-muted dark:text-dmuted leading-relaxed">
                  Competência do Operador: Confirmar a veracidade das informações antes de submeter ao Coordenador.
                </p>
                <Button 
                  icon="CheckCircle" 
                  className="w-full bg-green-600 hover:bg-green-700" 
                  onClick={handleValidarOperador}
                >
                  Validar e Encaminhar
                </Button>
                <Button 
                  variant="secondary" 
                  icon="MessageSquare" 
                  className="w-full" 
                  onClick={handleSolicitarInfo}
                >
                  Solicitar Info Complementar
                </Button>
              </div>
            )}

            {/* FLUXO DO COORDENADOR: Avaliação de Prioridade e Despacho de Missão */}
            {isCoordenador && (
              <div className="space-y-2">
                <p className="text-xs text-muted dark:text-dmuted leading-relaxed">
                  Competência do Coordenador: Avaliar gravidade com validação humana e mobilizar equipas de socorro.
                </p>
                <Button 
                  icon="AlertTriangle" 
                  className="w-full bg-amber-600 hover:bg-amber-700 text-white" 
                  onClick={() => setModalPrioridade(true)}
                >
                  Avaliar / Validar Prioridade
                </Button>
                <Button 
                  icon="Target" 
                  className="w-full" 
                  onClick={() => setModalMissao(true)}
                >
                  Atribuir Missão e Despachar
                </Button>
              </div>
            )}

            {/* FLUXO DO ADMINISTRADOR: Auditoria e Governança */}
            {isAdmin && (
              <div className="space-y-2">
                <p className="text-xs text-muted dark:text-dmuted leading-relaxed">
                  Competência do Administrador: Acesso estritamente para auditoria de integridade e conformidade de dados.
                </p>
                <Button 
                  variant="secondary" 
                  icon="History" 
                  className="w-full" 
                  onClick={() => setPage('auditoria')}
                >
                  Consultar Logs de Auditoria
                </Button>
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Modal de Avaliação de Prioridade (Exclusivo do Coordenador) */}
      <Modal
        open={modalPrioridade}
        onClose={() => setModalPrioridade(false)}
        title={`Avaliação de Gravidade: ${o.ref}`}
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setModalPrioridade(false)}>Cancelar</Button>
            <Button icon="CheckCircle" onClick={handleSalvarPrioridade}>Confirmar Avaliação</Button>
          </div>
        }
      >
        <form onSubmit={handleSalvarPrioridade} className="space-y-4">
          <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-xs text-blue-800 dark:text-blue-300">
            A decisão final é humana. O sistema apoia calculando a gravidade com base nos fatores configurados pelo Administrador.
          </div>

          <Field label="Definição Final de Prioridade" required>
            <select value={novaPrio} onChange={e => setNovaPrio(e.target.value)} className={inputCls}>
              <option>Crítico</option>
              <option>Alto</option>
              <option>Médio</option>
              <option>Baixo</option>
            </select>
          </Field>

          <Field label="Justificação Operacional Obrigatória" required>
            <textarea 
              rows={3} 
              className={inputCls} 
              placeholder="Ex: Alto risco de perda de vidas humanas e subida das águas na bacia do rio..."
              value={justificacao}
              onChange={e => setJustificacao(e.target.value)}
              required
            />
          </Field>
        </form>
      </Modal>

      {/* Modal de Despacho de Missão (Exclusivo do Coordenador) */}
      <Modal
        open={modalMissao}
        onClose={() => setModalMissao(false)}
        title={`Despachar Missão Tática para ${o.ref}`}
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setModalMissao(false)}>Cancelar</Button>
            <Button icon="Target" onClick={handleCriarMissao}>Criar e Despachar</Button>
          </div>
        }
      >
        <form onSubmit={handleCriarMissao} className="space-y-4">
          <Field label="Selecione a Equipa de Resposta Disponível" required>
            <select value={equipaAlocada} onChange={e => setEquipaAlocada(e.target.value)} className={inputCls} required>
              <option value="">Selecione uma equipa disponível...</option>
              {EQUIPAS.filter(eq => eq.estado === 'Disponível').map(eq => (
                <option key={eq.id} value={eq.nome}>
                  {eq.nome} ({eq.tipo} · {eq.membros} membros)
                </option>
              ))}
            </select>
          </Field>

          <Field label="Instruções Operacionais e Objetivos Táticos" required>
            <textarea 
              rows={3} 
              className={inputCls} 
              placeholder="Ex: Estabelecer centro de evacuação no campo comunitário e apoiar busca e salvamento..."
              value={instrucoes}
              onChange={e => setInstrucoes(e.target.value)}
              required
            />
          </Field>
        </form>
      </Modal>
    </div>
  );
}

export default DetalheOcorrencia;
