'use client';

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
    <section className={styles.filters} aria-label="Filtros del dashboard">
      <div className={styles.search}>
        <label htmlFor="dashboard-search">Buscar</label>
        <input
          id="dashboard-search"
          onChange={(event) => updateFilter('search', event.target.value)}
          placeholder="Titulo, ubicacion, responsable o categoria"
          type="search"
          value={filters.search}
        />
      </div>

      <div className={styles.field}>
        <label htmlFor="dashboard-project">Proyecto</label>
        <select
          id="dashboard-project"
          onChange={(event) => updateFilter('projectId', event.target.value)}
          value={filters.projectId}
        >
          <option value="all">Todos</option>
          {projects.map((project) => (
            <option key={project.id} value={project.id}>
              {project.name}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.field}>
        <label htmlFor="dashboard-status">Estado</label>
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
          <option value="all">Todos</option>
          <option value="open">Abierta</option>
          <option value="closed">Cerrada</option>
          <option value="on_pause">En pausa</option>
        </select>
      </div>

      <div className={styles.field}>
        <label htmlFor="dashboard-priority">Prioridad</label>
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
          <option value="all">Todas</option>
          <option value="high">Alta</option>
          <option value="medium">Media</option>
          <option value="low">Baja</option>
        </select>
      </div>

      <div className={styles.field}>
        <label htmlFor="dashboard-type">Categoria</label>
        <select
          id="dashboard-type"
          onChange={(event) => updateFilter('typeKey', event.target.value)}
          value={filters.typeKey}
        >
          <option value="all">Todas</option>
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
        <span>Incluir eliminadas</span>
      </label>

      <button className={styles.resetButton} onClick={onReset} type="button">
        Limpiar
      </button>
    </section>
  );
}
