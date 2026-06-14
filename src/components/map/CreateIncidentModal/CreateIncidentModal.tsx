'use client';

import type { ChangeEvent, DragEvent, FormEvent } from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';

import { useTranslations } from '@/i18n/useTranslations';
import { FALLBACK_AUTH_USER, useAuthStore } from '@/store/auth.store';
import { useIncidentsStore } from '@/store/incidents.store';
import type {
  Incident,
  IncidentMedia,
  IncidentPriority,
  IncidentType,
  IncidentUser,
} from '@/types/incident';

import styles from './CreateIncidentModal.module.scss';

const FALLBACK_TYPE: IncidentType = {
  id: 'general',
  key: 'general',
  name: 'General',
  name_en: 'General',
};

const PRIORITIES: IncidentPriority[] = ['low', 'medium', 'high'];
const MAX_ATTACHMENTS = 3;
const MAX_ATTACHMENT_SIZE = 2 * 1024 * 1024;
const ALLOWED_ATTACHMENT_TYPES = new Set([
  'image/png',
  'image/jpeg',
  'image/webp',
  'application/pdf',
]);

type PeopleDropdown = 'assignees' | 'observers' | null;

type AttachmentDraft = IncidentMedia & {
  previewUrl: string;
};

type FormErrors = {
  title?: string;
  description?: string;
  typeKey?: string;
  priority?: string;
  coordinates?: string;
  attachments?: string;
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

function formatFileSize(size: number) {
  if (size < 1024 * 1024) {
    return `${Math.max(Math.round(size / 1024), 1)} KB`;
  }

  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

function getAttachmentKind(file: File): IncidentMedia['type'] {
  if (file.type.startsWith('image/')) {
    return 'image';
  }

  return 'document';
}

function readImageAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();

    reader.addEventListener('load', () => {
      resolve(typeof reader.result === 'string' ? reader.result : '');
    });
    reader.addEventListener('error', () => reject(reader.error));
    reader.readAsDataURL(file);
  });
}

function getUserKey(user: IncidentUser) {
  return user.id || user.email;
}

