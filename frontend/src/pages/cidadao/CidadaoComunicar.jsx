import React, { useState } from 'react';
import Icon from '../../components/common/Icon';
import { Card, Button, Field, inputCls } from '../../components/common/CommonComponents';
import { LocationPicker } from '../../components/map/MapComponents';
import { USERS } from '../../data/mockData';
import { useToast } from '../../contexts/ToastContext';

export function CidadaoComunicar({ setPage }) {
  const toast = useToast();
  const [sec, setSec] = useState('A');
  const [tipo, setTipo] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const [submitted, setSubmitted] = useState(null);
  const [loc, setLoc] = useState({ lat: null, lng: null });
  const [geoLoading, setGeoLoading] = useState(false);

  const tipos = [
    { id: 'Cheia', label: 'Cheias ou inundações', icon: 'Waves', color: 'text-blue-600 dark:text-blue-300' },
    { id: 'Ciclone', label: 'Ciclone ou tempestade', icon: 'Wind', color: 'text-indigo-600 dark:text-indigo-300' },
    { id: 'Incêndio', label: 'Incêndio', icon: 'Flame', color: 'text-orange-600 dark:text-orange-300' },
    { id: 'Deslizamento', label: 'Deslizamento de terras', icon: 'MapPin', color: 'text-amber-600 dark:text-amber-300' },
    { id: 'Acidente', label: 'Acidente', icon: 'AlertTriangle', color: 'text-red-600 dark:text-red-300' },
    { id: 'Surto de doença', label: 'Risco sanitário', icon: 'Leaf', color: 'text-green-600 dark:text-green-300' },
    { id: 'Outra situação', label: 'Outra situação', icon: 'AlertCircle', color: 'text-slate-600 dark:text-slate-300' },
  ];

  const secs = [
    { id: 'A', label: 'Tipo' },
    { id: 'B', label: 'Descrição' },
    { id: 'C', label: 'Localização' },
    { id: 'D', label: 'Evidências' },
    { id: 'E', label: 'Confirmação' }
  ];

  const usarLocalizacao = () => {
    if (!navigator.geolocation) { 
      toast.error('Geolocalização não disponível no seu dispositivo.'); 
      return; 
    }
    setGeoLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLoc({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setGeoLoading(false);
        toast.success('Localização GPS obtida com sucesso.');
      },
      () => {
        setGeoLoading(false);
        toast.error('Não foi possível obter a localização automática. Preencha manualmente.');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleSubmit = () => {
    if (!tipo) { 
      toast.error('Seleccione o tipo de ocorrência.'); 
      setSec('A');
      return; 
    }
    if (!confirmed) { 
      toast.error('Confirme que as informações são exactas.'); 
      return; 
    }
    const ref = 'CID-2025-' + String(Math.floor(Math.random() * 9000) + 1000);
    setSubmitted({
      ref,
      data: new Date().toLocaleString('pt-PT', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
      tipo,
      local: `${loc.lat?.toFixed(4) || '—'}, ${loc.lng?.toFixed(4) || '—'}`
    });
  };

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto space-y-4">
        <Card className="p-8 text-center animate-in fade-in zoom-in-95 duration-200">
          <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-950/50 text-green-600 dark:text-green-300 mx-auto flex items-center justify-center">
            <Icon name="CheckCircle" size={32} />
          </div>
          <h2 className="text-xl font-bold text-ink dark:text-dink mt-4">Ocorrência submetida</h2>
          <p className="text-sm text-muted dark:text-dmuted mt-1">
            A sua comunicação foi recebida pelo sistema e será analisada pelas entidades responsáveis.
          </p>

          <div className="mt-6 p-4 rounded-lg bg-light dark:bg-dsidebar/40 text-left space-y-2 border border-bd dark:border-dborder">
            <div className="flex justify-between text-sm">
              <span className="text-muted dark:text-dmuted">Referência única</span>
              <span className="font-mono font-semibold text-brand dark:text-dblue">{submitted.ref}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted dark:text-dmuted">Data e hora</span>
              <span className="text-ink dark:text-dink">{submitted.data}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted dark:text-dmuted">Tipo de emergência</span>
              <span className="text-ink dark:text-dink font-medium">{submitted.tipo}</span>
            </div>
          </div>

          <div className="mt-4 p-3 rounded-lg border border-amber-200 dark:border-amber-900/50 bg-amber-50 dark:bg-amber-950/20 text-xs text-amber-900 dark:text-amber-100 text-left">
            <strong>Nota:</strong> A submissão será sujeita a análise. Este envio <strong>não representa confirmação</strong> de que uma equipa foi mobilizada.
          </div>

          <div className="mt-6 flex gap-2 justify-center flex-wrap">
            <Button icon="Eye" onClick={() => setPage('minhas-ocorrencias')}>Acompanhar ocorrência</Button>
            <Button variant="secondary" onClick={() => { setSubmitted(null); setTipo(''); setConfirmed(false); setSec('A'); setLoc({ lat: null, lng: null }); }}>
              Nova comunicação
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-ink dark:text-dink">Comunicar uma Ocorrência</h1>
        <p className="text-sm text-muted dark:text-dmuted mt-1">
          Forneça informações claras para ajudar as entidades responsáveis a compreender e avaliar a situação.
        </p>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {secs.map((s, i) => (
          <button 
            key={s.id} 
            onClick={() => setSec(s.id)}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm whitespace-nowrap transition-colors ${
              sec === s.id 
                ? 'bg-brand text-white font-medium' 
                : 'bg-white dark:bg-dcard border border-bd dark:border-dborder text-ink dark:text-dink'
            }`}
          >
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${
              sec === s.id ? 'bg-white/20' : 'bg-lblue dark:bg-dsidebar text-brand dark:text-dblue font-semibold'
            }`}>
              {i + 1}
            </span>
            <span>{s.label}</span>
          </button>
        ))}
      </div>

      <Card className="p-6 space-y-5">
        {sec === 'A' && (
          <Field label="Seleccione o tipo de ocorrência" required hint="Escolha a opção que melhor descreve a situação observada.">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
              {tipos.map(t => (
                <button 
                  key={t.id} 
                  type="button"
                  onClick={() => setTipo(t.id)}
                  className={`p-3 rounded-lg border-2 flex flex-col items-start gap-1.5 transition-all text-left ${
                    tipo === t.id 
                      ? 'border-brand bg-lblue/50 dark:bg-dblue/10 shadow-sm' 
                      : 'border-bd dark:border-dborder hover:border-brand/50'
                  }`}
                >
                  <Icon name={t.icon} size={22} className={t.color} />
                  <span className="text-xs font-semibold text-ink dark:text-dink">{t.label}</span>
                </button>
              ))}
            </div>
          </Field>
        )}

        {sec === 'B' && (
          <>
            <Field label="Título / descrição resumida" required hint="Ex: Água a subir na rua principal">
              <input className={inputCls} placeholder="Resumo curto da situação" />
            </Field>
            <Field label="Descrição detalhada" required hint="Inclua o que observou, extensão aparente, se há pessoas em risco, etc.">
              <textarea rows={5} className={inputCls} placeholder="Descreva a situação com o máximo de detalhe possível..." />
            </Field>
            <Field label="Data e hora em que observou a situação" required>
              <input type="datetime-local" className={inputCls} defaultValue={new Date().toISOString().slice(0, 16)} />
            </Field>
          </>
        )}

        {sec === 'C' && (
          <>
            <div className="grid md:grid-cols-2 gap-4">
              <Field label="Província" required>
                <select className={inputCls}>
                  {['Maputo', 'Gaza', 'Inhambane', 'Sofala', 'Manica', 'Tete', 'Zambézia', 'Nampula', 'Niassa', 'Cabo Delgado'].map(p => (
                    <option key={p}>{p}</option>
                  ))}
                </select>
              </Field>
              <Field label="Distrito" required><input className={inputCls} placeholder="Ex: Beira" /></Field>
              <Field label="Localidade"><input className={inputCls} placeholder="Ex: Macurungo" /></Field>
              <Field label="Endereço / ponto de referência">
                <input className={inputCls} placeholder="Ex: Próximo à escola primária" />
              </Field>
            </div>
            
            <div className="flex flex-wrap gap-2 items-center pt-2">
              <Button variant="secondary" icon="Navigation" onClick={usarLocalizacao} disabled={geoLoading}>
                {geoLoading ? 'A obter coordenadas...' : 'Usar a minha localização GPS'}
              </Button>
              {loc.lat && (
                <span className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1 font-medium">
                  <Icon name="CheckCircle" size={14} /> Localização obtida ({loc.lat.toFixed(4)}, {loc.lng.toFixed(4)})
                </span>
              )}
            </div>
            <p className="text-xs text-muted dark:text-dmuted">
              A localização só será obtida após a sua autorização explícita. Pode também clicar no mapa para marcar o local.
            </p>

            <Field label="Localização no mapa" hint="Clique no mapa para marcar a localização exacta (opcional)">
              <div className="h-64 rounded-xl overflow-hidden mt-2">
                <LocationPicker value={loc} onChange={setLoc} height={256} />
              </div>
            </Field>

            <div className="grid md:grid-cols-2 gap-4">
              <Field label="Latitude">
                <input type="number" step="0.0001" value={loc.lat || ''} onChange={e => setLoc({ ...loc, lat: parseFloat(e.target.value) })} className={inputCls} />
              </Field>
              <Field label="Longitude">
                <input type="number" step="0.0001" value={loc.lng || ''} onChange={e => setLoc({ ...loc, lng: parseFloat(e.target.value) })} className={inputCls} />
              </Field>
            </div>
          </>
        )}

        {sec === 'D' && (
          <>
            <Field label="Fotografias" hint="Formatos aceites: JPG, PNG. Tamanho máximo: 10MB por ficheiro. Não é obrigatório — não coloque a sua segurança em risco para obter fotografias.">
              <div className="border-2 border-dashed border-bd dark:border-dborder rounded-lg p-8 text-center mt-2 hover:border-brand/50 transition-colors">
                <Icon name="Camera" size={32} className="mx-auto text-muted dark:text-dmuted mb-2" />
                <p className="text-sm text-ink dark:text-dink font-medium">Clique ou arraste fotografias para aqui</p>
                <p className="text-xs text-muted dark:text-dmuted mt-1">(opcional)</p>
              </div>
            </Field>
            <Field label="Documentos" hint="Ex: PDF, DOC. Tamanho máximo: 10MB.">
              <button type="button" className="flex items-center gap-2 px-3 py-2 border border-bd dark:border-dborder rounded-lg text-sm text-ink dark:text-dink hover:bg-light dark:hover:bg-dsidebar transition-colors">
                <Icon name="Paperclip" size={16} /> Anexar documento
              </button>
            </Field>
            <Field label="Descrição das evidências anexadas">
              <textarea rows={3} className={inputCls} placeholder="Notas adicionais sobre as imagens ou vídeos..." />
            </Field>
          </>
        )}

        {sec === 'E' && (
          <>
            <div className="p-4 rounded-lg bg-lblue dark:bg-dblue/10 space-y-2 border border-blue-200 dark:border-blue-900/30">
              <p className="text-sm font-semibold text-ink dark:text-dink">Os seus dados de contacto associados</p>
              <div className="flex items-center gap-2 text-sm text-ink dark:text-dink">
                <Icon name="Mail" size={14} className="text-muted dark:text-dmuted" /> {USERS.cidadao.email}
              </div>
              <div className="flex items-center gap-2 text-sm text-ink dark:text-dink">
                <Icon name="Phone" size={14} className="text-muted dark:text-dmuted" /> {USERS.cidadao.telefone}
              </div>
              <p className="text-xs text-muted dark:text-dmuted mt-1">
                Estes dados são usados apenas para acompanhar a sua comunicação e não serão publicados.
              </p>
            </div>

            <label className="flex items-start gap-3 p-4 rounded-lg border-2 border-bd dark:border-dborder cursor-pointer hover:bg-light dark:hover:bg-dsidebar/30 transition-colors">
              <input 
                type="checkbox" 
                checked={confirmed} 
                onChange={e => setConfirmed(e.target.checked)} 
                className="mt-1 w-4 h-4 text-brand rounded" 
              />
              <span className="text-sm text-ink dark:text-dink">
                Confirmo que as informações fornecidas são tão exactas quanto possível, dentro do que consegui observar em segurança.
              </span>
            </label>

            <div className="p-3 rounded-lg border border-amber-200 dark:border-amber-900/50 bg-amber-50 dark:bg-amber-950/20 text-xs text-amber-900 dark:text-amber-100">
              <strong>Nota:</strong> A submissão será sujeita a análise. Este envio <strong>não representa confirmação</strong> de que uma equipa foi mobilizada.
            </div>
          </>
        )}
      </Card>

      <div className="flex flex-wrap gap-2 justify-between items-center">
        <Button variant="secondary" onClick={() => setPage('dashboard')}>Cancelar</Button>
        <div className="flex gap-2">
          <Button variant="secondary" icon="Save" onClick={() => toast.success('Rascunho guardado localmente.')}>
            Guardar rascunho
          </Button>
          <Button icon="Send" onClick={handleSubmit}>
            Enviar ocorrência
          </Button>
        </div>
      </div>
    </div>
  );
}

export default CidadaoComunicar;
