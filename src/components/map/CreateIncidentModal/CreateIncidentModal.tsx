'use client';

import type { FormEvent } from 'react';
import { useMemo, useState } from 'react';

import { useTranslations } from '@/i18n/useTranslations';
import { FALLBACK_AUTH_USER, useAuthStore } from '@/store/auth.store';
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

const PRIORITIES: IncidentPriority[] = ['low', 'medium', 'high'];

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
      (incident.sequenceId ?? '').replace(/\D/g, ''),
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

function getPriorityLabel(
  priority: IncidentPriority,
  t: ReturnType<typeof useTranslations>,
) {
  if (priority === 'high') {
    return t('priority.high');
  }

  if (priority === 'medium') {
    return t('priority.medium');
  }

  return t('priority.low');
}

export function CreateIncidentModal() {
  const t = useTranslations();
  const currentUser = useAuthStore((state) => state.currentUser);
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
      if (incident.type?.key) {
        uniqueTypes.set(incident.type.key, incident.type);
      }
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
      nextErrors.title = t('modal.titleRequired');
    }

    if (!description.trim()) {
      nextErrors.description = t('modal.descriptionRequired');
    }

    if (!selectedTypeKey) {
      nextErrors.typeKey = t('modal.categoryRequired');
    }

    if (!priority) {
      nextErrors.priority = t('modal.priorityRequired');
    }

    if (!creationCoordinates) {
      nextErrors.coordinates = t('modal.coordinatesRequired');
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
    const owner = currentUser ?? FALLBACK_AUTH_USER;
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
        id: owner.id,
        name: owner.name,
        email: owner.email,
        avatarUrl: owner.avatarUrl,
      },
      whatsappOwner: null,
      assignees: [],
      observers: [],
      coordinates: creationCoordinates,
      locationDescription:
        locationDescription.trim() || t('modal.defaultLocation'),
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
            <p>{t('modal.kicker')}</p>
            <h2 id="create-incident-title">{t('modal.title')}</h2>
          </div>

          <button
            aria-label={t('modal.close')}
            className={styles.closeButton}
            onClick={handleCancel}
            type="button"
          >
            x
          </button>
        </header>

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.field}>
            <label htmlFor="incident-title">{t('modal.titleLabel')}</label>
            <input
              id="incident-title"
              onChange={(event) => setTitle(event.target.value)}
              type="text"
              value={title}
            />
            {errors.title ? <span>{errors.title}</span> : null}
          </div>

          <div className={styles.field}>
            <label htmlFor="incident-description">
              {t('modal.descriptionLabel')}
            </label>
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
              <label htmlFor="incident-type">{t('modal.categoryLabel')}</label>
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
              <label htmlFor="incident-priority">
                {t('modal.priorityLabel')}
              </label>
              <select
                id="incident-priority"
                onChange={(event) =>
                  setPriority(event.target.value as IncidentPriority)
                }
                value={priority}
              >
                {PRIORITIES.map((item) => (
                  <option key={item} value={item}>
                    {getPriorityLabel(item, t)}
                  </option>
                ))}
              </select>
              {errors.priority ? <span>{errors.priority}</span> : null}
            </div>
          </div>

          <div className={styles.twoColumns}>
            <div className={styles.field}>
              <label htmlFor="incident-due-date">
                {t('modal.dueDateLabel')}
              </label>
              <input
                id="incident-due-date"
                onChange={(event) => setDueDate(event.target.value)}
                type="date"
                value={dueDate}
              />
            </div>

            <div className={styles.field}>
              <label htmlFor="incident-location">
                {t('modal.locationDescriptionLabel')}
              </label>
              <input
                id="incident-location"
                onChange={(event) => setLocationDescription(event.target.value)}
                placeholder={t('modal.locationPlaceholder')}
                type="text"
                value={locationDescription}
              />
              <small className={styles.helpText}>
                {t('modal.locationHelp')}
              </small>
            </div>
          </div>

          <div className={styles.coordinates}>
            <strong>{t('modal.coordinates')}</strong>
            <span>
              {creationCoordinates
                ? `${creationCoordinates.lat.toFixed(6)}, ${creationCoordinates.lng.toFixed(6)}`
                : t('modal.coordinatesPending')}
            </span>
            {errors.coordinates ? <em>{errors.coordinates}</em> : null}
          </div>

          <footer className={styles.footer}>
            <button onClick={handleCancel} type="button">
              {t('common.cancel')}
            </button>
            <button className={styles.primary} type="submit">
              {t('modal.save')}
            </button>
          </footer>
        </form>
      </section>
    </div>
  );
}
