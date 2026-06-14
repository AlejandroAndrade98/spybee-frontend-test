import type { Incident } from '@/types/incident';
import { isPastDate } from '@/utils/date';
import {
  getIncidentMediaCount,
  getIncidentOwnerId,
  getIncidentOwnerName,
  getIncidentTypeKey,
  getIncidentTypeName,
} from '@/utils/incidentAccessors';
import { isIncidentOverdue } from '@/utils/incidentMetrics';

export type TrendPoint = {
  key: string;
  label: string;
  created: number;
  closed: number;
  backlog: number;
};

export type DistributionItem = {
  label: string;
  value: number;
};

export type TeamPerformanceItem = {
  id: string;
  name: string;
  total: number;
  open: number;
  closed: number;
  overdue: number;
  closureRate: number;
};

export type RiskStats = {
  highPriorityOpen: number;
  overdue: number;
  withoutMedia: number;
  onPause: number;
  closedLate: number;
};

export type DashboardStats = {
  trend: TrendPoint[];
  categories: DistributionItem[];
  tags: DistributionItem[];
  team: TeamPerformanceItem[];
  risks: RiskStats;
};

function getMonthKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

function getMonthLabel(date: Date, locale: string) {
  return new Intl.DateTimeFormat(locale, {
    month: 'short',
    year: '2-digit',
  }).format(date);
}

function getMonthBuckets(incidents: Incident[], locale: string) {
  const dates = incidents
    .flatMap((incident) => [incident.createdAt, incident.closingDate])
    .filter(Boolean)
    .map((date) => new Date(date as string))
    .filter((date) => !Number.isNaN(date.getTime()));

  const latestDate =
    dates.length > 0
      ? new Date(Math.max(...dates.map((date) => date.getTime())))
      : new Date();
  const latestMonth = new Date(
    latestDate.getFullYear(),
    latestDate.getMonth(),
    1,
  );

  return Array.from({ length: 6 }, (_, index) => {
    const date = new Date(
      latestMonth.getFullYear(),
      latestMonth.getMonth() - (5 - index),
      1,
    );

    return {
      key: getMonthKey(date),
      label: getMonthLabel(date, locale),
      created: 0,
      closed: 0,
      backlog: 0,
    };
  });
}

function getTrend(incidents: Incident[], locale: string): TrendPoint[] {
  const buckets = getMonthBuckets(incidents, locale);
  const bucketMap = new Map(buckets.map((bucket) => [bucket.key, bucket]));
  const firstBucket = buckets[0];
  let openingBacklog = 0;

  incidents.forEach((incident) => {
    const createdAt = new Date(incident.createdAt);
    const createdKey = Number.isNaN(createdAt.getTime())
      ? null
      : getMonthKey(createdAt);
    const closedAt = incident.closingDate
      ? new Date(incident.closingDate)
      : null;
    const closedKey =
      closedAt && !Number.isNaN(closedAt.getTime())
        ? getMonthKey(closedAt)
        : null;

    if (createdKey && bucketMap.has(createdKey)) {
      bucketMap.get(createdKey)!.created += 1;
    }

    if (closedKey && bucketMap.has(closedKey)) {
      bucketMap.get(closedKey)!.closed += 1;
    }

    if (firstBucket && createdKey && createdKey < firstBucket.key) {
      openingBacklog += 1;
    }

    if (firstBucket && closedKey && closedKey < firstBucket.key) {
      openingBacklog -= 1;
    }
  });

  let backlog = Math.max(openingBacklog, 0);

  return buckets.map((bucket) => {
    backlog = Math.max(backlog + bucket.created - bucket.closed, 0);

    return {
      ...bucket,
      backlog,
    };
  });
}

function getCountSummary(
  incidents: Incident[],
  getKey: (incident: Incident) => string,
  getLabel: (incident: Incident) => string,
  maxItems = 6,
): DistributionItem[] {
  const items = new Map<string, DistributionItem>();

  incidents.forEach((incident) => {
    const key = getKey(incident);
    const current = items.get(key);

    items.set(key, {
      label: current?.label ?? getLabel(incident),
      value: (current?.value ?? 0) + 1,
    });
  });

  return [...items.values()]
    .sort((a, b) => b.value - a.value)
    .slice(0, maxItems);
}

function getTagSummary(incidents: Incident[]) {
  const tags = new Map<string, DistributionItem>();

  incidents.forEach((incident) => {
    incident.tags?.forEach((tag) => {
      const current = tags.get(tag.id);

      tags.set(tag.id, {
        label: current?.label ?? tag.name,
        value: (current?.value ?? 0) + 1,
      });
    });
  });

  return [...tags.values()].sort((a, b) => b.value - a.value).slice(0, 8);
}

function getTeamPerformance(incidents: Incident[]) {
  const owners = new Map<string, TeamPerformanceItem>();

  incidents.forEach((incident) => {
    const ownerId = getIncidentOwnerId(incident);
    const current = owners.get(ownerId) ?? {
      id: ownerId,
      name: getIncidentOwnerName(incident),
      total: 0,
      open: 0,
      closed: 0,
      overdue: 0,
      closureRate: 0,
    };

    current.total += 1;
    current.open += incident.status === 'open' ? 1 : 0;
    current.closed += incident.status === 'closed' ? 1 : 0;
    current.overdue += isIncidentOverdue(incident) ? 1 : 0;
    current.closureRate =
      current.total > 0 ? Math.round((current.closed / current.total) * 100) : 0;

    owners.set(ownerId, current);
  });

  return [...owners.values()]
    .sort((a, b) => b.total - a.total || b.closed - a.closed)
    .slice(0, 5);
}

function isClosedLate(incident: Incident) {
  if (
    incident.status !== 'closed' ||
    !incident.dueDate ||
    !incident.closingDate
  ) {
    return false;
  }

  return isPastDate(incident.dueDate, new Date(incident.closingDate));
}

function getRiskStats(incidents: Incident[]): RiskStats {
  return {
    highPriorityOpen: incidents.filter(
      (incident) => incident.priority === 'high' && incident.status !== 'closed',
    ).length,
    overdue: incidents.filter((incident) => isIncidentOverdue(incident)).length,
    withoutMedia: incidents.filter(
      (incident) => getIncidentMediaCount(incident) === 0,
    ).length,
    onPause: incidents.filter((incident) => incident.status === 'on_pause')
      .length,
    closedLate: incidents.filter(isClosedLate).length,
  };
}

export function getDashboardStats(
  incidents: Incident[],
  locale: string,
): DashboardStats {
  return {
    trend: getTrend(incidents, locale),
    categories: getCountSummary(
      incidents,
      getIncidentTypeKey,
      getIncidentTypeName,
    ),
    tags: getTagSummary(incidents),
    team: getTeamPerformance(incidents),
    risks: getRiskStats(incidents),
  };
}
