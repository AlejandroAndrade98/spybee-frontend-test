'use client';

import { useEffect, useMemo } from 'react';

import { useIncidentsStore } from '@/store/incidents.store';

import styles from './MapDataPreview.module.scss';

export function MapDataPreview() {
  const baseIncidents = useIncidentsStore((state) => state.baseIncidents);
  const createdIncidents = useIncidentsStore((state) => state.createdIncidents);
  const filters = useIncidentsStore((state) => state.filters);
  const status = useIncidentsStore((state) => state.status);
  const error = useIncidentsStore((state) => state.error);
  const source = useIncidentsStore((state) => state.source);
  const loadIncidents = useIncidentsStore((state) => state.loadIncidents);

  useEffect(() => {
    void loadIncidents();
  }, [loadIncidents]);

  const visibleIncidentsCount = useMemo(() => {
    const incidents = [...createdIncidents, ...baseIncidents];

    if (filters.includeDeleted) {
      return incidents.length;
    }

    return incidents.filter((incident) => !incident.deleted).length;
  }, [baseIncidents, createdIncidents, filters.includeDeleted]);

  if (status === 'idle' || status === 'loading') {
    return (
      <section className={styles.card}>
        <p>Cargando incidencias...</p>
      </section>
    );
  }

  if (status === 'error') {
    return (
      <section className={styles.card}>
        <p>No se pudieron cargar las incidencias.</p>
        <small>{error}</small>
      </section>
    );
  }

  return (
    <section className={styles.card}>
      <span className={styles.label}>Data source</span>
      <strong>{source}</strong>

      <span className={styles.label}>Incidencias visibles</span>
      <strong>{visibleIncidentsCount}</strong>

      <span className={styles.label}>Creadas localmente</span>
      <strong>{createdIncidents.length}</strong>
    </section>
  );
}