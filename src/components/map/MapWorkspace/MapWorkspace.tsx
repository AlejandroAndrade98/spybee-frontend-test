'use client';

import { CreateIncidentModal } from '@/components/map/CreateIncidentModal/CreateIncidentModal';
import { MapDataPreview } from '@/components/map/MapDataPreview/MapDataPreview';
import { SpybeeMap } from '@/components/map/SpybeeMap/SpybeeMap';
import { useIncidentsStore } from '@/store/incidents.store';

import styles from './MapWorkspace.module.scss';

export function MapWorkspace() {
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
    <section className={styles.workspace} aria-label="Mapa de incidencias">
      <div className={styles.topBar}>
        <div>
          <p className={styles.breadcrumb}>Mis Proyectos / Proyecto Onboarding</p>
          <h1>Mapa de incidencias</h1>
        </div>

        <div className={styles.actions}>
          <button type="button">Filtros</button>
          <button type="button">Informes</button>
          <button
            className={styles.primary}
            onClick={startIncidentCreation}
            type="button"
          >
            + Crear incidencia
          </button>
        </div>
      </div>

      <div className={styles.mapFrame}>
        <SpybeeMap />
        {isPickingLocation ? (
          <div className={styles.pickBanner} role="status">
            <strong>Haz clic en el mapa para ubicar la incidencia</strong>
            <button onClick={cancelIncidentCreation} type="button">
              Cancelar
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
