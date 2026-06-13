'use client';

import { useTranslations } from '@/i18n/useTranslations';
import type {
  DashboardIncidentFilters,
} from '@/utils/incidentFilters';

import styles from './DashboardFilters.module.scss';

type Option = {
  id?: string;
  key?: string;
  name: string;
};

type DashboardFiltersProps = {
  filters: DashboardIncidentFilters;
  projects: Option[];
  types: Option[];
  onChange: (filters: DashboardIncidentFilters) => void;
  onReset: () => void;
};

export function DashboardFilters({
  filters,
  projects,
  types,
  onChange,
  onReset,
}: DashboardFiltersProps) {
  const t = useTranslations();

  function updateFilter<Key extends keyof DashboardIncidentFilters>(
    key: Key,
    value: DashboardIncidentFilters[Key],
  ) {
    onChange({
      ...filters,
      [key]: value,
    });
  }

  return (
    <section className={styles.filters} aria-label={t('filters.label')}>
      <div className={styles.search}>
        <label htmlFor="dashboard-search">{t('filters.search')}</label>
        <input
          id="dashboard-search"
          onChange={(event) => updateFilter('search', event.target.value)}
          placeholder={t('filters.searchPlaceholder')}
          type="search"
          value={filters.search}
        />
      </div>

      <div className={styles.field}>
        <label htmlFor="dashboard-project">{t('filters.project')}</label>
        <select
          id="dashboard-project"
          onChange={(event) => updateFilter('projectId', event.target.value)}
          value={filters.projectId}
        >
          <option value="all">{t('filters.all')}</option>
          {projects.map((project) => (
            <option key={project.id} value={project.id}>
              {project.name}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.field}>
        <label htmlFor="dashboard-status">{t('filters.status')}</label>
        <select
          id="dashboard-status"
          onChange={(event) =>
            updateFilter(
              'status',
              event.target.value as DashboardIncidentFilters['status'],
            )
          }
          value={filters.status}
        >
          <option value="all">{t('filters.all')}</option>
          <option value="open">{t('status.open')}</option>
          <option value="closed">{t('status.closed')}</option>
          <option value="on_pause">{t('status.on_pause')}</option>
        </select>
      </div>

      <div className={styles.field}>
        <label htmlFor="dashboard-priority">{t('filters.priority')}</label>
        <select
          id="dashboard-priority"
          onChange={(event) =>
            updateFilter(
              'priority',
              event.target.value as DashboardIncidentFilters['priority'],
            )
          }
          value={filters.priority}
        >
          <option value="all">{t('filters.allFemale')}</option>
          <option value="high">{t('priority.high')}</option>
          <option value="medium">{t('priority.medium')}</option>
          <option value="low">{t('priority.low')}</option>
        </select>
      </div>

      <div className={styles.field}>
        <label htmlFor="dashboard-type">{t('filters.category')}</label>
        <select
          id="dashboard-type"
          onChange={(event) => updateFilter('typeKey', event.target.value)}
          value={filters.typeKey}
        >
          <option value="all">{t('filters.allFemale')}</option>
          {types.map((type) => (
            <option key={type.key} value={type.key}>
              {type.name}
            </option>
          ))}
        </select>
      </div>

      <label className={styles.toggle}>
        <input
          checked={filters.includeDeleted}
          onChange={(event) =>
            updateFilter('includeDeleted', event.target.checked)
          }
          type="checkbox"
        />
        <span>{t('filters.includeDeleted')}</span>
      </label>

      <button className={styles.resetButton} onClick={onReset} type="button">
        {t('common.clean')}
      </button>
    </section>
  );
}
