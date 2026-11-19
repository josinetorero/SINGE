import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

export function MozambiqueMap({ ocorrencias = [], height = 380, onSelectOccurrence }) {
  const ref = useRef(null);
  const mapRef = useRef(null);
  const layerRef = useRef(null);

  useEffect(() => {
    if (!ref.current || mapRef.current) return;
    mapRef.current = L.map(ref.current, { scrollWheelZoom: false }).setView([-18.6, 35.5], 5);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { 
      attribution: '© OpenStreetMap contributors', 
      maxZoom: 18 
    }).addTo(mapRef.current);
    layerRef.current = L.layerGroup().addTo(mapRef.current);

    return () => { 
      if (mapRef.current) { 
        mapRef.current.remove(); 
        mapRef.current = null; 
      } 
    };
  }, []);

  useEffect(() => {
    if (!layerRef.current) return;
    layerRef.current.clearLayers();
    const points = [];
    ocorrencias.forEach(o => {
      const lat = Number(o.latitude ?? o.lat ?? o.localizacao_geografica?.latitude);
      const lng = Number(o.longitude ?? o.lng ?? o.localizacao_geografica?.longitude);
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;
      const priority = String(o.prioridade?.nome || o.prioridade || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
      const color = priority.includes('critic') ? '#DC2626' : priority.includes('alt') ? '#EA580C' : priority.includes('medi') ? '#CA8A04' : '#16A34A';
      
      const icon = L.divIcon({ 
        className: '', 
        html: `<div style="background:${color};width:18px;height:18px;border-radius:50%;border:2px solid #fff;box-shadow:0 0 0 3px ${color}55;"></div>`, 
        iconSize: [18, 18], 
        iconAnchor: [9, 9] 
      });

      const marker = L.marker([lat, lng], { icon }).addTo(layerRef.current);
      const popup = document.createElement('div');
      const title = document.createElement('strong'); title.textContent = `Ocorrência #${o.id || ''}`; popup.append(title);
      const details = document.createElement('p'); details.textContent = [o.tipo_ocorrencia?.nome || o.tipo, o.estado, o.prioridade?.nome || o.prioridade].filter(Boolean).join(' · '); popup.append(details);
      const location = document.createElement('p'); location.textContent = [o.localizacao_geografica?.distrito || o.distrito, o.localizacao_geografica?.provincia || o.provincia, o.localizacao].filter(Boolean).join(', '); popup.append(location);
      if (onSelectOccurrence) {
        const button = document.createElement('button'); button.type = 'button'; button.textContent = 'Abrir detalhe';
        button.style.cssText = 'color:#1d4ed8;text-decoration:underline;margin-top:4px;cursor:pointer';
        button.addEventListener('click', () => onSelectOccurrence(o)); popup.append(button);
      }
      marker.bindPopup(popup);
      points.push([lat, lng]);
    });

    if (points.length > 1) mapRef.current.fitBounds(L.latLngBounds(points).pad(0.15), { maxZoom: 11 });
    else if (points.length === 1) mapRef.current.setView(points[0], 10);

    setTimeout(() => {
      if (mapRef.current) {
        mapRef.current.invalidateSize();
      }
    }, 150);
  }, [ocorrencias]);

  return <div ref={ref} style={{ height, width: '100%' }} className="rounded-xl overflow-hidden" />;
}

