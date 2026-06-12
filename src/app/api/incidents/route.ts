import { readFile } from 'node:fs/promises';
import path from 'node:path';

import { NextResponse } from 'next/server';

import type { Incident } from '@/types/incident';

type IncidentsApiSource = 'remote' | 'local';

type IncidentsApiResponse = {
  data: Incident[];
  source: IncidentsApiSource;
};

const LOCAL_INCIDENTS_PATH = path.join(
  process.cwd(),
  'public',
  'data',
  'incidents.mock.json',
);

async function loadLocalIncidents(): Promise<Incident[]> {
  const file = await readFile(LOCAL_INCIDENTS_PATH, 'utf-8');
  const parsed = JSON.parse(file) as unknown;

  if (!Array.isArray(parsed)) {
    throw new Error('Local incidents file must contain an array');
  }

  return parsed as Incident[];
}

async function loadRemoteIncidents(): Promise<Incident[] | null> {
  const remoteUrl = process.env.INCIDENTS_REMOTE_URL;

  if (!remoteUrl) {
    return null;
  }

  try {
    const response = await fetch(remoteUrl, {
      cache: 'no-store',
    });

    if (!response.ok) {
      return null;
    }

    const parsed = (await response.json()) as unknown;

    if (!Array.isArray(parsed)) {
      return null;
    }

    return parsed as Incident[];
  } catch {
    return null;
  }
}

export async function GET() {
  const remoteIncidents = await loadRemoteIncidents();

  const source: IncidentsApiSource = remoteIncidents ? 'remote' : 'local';
  const data = remoteIncidents ?? (await loadLocalIncidents());

  const payload: IncidentsApiResponse = {
    data,
    source,
  };

  return NextResponse.json(payload, {
    headers: {
      'Cache-Control': 'no-store',
    },
  });
}