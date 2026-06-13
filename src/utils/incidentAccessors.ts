import type { Incident } from '@/types/incident';

export function getIncidentProjectId(incident: Incident) {
  return incident.project?.id ?? 'sin-proyecto';
}

export function getIncidentProjectName(incident: Incident) {
  return incident.project?.name ?? 'Sin proyecto';
}

export function getIncidentTypeKey(incident: Incident) {
  return incident.type?.key ?? 'sin-categoria';
}

export function getIncidentTypeName(incident: Incident) {
  return incident.type?.name ?? 'Sin categoria';
}

export function getIncidentOwnerId(incident: Incident) {
  return incident.owner?.id ?? 'sin-responsable';
}

export function getIncidentOwnerName(incident: Incident) {
  return incident.owner?.name ?? 'Sin responsable';
}

export function getIncidentMediaCount(incident: Incident) {
  return incident.media?.length ?? 0;
}

export function getIncidentSequenceId(incident: Incident) {
  return incident.sequenceId || String(incident.order || 0).padStart(4, '0');
}
