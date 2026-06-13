'use client';

import type { FormEvent } from 'react';
import { useMemo, useState } from 'react';

import { useIncidentsStore } from '@/store/incidents.store';
import type {
  Incident,
  IncidentPriority,
  IncidentType,
} from '@/types/incident';

import styles from './CreateIncidentModal.module.scss';

const FALLBACK_TYPE: IncidentType = {
  id: 'general',
  key: 'general',
  name: 'General',
  name_en: 'General',
};

const PRIORITIES: Array<{ label: string; value: IncidentPriority }> = [
  { label: 'Baja', value: 'low' },
  { label: 'Media', value: 'medium' },
  { label: 'Alta', value: 'high' },
];

type FormErrors = {
  title?: string;
  description?: string;
  typeKey?: string;
  priority?: string;
  coordinates?: string;
};

function getNextSequenceId(incidents: Incident[]) {
  const maxSequence = incidents.reduce((max, incident) => {
    const sequence = Number.parseInt(
      incident.sequenceId.replace(/\D/g, ''),
      10,
    );

    if (Number.isNaN(sequence)) {
      return max;
    }

    return Math.max(max, sequence);
  }, 0);

  return String(maxSequence + 1).padStart(4, '0');
}

function getNextOrder(incidents: Incident[]) {
  return incidents.reduce((max, incident) => Math.max(max, incident.order), 0) + 1;
}

