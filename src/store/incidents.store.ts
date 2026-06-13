'use client';

import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import {
  getIncidents,
  type IncidentsResponse,
} from '@/services/incidents.service';
import type { Coordinates, Incident, IncidentFilters } from '@/types/incident';

type IncidentsLoadStatus = 'idle' | 'loading' | 'success' | 'error';

type IncidentsSource = IncidentsResponse['source'] | null;

type IncidentsStore = {
  baseIncidents: Incident[];
  createdIncidents: Incident[];

  selectedIncidentId: string | null;
  creationCoordinates: Coordinates | null;
  isCreateModalOpen: boolean;

  filters: IncidentFilters;

  status: IncidentsLoadStatus;
  error: string | null;
  source: IncidentsSource;

  loadIncidents: () => Promise<void>;
  addIncident: (incident: Incident) => void;

  selectIncident: (incidentId: string | null) => void;
  openCreateModal: () => void;
  closeCreateModal: () => void;
  setCreationCoordinates: (coordinates: Coordinates | null) => void;

  setFilters: (filters: Partial<IncidentFilters>) => void;
  resetFilters: () => void;
};

const DEFAULT_FILTERS: IncidentFilters = {
  search: '',
  projectId: 'all',
  status: 'all',
  priority: 'all',
  typeKey: 'all',
  includeDeleted: false,
};

export const useIncidentsStore = create<IncidentsStore>()(
  persist(
    (set, get) => ({
      baseIncidents: [],
      createdIncidents: [],

      selectedIncidentId: null,
      creationCoordinates: null,
      isCreateModalOpen: false,

      filters: DEFAULT_FILTERS,

      status: 'idle',
      error: null,
      source: null,

      loadIncidents: async () => {
        const currentStatus = get().status;

        if (currentStatus === 'loading' || currentStatus === 'success') {
          return;
        }

        set({
          status: 'loading',
          error: null,
        });

        try {
          const response = await getIncidents();

          set({
            baseIncidents: response.data,
            source: response.source,
            status: 'success',
            error: null,
          });
        } catch (error) {
          set({
            status: 'error',
            error:
              error instanceof Error
                ? error.message
                : 'Unable to load incidents',
          });
        }
      },

      addIncident: (incident) => {
        set((state) => ({
          createdIncidents: [incident, ...state.createdIncidents],
        }));
      },

      selectIncident: (incidentId) => {
        set({
          selectedIncidentId: incidentId,
        });
      },

      openCreateModal: () => {
        set({
          isCreateModalOpen: true,
        });
      },

      closeCreateModal: () => {
        set({
          isCreateModalOpen: false,
          creationCoordinates: null,
        });
      },

      setCreationCoordinates: (coordinates) => {
        set({
          creationCoordinates: coordinates,
        });
      },

      setFilters: (filters) => {
        set((state) => ({
          filters: {
            ...state.filters,
            ...filters,
          },
        }));
      },

      resetFilters: () => {
        set({
          filters: DEFAULT_FILTERS,
        });
      },
    }),
    {
      name: 'spybee-incidents-store',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        createdIncidents: state.createdIncidents,
      }),
    },
  ),
);

export function getAllIncidents(state: IncidentsStore) {
  return [...state.createdIncidents, ...state.baseIncidents];
}

export function getVisibleIncidents(state: IncidentsStore) {
  return getAllIncidents(state).filter((incident) => {
    if (state.filters.includeDeleted) {
      return true;
    }

    return !incident.deleted;
  });
}