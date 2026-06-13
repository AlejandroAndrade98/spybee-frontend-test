'use client';

import mapboxgl, { type LngLatBoundsLike, type Marker } from 'mapbox-gl';
import { useEffect, useMemo, useRef } from 'react';

import { useIncidentsStore } from '@/store/incidents.store';
import type { Incident } from '@/types/incident';

import styles from './SpybeeMap.module.scss';

const DEFAULT_CENTER: [number, number] = [-74.0721, 4.711];

function hasValidCoordinates(incident: Incident) {
  return (
    Number.isFinite(incident.coordinates?.lat) &&
    Number.isFinite(incident.coordinates?.lng)
  );
}

function getPriorityLabel(priority: Incident['priority']) {
  const labels: Record<Incident['priority'], string> = {
    high: 'Alta',
    medium: 'Media',
    low: 'Baja',
  };

  return labels[priority];
}

function getStatusLabel(status: Incident['status']) {
  const labels: Record<Incident['status'], string> = {
    open: 'Abierta',
    closed: 'Cerrada',
    on_pause: 'Pausada',
  };

  return labels[status];
}

function createPopupContent(incident: Incident) {
  const content = document.createElement('article');
  content.className = styles.popup;

  const title = document.createElement('h2');
  title.textContent = incident.title;

  const details = document.createElement('dl');

  const rows = [
    ['Prioridad', getPriorityLabel(incident.priority)],
    ['Estado', getStatusLabel(incident.status)],
    ['Ubicacion', incident.locationDescription],
  ];

  rows.forEach(([term, description]) => {
    const dt = document.createElement('dt');
    dt.textContent = term;

    const dd = document.createElement('dd');
    dd.textContent = description || 'Sin ubicacion';

    details.append(dt, dd);
  });

  content.append(title, details);

  return content;
}

function setMapCursor(map: mapboxgl.Map, cursor: string) {
  const canvas = map.getCanvas?.();

  if (canvas) {
    canvas.style.cursor = cursor;
  }
}

export function SpybeeMap() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<Marker[]>([]);
  const popupsRef = useRef<mapboxgl.Popup[]>([]);
  const navigationControlRef = useRef<mapboxgl.NavigationControl | null>(null);
  const hasFitBoundsRef = useRef(false);

  const baseIncidents = useIncidentsStore((state) => state.baseIncidents);
  const createdIncidents = useIncidentsStore((state) => state.createdIncidents);
  const includeDeleted = useIncidentsStore(
    (state) => state.filters.includeDeleted,
  );
  const loadIncidents = useIncidentsStore((state) => state.loadIncidents);
  const selectIncident = useIncidentsStore((state) => state.selectIncident);
  const isPickingLocation = useIncidentsStore(
    (state) => state.isPickingLocation,
  );
  const setCreationCoordinates = useIncidentsStore(
    (state) => state.setCreationCoordinates,
  );
  const openCreateModal = useIncidentsStore((state) => state.openCreateModal);

  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

  const visibleIncidents = useMemo(() => {
    const incidents = [...createdIncidents, ...baseIncidents];

    if (includeDeleted) {
      return incidents.filter(hasValidCoordinates);
    }

    return incidents.filter(
      (incident) => !incident.deleted && hasValidCoordinates(incident),
    );
  }, [baseIncidents, createdIncidents, includeDeleted]);

  useEffect(() => {
    void loadIncidents();
  }, [loadIncidents]);

  useEffect(() => {
    if (!token || mapRef.current || !containerRef.current) {
      return;
    }

    mapboxgl.accessToken = token;

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: DEFAULT_CENTER,
      zoom: 15,
    });

    const navigationControl = new mapboxgl.NavigationControl();

    map.addControl(navigationControl, 'top-right');
    mapRef.current = map;
    navigationControlRef.current = navigationControl;

    return () => {
      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current = [];
      popupsRef.current.forEach((popup) => popup.remove());
      popupsRef.current = [];
      navigationControlRef.current = null;
      map.remove();
      mapRef.current = null;
      hasFitBoundsRef.current = false;
    };
  }, [token]);

  useEffect(() => {
    const map = mapRef.current;

    if (!map) {
      return;
    }

    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];
    popupsRef.current.forEach((popup) => popup.remove());
    popupsRef.current = [];

    markersRef.current = visibleIncidents.map((incident) => {
      const element = document.createElement('button');
      element.type = 'button';
      element.className = `${styles.marker} ${styles[incident.priority]}`;
      element.setAttribute('aria-label', `Seleccionar ${incident.title}`);

      element.addEventListener('click', (event) => {
        event.stopPropagation();
        selectIncident(incident.id);
      });

      const popup = new mapboxgl.Popup({
        closeButton: true,
        closeOnClick: true,
        offset: 18,
      }).setDOMContent(createPopupContent(incident));

      popupsRef.current.push(popup);

      return new mapboxgl.Marker({ element })
        .setLngLat([incident.coordinates.lng, incident.coordinates.lat])
        .setPopup(popup)
        .addTo(map);
    });

    if (visibleIncidents.length > 0 && !hasFitBoundsRef.current) {
      const bounds = new mapboxgl.LngLatBounds();

      visibleIncidents.forEach((incident) => {
        bounds.extend([incident.coordinates.lng, incident.coordinates.lat]);
      });

      map.fitBounds(bounds as LngLatBoundsLike, {
        maxZoom: 16,
        padding: 80,
      });
      hasFitBoundsRef.current = true;
    }
  }, [selectIncident, visibleIncidents]);

  useEffect(() => {
    const map = mapRef.current;

    if (!map) {
      return;
    }

    setMapCursor(map, isPickingLocation ? 'crosshair' : '');

    return () => {
      setMapCursor(map, '');
    };
  }, [isPickingLocation]);

  useEffect(() => {
    const map = mapRef.current;

    if (!map || !isPickingLocation) {
      return;
    }

    function handleMapClick(event: mapboxgl.MapMouseEvent) {
      setCreationCoordinates({
        lat: event.lngLat.lat,
        lng: event.lngLat.lng,
      });
      openCreateModal();
    }

    map.on('click', handleMapClick);

    return () => {
      map.off('click', handleMapClick);
    };
  }, [isPickingLocation, openCreateModal, setCreationCoordinates]);

  if (!token) {
    return (
      <div className={styles.fallback} role="status">
        <strong>Falta configurar Mapbox</strong>
        <span>
          Agrega NEXT_PUBLIC_MAPBOX_TOKEN en el archivo .env.local para cargar
          el mapa real.
        </span>
      </div>
    );
  }

  return <div ref={containerRef} className={styles.map} aria-label="Mapa" />;
}
