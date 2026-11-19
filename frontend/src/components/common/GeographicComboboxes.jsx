import React, { useEffect, useRef, useState } from 'react';
import { Field, inputCls } from './CommonComponents';
import { ocorrenciasService } from '../../services/ocorrenciasService';

const EMPTY = { provincia_id: '', distrito_id: '', municipio_id: '', posto_administrativo_id: '', bairro_id: '', quarteirao_id: '', endereco_referencia: '' };

function SelectField({ label, name, options, value, parentValue, loading, error, onChange, required = false }) {
  return <Field label={label} required={required} error={error}>
    <select className={inputCls} value={value} required={required} disabled={(!parentValue && name !== 'provincia_id') || loading} onChange={event => onChange(event.target.value)}>
      <option value="">{loading ? 'A carregar opções…' : options.length ? 'Seleccione…' : parentValue ? 'Sem opções disponíveis' : 'Seleccione primeiro a localização anterior'}</option>
      {options.map(option => <option key={option.id} value={option.id}>{option.nome}</option>)}
    </select>
  </Field>;
}

export function GeographicComboboxes({ value = EMPTY, onChange, errors = {}, required = false }) {
  const [options, setOptions] = useState({});
  const [loading, setLoading] = useState({});
  const [loadError, setLoadError] = useState('');
  const requestVersions = useRef({});
  const state = { ...EMPTY, ...value };

  const load = async (type, parentId = null, parentType = null) => {
    const version = (requestVersions.current[type] || 0) + 1;
    requestVersions.current[type] = version;
    setLoading(current => ({ ...current, [type]: true }));
    try {
      const items = await ocorrenciasService.opcoesGeograficas(type, parentId, parentType);
      if (requestVersions.current[type] !== version) return;
      setOptions(current => ({ ...current, [type]: items }));
      setLoadError('');
    } catch (error) {
      if (requestVersions.current[type] !== version) return;
      setLoadError(error.message || 'Não foi possível carregar as opções geográficas.');
    } finally {
      if (requestVersions.current[type] === version) setLoading(current => ({ ...current, [type]: false }));
    }
  };

  useEffect(() => { load('provincias'); }, []);
  useEffect(() => {
    setOptions(current => ({ ...current, distritos: [], municipios: [], postos_administrativos: [], bairros: [], quarteiroes: [] }));
    if (state.provincia_id) load('distritos', state.provincia_id);
  }, [state.provincia_id]);
  useEffect(() => {
    setOptions(current => ({ ...current, municipios: [], postos_administrativos: [], bairros: [], quarteiroes: [] }));
    if (state.distrito_id) {
      load('municipios', state.distrito_id);
      load('postos_administrativos', state.distrito_id);
    }
  }, [state.distrito_id]);
  useEffect(() => {
    setOptions(current => ({ ...current, bairros: [], quarteiroes: [] }));
    if (state.municipio_id) load('bairros', state.municipio_id, 'municipios');
    else if (state.posto_administrativo_id) load('bairros', state.posto_administrativo_id, 'postos_administrativos');
  }, [state.municipio_id, state.posto_administrativo_id]);
  useEffect(() => {
    setOptions(current => ({ ...current, quarteiroes: [] }));
    if (state.bairro_id) load('quarteiroes', state.bairro_id);
  }, [state.bairro_id]);

  const update = (key, selected) => {
    const reset = {
      provincia_id: ['distrito_id', 'municipio_id', 'posto_administrativo_id', 'bairro_id', 'quarteirao_id'],
      distrito_id: ['municipio_id', 'posto_administrativo_id', 'bairro_id', 'quarteirao_id'],
      municipio_id: ['posto_administrativo_id', 'bairro_id', 'quarteirao_id'],
      posto_administrativo_id: ['municipio_id', 'bairro_id', 'quarteirao_id'],
      bairro_id: ['quarteirao_id'],
    }[key] || [];
    const next = { ...state, [key]: selected };
    reset.forEach(field => { next[field] = ''; });
    const findName = (type, id) => options[type]?.find(item => String(item.id) === String(id))?.nome || '';
    const named = { ...next,
      provincia: findName('provincias', next.provincia_id), distrito: findName('distritos', next.distrito_id),
      municipio: findName('municipios', next.municipio_id), posto_administrativo: findName('postos_administrativos', next.posto_administrativo_id),
      bairro: findName('bairros', next.bairro_id), quarteirao: findName('quarteiroes', next.quarteirao_id),
    };
    onChange?.(named);
  };

  return <div className="space-y-3">
    {loadError && <p role="alert" className="text-sm text-red-700 dark:text-red-300">{loadError}</p>}
    <div className="grid gap-3 sm:grid-cols-2">
      <SelectField label="Província" name="provincia_id" required={required} options={options.provincias || []} value={state.provincia_id} parentValue onChange={id => update('provincia_id', id)} loading={loading.provincias} error={errors.provincia_id} />
      <SelectField label="Distrito" name="distrito_id" required={required} options={options.distritos || []} value={state.distrito_id} parentValue={state.provincia_id} onChange={id => update('distrito_id', id)} loading={loading.distritos} error={errors.distrito_id} />
      <SelectField label="Município" name="municipio_id" options={options.municipios || []} value={state.municipio_id} parentValue={state.distrito_id} onChange={id => update('municipio_id', id)} loading={loading.municipios} error={errors.municipio_id} />
      <SelectField label="Posto administrativo" name="posto_administrativo_id" options={options.postos_administrativos || []} value={state.posto_administrativo_id} parentValue={state.distrito_id} onChange={id => update('posto_administrativo_id', id)} loading={loading.postos_administrativos} error={errors.posto_administrativo_id} />
      <SelectField label="Bairro" name="bairro_id" options={options.bairros || []} value={state.bairro_id} parentValue={state.municipio_id || state.posto_administrativo_id} onChange={id => update('bairro_id', id)} loading={loading.bairros} error={errors.bairro_id} />
      <SelectField label="Quarteirão" name="quarteirao_id" options={options.quarteiroes || []} value={state.quarteirao_id} parentValue={state.bairro_id} onChange={id => update('quarteirao_id', id)} loading={loading.quarteiroes} error={errors.quarteirao_id} />
    </div>
    <Field label="Referência ou endereço" error={errors.endereco_referencia}>
      <input className={inputCls} maxLength={1000} value={state.endereco_referencia} onChange={event => onChange?.({ ...state, endereco_referencia: event.target.value })} placeholder="Rua, edifício, mercado ou ponto de referência" />
    </Field>
  </div>;
}

export default GeographicComboboxes;
