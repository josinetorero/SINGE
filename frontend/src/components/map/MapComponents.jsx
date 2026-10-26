import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

export function MozambiqueMap({ ocorrencias = [], height = 380 }) {
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
    ocorrencias.forEach(o => {
      if (!o.lat || !o.lng) return;
      const color = o.prioridade === 'Crítico' ? '#DC2626' : 
                    o.prioridade === 'Alto' ? '#EA580C' : 
                    o.prioridade === 'Médio' ? '#CA8A04' : '#16A34A';
      
      const icon = L.divIcon({ 
        className: '', 
        html: `<div style="background:${color};width:18px;height:18px;border-radius:50%;border:2px solid #fff;box-shadow:0 0 0 3px ${color}55;"></div>`, 
        iconSize: [18, 18], 
        iconAnchor: [9, 9] 
      });

      L.marker([o.lat, o.lng], { icon })
        .addTo(layerRef.current)
        .bindPopup(`<strong>${o.ref || o.id || ''}</strong><br/>${o.titulo || ''}<br/><em>${o.provincia || ''}</em>`);
    });

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
      if (onChange) {
        onChange({ lat, lng });
      }
    });

    return () => { 
      if (mapRef.current) { 
        mapRef.current.remove(); 
        mapRef.current = null; 
      } 
    };
  }, []);

  return <div ref={ref} style={{ height, width: '100%' }} className="rounded-xl overflow-hidden" />;
}
