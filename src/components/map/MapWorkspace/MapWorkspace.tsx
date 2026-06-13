import { MapDataPreview } from '@/components/map/MapDataPreview/MapDataPreview';

import styles from './MapWorkspace.module.scss';

export function MapWorkspace() {
  return (
    <section className={styles.workspace} aria-label="Mapa de incidencias">
      <div className={styles.topBar}>
        <div>
          <span className={styles.eyebrow}>Vista de proyecto</span>
          <h1>Mapa de incidencias</h1>
        </div>

        <div className={styles.actions}>
          <button type="button">Ver detalles</button>
          <button type="button">Comparar</button>
          <button type="button" className={styles.primary}>
            Nueva incidencia
          </button>
        </div>
      </div>

      <div className={styles.mapMock}>
        <div className={styles.mapOverlay}>
          <MapDataPreview />
        </div>

        <span className={`${styles.marker} ${styles.high}`} />
        <span className={`${styles.marker} ${styles.medium}`} />
        <span className={`${styles.marker} ${styles.low}`} />
      </div>
    </section>
  );
}