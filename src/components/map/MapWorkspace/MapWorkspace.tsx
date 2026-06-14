'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { CreateIncidentModal } from '@/components/map/CreateIncidentModal/CreateIncidentModal';
import { MapDataPreview } from '@/components/map/MapDataPreview/MapDataPreview';
import { SpybeeMap } from '@/components/map/SpybeeMap/SpybeeMap';
import { useTranslations } from '@/i18n/useTranslations';
import { useIncidentsStore } from '@/store/incidents.store';

import styles from './MapWorkspace.module.scss';

export function MapWorkspace() {
  const t = useTranslations();
  const router = useRouter();
  const [isFilterHintOpen, setIsFilterHintOpen] = useState(false);
  const isPickingLocation = useIncidentsStore(
    (state) => state.isPickingLocation,
  );
  const startIncidentCreation = useIncidentsStore(
    (state) => state.startIncidentCreation,
  );
  const cancelIncidentCreation = useIncidentsStore(
    (state) => state.cancelIncidentCreation,
  );

  return (
    <section className={styles.workspace} aria-label={t('map.title')}>
      <div className={styles.topBar}>
        <div>
          <p className={styles.breadcrumb}>{t('common.projectTrail')}</p>
          <h1>{t('map.title')}</h1>
        </div>

        <div className={styles.actions}>
          <button
            aria-expanded={isFilterHintOpen}
            onClick={() => setIsFilterHintOpen((isOpen) => !isOpen)}
            type="button"
          >
            {t('map.filterMap')}
          </button>
          <button
            onClick={() => router.push('/dashboard?view=statistics')}
            type="button"
          >
            {t('map.statistics')}
          </button>
          <button
            className={styles.primary}
            onClick={startIncidentCreation}
            type="button"
          >
            {t('map.createIncident')}
          </button>
        </div>
      </div>

      {isFilterHintOpen ? (
        <div className={styles.filterHint} role="status">
          {t('map.filterHint')}
        </div>
      ) : null}

      <div className={styles.mapFrame}>
        <SpybeeMap />
        {isPickingLocation ? (
          <div className={styles.pickBanner} role="status">
            <strong>{t('map.pickLocation')}</strong>
            <button onClick={cancelIncidentCreation} type="button">
              {t('common.cancel')}
            </button>
          </div>
        ) : null}
        <div className={styles.mapOverlay}>
          <MapDataPreview />
        </div>
      </div>

      <CreateIncidentModal />
    </section>
  );
}
