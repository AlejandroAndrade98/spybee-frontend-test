'use client';

import { useEffect, useMemo } from 'react';

import { useTranslations } from '@/i18n/useTranslations';
import { useIncidentsStore } from '@/store/incidents.store';

import styles from './MapDataPreview.module.scss';

export function MapDataPreview() {
  const t = useTranslations();
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
        <p>{t('common.loadingIncidents')}</p>
      </section>
    );
  }

  if (status === 'error') {
    return (
      <section className={styles.card}>
        <p>{t('preview.loadError')}</p>
        <small>{error}</small>
      </section>
    );
  }

  return (
    <section className={styles.card}>
      <span className={styles.label}>{t('preview.dataSource')}</span>
      <strong>{source}</strong>

      <span className={styles.label}>{t('preview.visibleIncidents')}</span>
      <strong>{visibleIncidentsCount}</strong>

      <span className={styles.label}>{t('preview.createdLocally')}</span>
      <strong>{createdIncidents.length}</strong>
    </section>
  );
}
