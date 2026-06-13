import { AppShell } from '@/components/layout/AppShell/AppShell';

import styles from './dashboard.module.scss';

export default function DashboardPage() {
  return (
    <AppShell activeView="dashboard">
      <section className={styles.dashboard} aria-labelledby="dashboard-title">
        <div className={styles.header}>
          <div>
            <p>Mis Proyectos / Proyecto Onboarding / Incidencias</p>
            <h1 id="dashboard-title">Dashboard de incidencias</h1>
          </div>

          <span className={styles.datePill}>Ultimos 90 dias</span>
        </div>

        <div className={styles.summaryGrid} aria-label="Resumen general">
          <article className={`${styles.metricCard} ${styles.green}`}>
            <span>Abiertas</span>
            <strong>174</strong>
            <small>actualmente</small>
          </article>

          <article className={`${styles.metricCard} ${styles.blue}`}>
            <span>Creadas</span>
            <strong>35</strong>
            <small>en el periodo</small>
          </article>

          <article className={`${styles.metricCard} ${styles.red}`}>
            <span>Cerradas</span>
            <strong>3</strong>
            <small>en el periodo</small>
          </article>

          <article className={`${styles.metricCard} ${styles.yellow}`}>
            <span>Tasa de cierre</span>
            <strong>9%</strong>
            <small>cerradas / creadas</small>
          </article>
        </div>

        <div className={styles.contentGrid}>
          <article className={styles.panel}>
            <h2>Por estado</h2>
            <p>Placeholder visual para la proxima etapa del dashboard.</p>
            <div className={styles.donutMock} aria-hidden="true" />
          </article>

          <article className={styles.panel}>
            <h2>Por prioridad</h2>
            <p>Resumen temporal sin conectar graficas reales todavia.</p>
            <div className={styles.bars} aria-hidden="true">
              <div className={`${styles.bar} ${styles.barHigh}`}>
                <span>Alta</span>
                <span />
                <strong>30</strong>
              </div>
              <div className={`${styles.bar} ${styles.barMedium}`}>
                <span>Media</span>
                <span />
                <strong>4</strong>
              </div>
              <div className={`${styles.bar} ${styles.barLow}`}>
                <span>Baja</span>
                <span />
                <strong>1</strong>
              </div>
            </div>
          </article>
        </div>

        <article className={styles.widePanel}>
          <h2>Criticas para hoy</h2>
          <p>Tabla mock para reservar el espacio visual del reporte.</p>

          <div className={styles.tableMock} aria-hidden="true">
            <div className={styles.row}>
              <span>ID</span>
              <span>Titulo</span>
              <span>Prioridad</span>
              <span>Estado</span>
            </div>
            <div className={styles.row}>
              <span>#0010</span>
              <span>Falla en tejado</span>
              <span>Alta</span>
              <span>Abierta</span>
            </div>
            <div className={styles.row}>
              <span>#0013</span>
              <span>Problema de seguridad detectado</span>
              <span>Alta</span>
              <span>Abierta</span>
            </div>
          </div>
        </article>
      </section>
    </AppShell>
  );
}