export function CreateIncidentModal() {
  const baseIncidents = useIncidentsStore((state) => state.baseIncidents);
  const createdIncidents = useIncidentsStore((state) => state.createdIncidents);
  const creationCoordinates = useIncidentsStore(
    (state) => state.creationCoordinates,
  );
  const isCreateModalOpen = useIncidentsStore(
    (state) => state.isCreateModalOpen,
  );
  const addIncident = useIncidentsStore((state) => state.addIncident);
  const closeCreateModal = useIncidentsStore((state) => state.closeCreateModal);
  const cancelIncidentCreation = useIncidentsStore(
    (state) => state.cancelIncidentCreation,
  );
  const selectIncident = useIncidentsStore((state) => state.selectIncident);

  const incidents = useMemo(
    () => [...createdIncidents, ...baseIncidents],
    [baseIncidents, createdIncidents],
  );

  const categories = useMemo(() => {
    const uniqueTypes = new Map<string, IncidentType>();

    incidents.forEach((incident) => {
      uniqueTypes.set(incident.type.key, incident.type);
    });

    return uniqueTypes.size > 0 ? [...uniqueTypes.values()] : [FALLBACK_TYPE];
  }, [incidents]);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [typeKey, setTypeKey] = useState(categories[0]?.key ?? FALLBACK_TYPE.key);
  const [priority, setPriority] = useState<IncidentPriority>('medium');
  const [locationDescription, setLocationDescription] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});

  function resetForm() {
    setTitle('');
    setDescription('');
    setDueDate('');
    setTypeKey(categories[0]?.key ?? FALLBACK_TYPE.key);
    setPriority('medium');
    setLocationDescription('');
    setErrors({});
  }

  function handleCancel() {
    resetForm();
    cancelIncidentCreation();
  }

  if (!isCreateModalOpen) {
    return null;
  }

  const selectedType =
    categories.find((category) => category.key === typeKey) ??
    categories[0] ??
    FALLBACK_TYPE;
  const selectedTypeKey = selectedType.key;

  function validateForm() {
    const nextErrors: FormErrors = {};

    if (!title.trim()) {
      nextErrors.title = 'El titulo es requerido.';
    }

    if (!description.trim()) {
      nextErrors.description = 'La descripcion es requerida.';
    }

    if (!selectedTypeKey) {
      nextErrors.typeKey = 'La categoria es requerida.';
    }

    if (!priority) {
      nextErrors.priority = 'La prioridad es requerida.';
    }

    if (!creationCoordinates) {
      nextErrors.coordinates = 'Selecciona una ubicacion en el mapa.';
    }

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!validateForm() || !creationCoordinates) {
      return;
    }

    const now = new Date().toISOString();
    const fallbackProject = {
      id: 'demo-project',
      name: 'Proyecto Onboarding',
    };
    const incidentId = crypto.randomUUID();
    const nextIncident: Incident = {
      id: incidentId,
      sequenceId: getNextSequenceId(incidents),
      order: getNextOrder(incidents),
      title: title.trim(),
      description: description.trim(),
      type: selectedType,
      priority,
      status: 'open',
      approval: false,
      project: incidents[0]?.project ?? fallbackProject,
      owner: {
        id: 'demo-user',
        name: 'Julian',
        email: 'julian@spybee.com',
        avatarUrl: '',
      },
      whatsappOwner: null,
      assignees: [],
      observers: [],
      coordinates: creationCoordinates,
      locationDescription:
        locationDescription.trim() || 'Ubicación seleccionada en mapa',
      dueDate: dueDate ? new Date(`${dueDate}T00:00:00`).toISOString() : null,
      closingDate: null,
      media: [],
      tags: [],
      deleted: null,
      createdAt: now,
      updatedAt: now,
    };

    addIncident(nextIncident);
    resetForm();
    closeCreateModal();
    selectIncident(incidentId);
  }

  return (
    <div className={styles.backdrop}>
      <section
        aria-labelledby="create-incident-title"
        aria-modal="true"
        className={styles.modal}
        role="dialog"
      >
        <header className={styles.header}>
          <div>
            <p>Nueva incidencia</p>
            <h2 id="create-incident-title">Crear Incidencia</h2>
          </div>

          <button
            aria-label="Cerrar modal"
            className={styles.closeButton}
            onClick={handleCancel}
            type="button"
          >
            x
          </button>
        </header>

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.field}>
            <label htmlFor="incident-title">Titulo</label>
            <input
              id="incident-title"
              onChange={(event) => setTitle(event.target.value)}
              type="text"
              value={title}
            />
            {errors.title ? <span>{errors.title}</span> : null}
          </div>

          <div className={styles.field}>
            <label htmlFor="incident-description">Descripcion</label>
            <textarea
              id="incident-description"
              onChange={(event) => setDescription(event.target.value)}
              rows={4}
              value={description}
            />
            {errors.description ? <span>{errors.description}</span> : null}
          </div>

          <div className={styles.twoColumns}>
            <div className={styles.field}>
              <label htmlFor="incident-type">Categoria</label>
              <select
                id="incident-type"
                onChange={(event) => setTypeKey(event.target.value)}
                value={selectedTypeKey}
              >
                {categories.map((category) => (
                  <option key={category.key} value={category.key}>
                    {category.name}
                  </option>
                ))}
              </select>
              {errors.typeKey ? <span>{errors.typeKey}</span> : null}
            </div>

            <div className={styles.field}>
              <label htmlFor="incident-priority">Prioridad</label>
              <select
                id="incident-priority"
                onChange={(event) =>
                  setPriority(event.target.value as IncidentPriority)
                }
                value={priority}
              >
                {PRIORITIES.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
              {errors.priority ? <span>{errors.priority}</span> : null}
            </div>
          </div>

          <div className={styles.twoColumns}>
            <div className={styles.field}>
              <label htmlFor="incident-due-date">Fecha de vencimiento</label>
              <input
                id="incident-due-date"
                onChange={(event) => setDueDate(event.target.value)}
                type="date"
                value={dueDate}
              />
            </div>

            <div className={styles.field}>
              <label htmlFor="incident-location">Descripción de ubicación</label>
              <input
                id="incident-location"
                onChange={(event) => setLocationDescription(event.target.value)}
                placeholder="Ej: Nivel 5 - eje B3"
                type="text"
                value={locationDescription}
              />
              <small className={styles.helpText}>
                Esta descripción complementa el punto seleccionado en el mapa.
              </small>
            </div>
          </div>

          <div className={styles.coordinates}>
            <strong>Coordenadas seleccionadas</strong>
            <span>
              {creationCoordinates
                ? `${creationCoordinates.lat.toFixed(6)}, ${creationCoordinates.lng.toFixed(6)}`
                : 'Pendiente de seleccion'}
            </span>
            {errors.coordinates ? <em>{errors.coordinates}</em> : null}
          </div>

          <footer className={styles.footer}>
            <button onClick={handleCancel} type="button">
              Cancelar
            </button>
            <button className={styles.primary} type="submit">
              Guardar incidencia
            </button>
          </footer>
        </form>
      </section>
    </div>
  );
}