function getUniqueIncidentUsers(incidents: Incident[]) {
  const users = new Map<string, IncidentUser>();

  incidents.forEach((incident) => {
    const incidentUsers = [
      incident.owner,
      ...(incident.assignees ?? []),
      ...(incident.observers ?? []),
    ].filter(Boolean);

    incidentUsers.forEach((user) => {
      const key = getUserKey(user);

      if (key && !users.has(key)) {
        users.set(key, {
          id: user.id,
          name: user.name,
          email: user.email,
          avatarUrl: user.avatarUrl,
        });
      }
    });
  });

  return [...users.values()].sort((a, b) => a.name.localeCompare(b.name));
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
  const availableUsers = useMemo(
    () => getUniqueIncidentUsers(incidents),
    [incidents],
  );

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [typeKey, setTypeKey] = useState(categories[0]?.key ?? FALLBACK_TYPE.key);
  const [priority, setPriority] = useState<IncidentPriority>('medium');
  const [locationDescription, setLocationDescription] = useState('');
  const [attachments, setAttachments] = useState<AttachmentDraft[]>([]);
  const [selectedAssigneeKeys, setSelectedAssigneeKeys] = useState<string[]>([]);
  const [selectedObserverKeys, setSelectedObserverKeys] = useState<string[]>([]);
  const [openPeopleDropdown, setOpenPeopleDropdown] =
    useState<PeopleDropdown>(null);
  const [errors, setErrors] = useState<FormErrors>({});
  const peopleDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!openPeopleDropdown) {
      return;
    }

    function handlePointerDown(event: PointerEvent) {
      if (
        peopleDropdownRef.current &&
        !peopleDropdownRef.current.contains(event.target as Node)
      ) {
        setOpenPeopleDropdown(null);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setOpenPeopleDropdown(null);
      }
    }

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [openPeopleDropdown]);

  function resetForm() {
    setTitle('');
    setDescription('');
    setDueDate('');
    setTypeKey(categories[0]?.key ?? FALLBACK_TYPE.key);
    setPriority('medium');
    setLocationDescription('');
    setAttachments([]);
    setSelectedAssigneeKeys([]);
    setSelectedObserverKeys([]);
    setOpenPeopleDropdown(null);
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

  async function addFiles(files: FileList | File[]) {
    setErrors((currentErrors) => ({
      ...currentErrors,
      attachments: undefined,
    }));

    const nextFiles = Array.from(files);

    if (attachments.length + nextFiles.length > MAX_ATTACHMENTS) {
      setErrors((currentErrors) => ({
        ...currentErrors,
        attachments: t('modal.attachmentsMax'),
      }));
      return;
    }

    const nextAttachments: AttachmentDraft[] = [];

    for (const file of nextFiles) {
      if (!ALLOWED_ATTACHMENT_TYPES.has(file.type)) {
        setErrors((currentErrors) => ({
          ...currentErrors,
          attachments: t('modal.attachmentTypeError'),
        }));
        return;
      }

      if (file.size > MAX_ATTACHMENT_SIZE) {
        setErrors((currentErrors) => ({
          ...currentErrors,
          attachments: t('modal.attachmentSizeError'),
        }));
        return;
      }

      const type = getAttachmentKind(file);
      const previewUrl = type === 'image' ? await readImageAsDataUrl(file) : '';

      nextAttachments.push({
        id: crypto.randomUUID(),
        name: file.name,
        type,
        format: file.type,
        size: file.size,
        status: 'uploaded',
        url: previewUrl,
        previewUrl,
      });
    }

    setAttachments((currentAttachments) => [
      ...currentAttachments,
      ...nextAttachments,
    ]);
  }

  function handleFileInputChange(event: ChangeEvent<HTMLInputElement>) {
    if (event.target.files) {
      void addFiles(event.target.files);
    }

    event.target.value = '';
  }

  function handleDrop(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();

    if (event.dataTransfer.files.length > 0) {
      void addFiles(event.dataTransfer.files);
    }
  }

  function removeAttachment(attachmentId: string) {
    setAttachments((currentAttachments) =>
      currentAttachments.filter((attachment) => attachment.id !== attachmentId),
    );
  }

  function getSelectedUsers(selectedKeys: string[]) {
    return availableUsers.filter((user) => selectedKeys.includes(getUserKey(user)));
  }

  function toggleUserSelection(
    userKey: string,
    selectedKeys: string[],
    setSelectedKeys: (keys: string[]) => void,
  ) {
    if (selectedKeys.includes(userKey)) {
      setSelectedKeys(selectedKeys.filter((key) => key !== userKey));
      return;
    }

    setSelectedKeys([...selectedKeys, userKey]);
  }

  function getPeopleSummary(
    selectedKeys: string[],
    emptyLabel: string,
    selectedLabel: string,
  ) {
    const selectedUsers = getSelectedUsers(selectedKeys);

    if (selectedUsers.length === 0) {
      return emptyLabel;
    }

    if (selectedUsers.length === 1) {
      return selectedUsers[0].name;
    }

    return `${selectedUsers.length} ${selectedLabel}`;
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
    const assignees = getSelectedUsers(selectedAssigneeKeys);
    const observers = getSelectedUsers(selectedObserverKeys);
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
      assignees,
      observers,
      coordinates: creationCoordinates,
      locationDescription:
        locationDescription.trim() || t('modal.defaultLocation'),
      dueDate: dueDate ? new Date(`${dueDate}T00:00:00`).toISOString() : null,
      closingDate: null,
      media: attachments.map((attachment) => ({
        id: attachment.id,
        name: attachment.name,
        type: attachment.type,
        format: attachment.format,
        size: attachment.size,
        status: attachment.status,
        url: attachment.url,
      })),
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
            {errors.title ? <span className={styles.fieldError}>{errors.title}</span> : null}
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

          <div className={styles.peopleGrid} ref={peopleDropdownRef}>
            <div className={styles.field}>
              <span className={styles.peopleLabel}>{t('modal.assigneesLabel')}</span>
              <div className={styles.peopleDropdown}>
                <button
                  aria-expanded={openPeopleDropdown === 'assignees'}
                  className={styles.peopleTrigger}
                  disabled={availableUsers.length === 0}
                  onClick={() =>
                    setOpenPeopleDropdown((current) =>
                      current === 'assignees' ? null : 'assignees',
                    )
                  }
                  type="button"
                >
                  <span>
                    {availableUsers.length > 0
                      ? getPeopleSummary(
                          selectedAssigneeKeys,
                          t('modal.assigneesPlaceholder'),
                          t('modal.assigneesSelected'),
                        )
                      : t('modal.noUsers')}
                  </span>
                </button>

                {openPeopleDropdown === 'assignees' ? (
                  <div className={styles.peoplePanel}>
                    {selectedAssigneeKeys.length > 0 ? (
                      <button
                        className={styles.clearPeople}
                        onClick={() => setSelectedAssigneeKeys([])}
                        type="button"
                      >
                        {t('common.clean')}
                      </button>
                    ) : null}
                    {availableUsers.map((user) => {
                      const userKey = getUserKey(user);

                      return (
                        <label key={userKey}>
                          <input
                            checked={selectedAssigneeKeys.includes(userKey)}
                            onChange={() =>
                              toggleUserSelection(
                                userKey,
                                selectedAssigneeKeys,
                                setSelectedAssigneeKeys,
                              )
                            }
                            type="checkbox"
                          />
                          <span>
                            <strong>{user.name}</strong>
                            <small>{user.email}</small>
                          </span>
                        </label>
                      );
                    })}
                  </div>
                ) : null}
              </div>
            </div>

            <div className={styles.field}>
              <span className={styles.peopleLabel}>{t('modal.observersLabel')}</span>
              <div className={styles.peopleDropdown}>
                <button
                  aria-expanded={openPeopleDropdown === 'observers'}
                  className={styles.peopleTrigger}
                  disabled={availableUsers.length === 0}
                  onClick={() =>
                    setOpenPeopleDropdown((current) =>
                      current === 'observers' ? null : 'observers',
                    )
                  }
                  type="button"
                >
                  <span>
                    {availableUsers.length > 0
                      ? getPeopleSummary(
                          selectedObserverKeys,
                          t('modal.observersPlaceholder'),
                          t('modal.observersSelected'),
                        )
                      : t('modal.noUsers')}
                  </span>
                </button>

                {openPeopleDropdown === 'observers' ? (
                  <div className={styles.peoplePanel}>
                    {selectedObserverKeys.length > 0 ? (
                      <button
                        className={styles.clearPeople}
                        onClick={() => setSelectedObserverKeys([])}
                        type="button"
                      >
                        {t('common.clean')}
                      </button>
                    ) : null}
                    {availableUsers.map((user) => {
                      const userKey = getUserKey(user);

                      return (
                        <label key={userKey}>
                          <input
                            checked={selectedObserverKeys.includes(userKey)}
                            onChange={() =>
                              toggleUserSelection(
                                userKey,
                                selectedObserverKeys,
                                setSelectedObserverKeys,
                              )
                            }
                            type="checkbox"
                          />
                          <span>
                            <strong>{user.name}</strong>
                            <small>{user.email}</small>
                          </span>
                        </label>
                      );
                    })}
                  </div>
                ) : null}
              </div>
            </div>
          </div>

          <section
            className={styles.attachments}
            aria-labelledby="incident-attachments-title"
          >
            <div className={styles.attachmentsHeader}>
              <div>
                <h3 id="incident-attachments-title">
                  {t('modal.attachmentsTitle')}
                </h3>
                <p>{t('modal.attachmentsHelp')}</p>
              </div>
              <div className={styles.attachmentTabs} aria-hidden="true">
                <span>{t('modal.attachmentImages')}</span>
                <span>{t('modal.attachmentDocuments')}</span>
              </div>
            </div>

            <label
              className={styles.dropzone}
              htmlFor="incident-attachments"
              onDragOver={(event) => event.preventDefault()}
              onDrop={handleDrop}
            >
              <strong>{t('modal.dragFiles')}</strong>
              <span>{t('modal.browseFiles')}</span>
              <input
                accept="image/png,image/jpeg,image/webp,application/pdf"
                id="incident-attachments"
                multiple
                onChange={handleFileInputChange}
                type="file"
              />
            </label>

            {errors.attachments ? (
              <p className={styles.attachmentError}>{errors.attachments}</p>
            ) : null}

            {attachments.length > 0 ? (
              <ul className={styles.attachmentList}>
                {attachments.map((attachment) => (
                  <li key={attachment.id}>
                    {attachment.type === 'image' ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img alt="" src={attachment.previewUrl} />
                    ) : (
                      <span className={styles.documentPreview}>PDF</span>
                    )}
                    <div>
                      <strong>{attachment.name}</strong>
                      <span>{formatFileSize(attachment.size)}</span>
                    </div>
                    <button
                      aria-label={`${t('modal.removeAttachment')} ${attachment.name}`}
                      onClick={() => removeAttachment(attachment.id)}
                      type="button"
                    >
                      {t('modal.removeAttachment')}
                    </button>
                  </li>
                ))}
              </ul>
            ) : null}
          </section>

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
