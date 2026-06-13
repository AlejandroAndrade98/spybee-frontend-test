import { MapDataPreview } from '@/components/map/MapDataPreview/MapDataPreview';
import { SpybeeMap } from '@/components/map/SpybeeMap/SpybeeMap';

import styles from './MapWorkspace.module.scss';

export function MapWorkspace() {
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
          <button type="button" className={styles.primary}>
            + Crear incidencia
          </button>
        </div>
      </div>

      <div className={styles.mapFrame}>
        <SpybeeMap />
        <div className={styles.mapOverlay}>
          <MapDataPreview />
        </div>
      </div>
    </section>
  );
}
