import type {
  Incident,
  IncidentPriority,
  IncidentStatus,
} from '@/types/incident';
import {
  getIncidentOwnerName,
  getIncidentProjectId,
  getIncidentProjectName,
  getIncidentTypeKey,
  getIncidentTypeName,
} from '@/utils/incidentAccessors';

export type DashboardIncidentFilters = {
  search: string;
  projectId: string;
  status: IncidentStatus | 'all';
  priority: IncidentPriority | 'all';
  typeKey: string;
  includeDeleted: boolean;
};

export const DEFAULT_DASHBOARD_FILTERS: DashboardIncidentFilters = {
  search: '',
  projectId: 'all',
  status: 'all',
  priority: 'all',
  typeKey: 'all',
  includeDeleted: false,
};

function normalize(value: string | null | undefined) {
  return (value ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

export function filterIncidents(
  incidents: Incident[],
  filters: DashboardIncidentFilters,
) {
  const search = normalize(filters.search.trim());

  return incidents.filter((incident) => {
    if (!filters.includeDeleted && incident.deleted) {
      return false;
    }

    if (
      filters.projectId !== 'all' &&
      getIncidentProjectId(incident) !== filters.projectId
    ) {
      return false;
    }

    if (filters.status !== 'all' && incident.status !== filters.status) {
      return false;
    }

    if (filters.priority !== 'all' && incident.priority !== filters.priority) {
      return false;
    }

    if (filters.typeKey !== 'all' && getIncidentTypeKey(incident) !== filters.typeKey) {
      return false;
    }

    if (!search) {
      return true;
    }

    const searchableText = [
      incident.title,
      incident.description,
      incident.locationDescription,
      getIncidentOwnerName(incident),
      getIncidentTypeName(incident),
    ]
      .map(normalize)
      .join(' ');

    return searchableText.includes(search);
  });
}

export function getDashboardFilterOptions(incidents: Incident[]) {
  const projects = new Map<string, string>();
  const types = new Map<string, string>();

  incidents.forEach((incident) => {
    projects.set(getIncidentProjectId(incident), getIncidentProjectName(incident));
    types.set(getIncidentTypeKey(incident), getIncidentTypeName(incident));
  });

  return {
    projects: [...projects.entries()].map(([id, name]) => ({ id, name })),
    types: [...types.entries()].map(([key, name]) => ({ key, name })),
  };
}
