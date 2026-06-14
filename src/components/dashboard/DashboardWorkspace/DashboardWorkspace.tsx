'use client';

import { useEffect, useMemo, useState } from 'react';

import { AdvancedStatsView } from '@/components/dashboard/AdvancedStatsView/AdvancedStatsView';
import { DashboardFilters } from '@/components/dashboard/DashboardFilters/DashboardFilters';
import {
  DashboardViewToggle,
  type DashboardViewMode,
} from '@/components/dashboard/DashboardViewToggle/DashboardViewToggle';
import { IncidentsTable } from '@/components/dashboard/IncidentsTable/IncidentsTable';
import { MetricCard } from '@/components/dashboard/MetricCard/MetricCard';
import { SummaryCard } from '@/components/dashboard/SummaryCard/SummaryCard';
import { useTranslations } from '@/i18n/useTranslations';
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
  const t = useTranslations();
  const baseIncidents = useIncidentsStore((state) => state.baseIncidents);
  const createdIncidents = useIncidentsStore((state) => state.createdIncidents);
  const status = useIncidentsStore((state) => state.status);
  const error = useIncidentsStore((state) => state.error);
  const source = useIncidentsStore((state) => state.source);
  const loadIncidents = useIncidentsStore((state) => state.loadIncidents);

  const [filters, setFilters] = useState<DashboardIncidentFilters>(
    DEFAULT_DASHBOARD_FILTERS,
  );
  const [viewMode, setViewMode] = useState<DashboardViewMode>('summary');

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
    () =>
      getStatusSummary(filteredIncidents, {
        open: t('status.open'),
        closed: t('status.closed'),
        on_pause: t('status.on_pause'),
      }),
    [filteredIncidents, t],
  );
  const prioritySummary = useMemo(
    () =>
      getPrioritySummary(filteredIncidents, {
        high: t('priority.high'),
        medium: t('priority.medium'),
        low: t('priority.low'),
      }),
    [filteredIncidents, t],
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
        <div className={styles.stateCard}>{t('common.loadingIncidents')}</div>
      </section>
    );
  }

  if (status === 'error' && !hasAnyData) {
    return (
      <section className={styles.workspace} aria-labelledby="dashboard-title">
        <Header source={source} />
        <div className={styles.stateCard}>
          <strong>{t('dashboard.loadError')}</strong>
          <span>{error}</span>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.workspace} aria-labelledby="dashboard-title">
      <Header source={source} />

      <div className={styles.viewToolbar}>
        <DashboardViewToggle onChange={setViewMode} value={viewMode} />
      </div>

      <DashboardFilters
        filters={filters}
        onChange={setFilters}
        onReset={() => setFilters(DEFAULT_DASHBOARD_FILTERS)}
        projects={filterOptions.projects}
        types={filterOptions.types}
      />

      {viewMode === 'summary' ? (
        <>
          <div className={styles.metricsGrid} aria-label={t('dashboard.kpis')}>
            <MetricCard
              detail={t('dashboard.filteredDetail')}
              label={t('dashboard.totalVisible')}
              value={metrics.total}
            />
            <MetricCard
              detail={t('dashboard.currentStatus')}
              label={t('dashboard.open')}
              tone="green"
              value={metrics.open}
            />
            <MetricCard
              detail={t('dashboard.closedDetail')}
              label={t('dashboard.closed')}
              tone="blue"
              value={metrics.closed}
            />
            <MetricCard
              detail={t('dashboard.followUp')}
              label={t('dashboard.onPause')}
              tone="yellow"
              value={metrics.onPause}
            />
            <MetricCard
              detail={t('dashboard.highPriorityDetail')}
              label={t('dashboard.highPriority')}
              tone="red"
              value={metrics.highPriority}
            />
            <MetricCard
              detail={t('dashboard.overdueDetail')}
              label={t('dashboard.overdue')}
              tone="red"
              value={metrics.overdue}
            />
            <MetricCard
              detail={t('dashboard.withMediaDetail')}
              label={t('dashboard.withMedia')}
              tone="blue"
              value={metrics.withMedia}
            />
            <MetricCard
              detail={t('dashboard.localDetail')}
              label={t('dashboard.createdLocally')}
              tone="yellow"
              value={metrics.createdLocally}
            />
          </div>

          <div className={styles.summaryGrid}>
            <SummaryCard
              description={t('dashboard.statusDescription')}
              items={statusSummary}
              title={t('dashboard.byStatus')}
            />
            <SummaryCard
              description={t('dashboard.priorityDescription')}
              items={prioritySummary}
              title={t('dashboard.byPriority')}
            />
            <SummaryCard
              description={t('dashboard.categoryDescription')}
              items={typeSummary}
              title={t('dashboard.byCategory')}
            />
            <SummaryCard
              description={t('dashboard.ownerDescription')}
              items={ownerSummary}
              title={t('dashboard.byOwner')}
            />
          </div>

          <IncidentsTable
            createdIncidentIds={createdIncidentIds}
            incidents={sortedIncidents}
          />
        </>
      ) : (
        <AdvancedStatsView incidents={filteredIncidents} />
      )}
    </section>
  );
}

function Header({ source }: { source: string | null }) {
  const t = useTranslations();

  return (
    <header className={styles.header}>
      <div>
        <p>{t('common.incidentsTrail')}</p>
        <h1 id="dashboard-title">{t('dashboard.title')}</h1>
      </div>

      <span className={styles.sourcePill}>
        {t('common.source')}: {source ?? t('common.pending')}
      </span>
    </header>
  );
}
