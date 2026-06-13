import type { Incident } from '@/types/incident';
import { isPastDate } from '@/utils/date';
import {
  getIncidentMediaCount,
  getIncidentOwnerId,
  getIncidentOwnerName,
  getIncidentTypeKey,
  getIncidentTypeName,
} from '@/utils/incidentAccessors';

export type SummaryItem = {
  label: string;
  value: number;
};

type StatusLabels = {
  open: string;
  closed: string;
  on_pause: string;
};

type PriorityLabels = {
  high: string;
  medium: string;
  low: string;
};

export function isIncidentOverdue(incident: Incident, now = new Date()) {
  return incident.status !== 'closed' && isPastDate(incident.dueDate, now);
}

export function getIncidentMetrics(
  incidents: Incident[],
  createdIncidentIds: Set<string>,
  now = new Date(),
) {
  return {
    total: incidents.length,
    open: incidents.filter((incident) => incident.status === 'open').length,
    closed: incidents.filter((incident) => incident.status === 'closed').length,
    onPause: incidents.filter((incident) => incident.status === 'on_pause').length,
    highPriority: incidents.filter((incident) => incident.priority === 'high')
      .length,
    overdue: incidents.filter((incident) => isIncidentOverdue(incident, now))
      .length,
    withMedia: incidents.filter((incident) => getIncidentMediaCount(incident) > 0)
      .length,
    createdLocally: incidents.filter((incident) => createdIncidentIds.has(incident.id))
      .length,
  };
}

function countBy<T extends string>(
  incidents: Incident[],
  getKey: (incident: Incident) => T,
  getLabel: (key: T) => string,
) {
  const counts = new Map<T, number>();

  incidents.forEach((incident) => {
    const key = getKey(incident);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  });

  return [...counts.entries()]
    .map(([key, value]) => ({
      label: getLabel(key),
      value,
    }))
    .sort((a, b) => b.value - a.value);
}

export function getStatusSummary(
  incidents: Incident[],
  labels: StatusLabels = {
    open: 'Abierta',
    closed: 'Cerrada',
    on_pause: 'En pausa',
  },
): SummaryItem[] {
  return countBy(incidents, (incident) => incident.status, (status) => {
    if (status === 'open') {
      return labels.open;
    }

    if (status === 'closed') {
      return labels.closed;
    }

    return labels.on_pause;
  });
}

export function getPrioritySummary(
  incidents: Incident[],
  labels: PriorityLabels = {
    high: 'Alta',
    medium: 'Media',
    low: 'Baja',
  },
): SummaryItem[] {
  return countBy(incidents, (incident) => incident.priority, (priority) => {
    if (priority === 'high') {
      return labels.high;
    }

    if (priority === 'medium') {
      return labels.medium;
    }

    return labels.low;
  });
}

export function getTypeSummary(incidents: Incident[]): SummaryItem[] {
  return countBy(
    incidents,
    getIncidentTypeKey,
    (typeKey) => {
      const incident = incidents.find(
        (incident) => getIncidentTypeKey(incident) === typeKey,
      );

      return incident ? getIncidentTypeName(incident) : typeKey;
    },
  );
}

export function getOwnerSummary(incidents: Incident[]): SummaryItem[] {
  return countBy(
    incidents,
    getIncidentOwnerId,
    (ownerId) => {
      const incident = incidents.find(
        (incident) => getIncidentOwnerId(incident) === ownerId,
      );

      return incident ? getIncidentOwnerName(incident) : 'Sin responsable';
    },
  );
}