export function LocationPicker({ value, onChange, height = 300 }) {
  const ref = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const onChangeRef = useRef(onChange);
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [searching, setSearching] = useState(false);
  const [searchMessage, setSearchMessage] = useState('');
  onChangeRef.current = onChange;

  useEffect(() => {
    if (!ref.current || mapRef.current) return;
    const center = (value && value.lat) ? [value.lat, value.lng] : [-18.6, 35.5];
    const zoom = (value && value.lat) ? 11 : 5;
    mapRef.current = L.map(ref.current).setView(center, zoom);
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { 
      attribution: '© OpenStreetMap contributors', 
      maxZoom: 18 
    }).addTo(mapRef.current);

    if (value && value.lat) {
      markerRef.current = L.marker([value.lat, value.lng]).addTo(mapRef.current);
    }

    mapRef.current.on('click', (e) => {
      const { lat, lng } = e.latlng;
      if (markerRef.current) {
        markerRef.current.setLatLng([lat, lng]);
      } else {
        markerRef.current = L.marker([lat, lng]).addTo(mapRef.current);
      }
      onChangeRef.current?.({ lat, lng });
    });

    return () => { 
      if (mapRef.current) { 
        mapRef.current.remove(); 
        mapRef.current = null; 
      } 
    };
  }, []);

  useEffect(() => {
    if (!mapRef.current || value?.lat == null || value?.lng == null) return;
    const point = [Number(value.lat), Number(value.lng)];
    if (!point.every(Number.isFinite)) return;
    if (markerRef.current) markerRef.current.setLatLng(point);
    else markerRef.current = L.marker(point).addTo(mapRef.current);
    mapRef.current.setView(point, Math.max(mapRef.current.getZoom(), 11));
  }, [value?.lat, value?.lng]);

  useEffect(() => {
    const term = query.trim();
    if (term.length < 3) { setSuggestions([]); setSearchMessage(''); return undefined; }
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setSearching(true); setSearchMessage('');
      try {
        const params = new URLSearchParams({ format: 'jsonv2', countrycodes: 'mz', addressdetails: '1', limit: '5', q: term });
        const response = await fetch(`https://nominatim.openstreetmap.org/search?${params}`, { signal: controller.signal, headers: { Accept: 'application/json' } });
        if (!response.ok) throw new Error('A pesquisa geográfica está temporariamente indisponível.');
        const results = await response.json();
        setSuggestions(Array.isArray(results) ? results : []);
        if (!results.length) setSearchMessage('Sem resultados fiáveis. Pode indicar o local manualmente ou marcar no mapa.');
      } catch (error) {
        if (error.name !== 'AbortError') setSearchMessage('Pesquisa indisponível. A selecção manual e o mapa continuam disponíveis.');
      } finally { if (!controller.signal.aborted) setSearching(false); }
    }, 900);
    return () => { window.clearTimeout(timer); controller.abort(); };
  }, [query]);

  const choose = result => {
    const lat = Number(result.lat); const lng = Number(result.lon);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) { setSearchMessage('O resultado não tem coordenadas válidas.'); return; }
    if (markerRef.current) markerRef.current.setLatLng([lat, lng]);
    else markerRef.current = L.marker([lat, lng]).addTo(mapRef.current);
    mapRef.current.setView([lat, lng], 13);
    onChangeRef.current?.({ lat, lng, label: result.display_name });
    setQuery(result.display_name); setSuggestions([]); setSearchMessage('Local seleccionado. Confirme as referências administrativas antes de submeter.');
  };

  return <div className="space-y-2">
    <label className="block text-sm font-medium" htmlFor="geographic-location-search">Pesquisar província, distrito, bairro ou referência</label>
    <input id="geographic-location-search" className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100" value={query} onChange={event => setQuery(event.target.value)} placeholder="Ex.: Beira, Macurungo" autoComplete="off" />
    {searching && <p role="status" className="text-xs text-slate-500">A pesquisar no OpenStreetMap…</p>}
    {searchMessage && <p role="status" className="text-xs text-slate-600 dark:text-slate-400">{searchMessage}</p>}
    {suggestions.length > 0 && <ul className="max-h-40 overflow-y-auto rounded-lg border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">{suggestions.map(item => <li key={item.place_id}><button type="button" className="w-full px-3 py-2 text-left text-sm hover:bg-slate-100 dark:hover:bg-slate-800" onClick={() => choose(item)}>{item.display_name}</button></li>)}</ul>}
    <div ref={ref} style={{ height, width: '100%' }} className="overflow-hidden rounded-xl" />
    <p className="text-xs text-slate-500">Mapa e pesquisa dependem da disponibilidade do OpenStreetMap. Se não estiver acessível, marque no mapa quando possível ou introduza a localização manualmente.</p>
  </div>;
}
