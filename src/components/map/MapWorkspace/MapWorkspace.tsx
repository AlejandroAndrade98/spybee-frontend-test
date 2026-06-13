import { MapDataPreview } from '@/components/map/MapDataPreview/MapDataPreview';

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

      <div className={styles.mapMock}>
        <div className={styles.mapLayer} aria-hidden="true">
          <span className={`${styles.road} ${styles.roadOne}`}>Carrera 112</span>
          <span className={`${styles.road} ${styles.roadTwo}`}>Calle 78</span>
          <span className={`${styles.road} ${styles.roadThree}`}>
            Avenida Obra Norte
          </span>
          <span className={`${styles.zone} ${styles.zoneOne}`}>Parque Indigo</span>
          <span className={`${styles.zone} ${styles.zoneTwo}`}>Edificio 2</span>
          <span className={`${styles.zone} ${styles.zoneThree}`}>Surtiplaza</span>
        </div>

        <div className={styles.mapOverlay}>
          <MapDataPreview />
        </div>

        <div className={styles.mapControls} aria-hidden="true">
          <span>+</span>
          <span>-</span>
        </div>

        <span className={`${styles.marker} ${styles.high}`}>
          <span>Alta</span>
        </span>
        <span className={`${styles.marker} ${styles.medium}`}>
          <span>Media</span>
        </span>
        <span className={`${styles.marker} ${styles.low}`}>
          <span>Baja</span>
        </span>
      </div>
    </section>
  );
}
