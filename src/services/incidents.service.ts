import type { Incident } from '@/types/incident';

export type IncidentsResponse = {
  data: Incident[];
  source: 'remote' | 'local';
};

export async function getIncidents(): Promise<IncidentsResponse> {
  const response = await fetch('/api/incidents', {
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error('Unable to load incidents');
  }

  return response.json() as Promise<IncidentsResponse>;
}