'use client';

import { useEffect, useMemo, useState } from 'react';

import { DashboardFilters } from '@/components/dashboard/DashboardFilters/DashboardFilters';
import { IncidentsTable } from '@/components/dashboard/IncidentsTable/IncidentsTable';
import { MetricCard } from '@/components/dashboard/MetricCard/MetricCard';
import { SummaryCard } from '@/components/dashboard/SummaryCard/SummaryCard';
import { useIncidentsStore } from '@/store/incidents.store';
import {
  DEFAULT_DASHBOARD_FILTERS,
  filterIncidents,
  getDashboardFilterOptions,
  type DashboardIncidentFilters,
} from '@/utils/incidentFilters';
import {
  getIncidentMetrics,
  getOwnerSummary,
  getPrioritySummary,
  getStatusSummary,
  getTypeSummary,
} from '@/utils/incidentMetrics';

import styles from './DashboardWorkspace.module.scss';

export function DashboardWorkspace() {
  const baseIncidents = useIncidentsStore((state) => state.baseIncidents);
  const createdIncidents = useIncidentsStore((state) => state.createdIncidents);
  const status = useIncidentsStore((state) => state.status);
  const error = useIncidentsStore((state) => state.error);
  const source = useIncidentsStore((state) => state.source);
  const loadIncidents = useIncidentsStore((state) => state.loadIncidents);

  const [filters, setFilters] = useState<DashboardIncidentFilters>(
    DEFAULT_DASHBOARD_FILTERS,
  );

  useEffect(() => {
    void loadIncidents();
  }, [loadIncidents]);

  const allIncidents = useMemo(
    () => [...createdIncidents, ...baseIncidents],
    [baseIncidents, createdIncidents],
  );

  const createdIncidentIds = useMemo(
    () => new Set(createdIncidents.map((incident) => incident.id)),
    [createdIncidents],
  );

  const filterOptions = useMemo(
    () => getDashboardFilterOptions(allIncidents),
    [allIncidents],
  );

  const filteredIncidents = useMemo(
    () => filterIncidents(allIncidents, filters),
    [allIncidents, filters],
  );

  const sortedIncidents = useMemo(
    () => [...filteredIncidents].sort((a, b) => b.order - a.order),
    [filteredIncidents],
  );

  const metrics = useMemo(
    () => getIncidentMetrics(filteredIncidents, createdIncidentIds),
    [createdIncidentIds, filteredIncidents],
  );

  const statusSummary = useMemo(
    () => getStatusSummary(filteredIncidents),
    [filteredIncidents],
  );
  const prioritySummary = useMemo(
    () => getPrioritySummary(filteredIncidents),
    [filteredIncidents],
  );
  const typeSummary = useMemo(
    () => getTypeSummary(filteredIncidents),
    [filteredIncidents],
  );
  const ownerSummary = useMemo(
    () => getOwnerSummary(filteredIncidents),
    [filteredIncidents],
  );

  const isLoading = status === 'idle' || status === 'loading';
  const hasAnyData = allIncidents.length > 0;

  if (isLoading && !hasAnyData) {
    return (
      <section className={styles.workspace} aria-labelledby="dashboard-title">
        <Header source={source} />
        <div className={styles.stateCard}>Cargando incidencias...</div>
      </section>
    );
  }

  if (status === 'error' && !hasAnyData) {
    return (
      <section className={styles.workspace} aria-labelledby="dashboard-title">
        <Header source={source} />
        <div className={styles.stateCard}>
          <strong>No se pudieron cargar las incidencias.</strong>
          <span>{error}</span>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.workspace} aria-labelledby="dashboard-title">
      <Header source={source} />

      <DashboardFilters
        filters={filters}
        onChange={setFilters}
        onReset={() => setFilters(DEFAULT_DASHBOARD_FILTERS)}
        projects={filterOptions.projects}
        types={filterOptions.types}
      />

      <div className={styles.metricsGrid} aria-label="KPIs principales">
        <MetricCard
          detail="segun filtros activos"
          label="Total visibles"
          value={metrics.total}
        />
        <MetricCard
          detail="estado actual"
          label="Abiertas"
          tone="green"
          value={metrics.open}
        />
        <MetricCard
          detail="cerradas"
          label="Cerradas"
          tone="blue"
          value={metrics.closed}
        />
        <MetricCard
          detail="requieren seguimiento"
          label="En pausa"
          tone="yellow"
          value={metrics.onPause}
        />
        <MetricCard
          detail="prioridad alta"
          label="Alta prioridad"
          tone="red"
          value={metrics.highPriority}
        />
        <MetricCard
          detail="no cerradas con fecha vencida"
          label="Vencidas"
          tone="red"
          value={metrics.overdue}
        />
        <MetricCard
          detail="con imagenes o videos"
          label="Con evidencias"
          tone="blue"
          value={metrics.withMedia}
        />
        <MetricCard
          detail="guardadas en este navegador"
          label="Creadas localmente"
          tone="yellow"
          value={metrics.createdLocally}
        />
      </div>

      <div className={styles.summaryGrid}>
        <SummaryCard
          description="Distribucion del avance"
          items={statusSummary}
          title="Por estado"
        />
        <SummaryCard
          description="Riesgo operativo"
          items={prioritySummary}
          title="Por prioridad"
        />
        <SummaryCard
          description="Tipos de incidencia mas frecuentes"
          items={typeSummary}
          title="Por categoria"
        />
        <SummaryCard
          description="Quien reporta o responde mas casos"
          items={ownerSummary}
          title="Por responsable"
        />
      </div>

      <IncidentsTable
        createdIncidentIds={createdIncidentIds}
        incidents={sortedIncidents}
      />
    </section>
  );
}

function Header({ source }: { source: string | null }) {
  return (
    <header className={styles.header}>
      <div>
        <p>Mis Proyectos / Proyecto Onboarding / Incidencias</p>
        <h1 id="dashboard-title">Dashboard de incidencias</h1>
      </div>

      <span className={styles.sourcePill}>
        Fuente: {source ?? 'pendiente'}
      </span>
    </header>
  );
}
