'use client';

import { useMemo, useState } from 'react';

import { useTranslations } from '@/i18n/useTranslations';
import { usePreferencesStore } from '@/store/preferences.store';
import type { Incident } from '@/types/incident';
import { formatShortDate } from '@/utils/date';
import {
  getIncidentMediaCount,
  getIncidentOwnerName,
  getIncidentProjectName,
  getIncidentSequenceId,
  getIncidentTypeName,
} from '@/utils/incidentAccessors';

import styles from './IncidentsTable.module.scss';

type IncidentsTableProps = {
  incidents: Incident[];
  createdIncidentIds: Set<string>;
};

const PAGE_SIZE = 15;

function getPriorityLabel(
  priority: Incident['priority'],
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

function getStatusLabel(
  status: Incident['status'],
  t: ReturnType<typeof useTranslations>,
) {
  if (status === 'open') {
    return t('status.open');
  }

  if (status === 'closed') {
    return t('status.closed');
  }

  return t('status.on_pause');
}

export function IncidentsTable({
  incidents,
  createdIncidentIds,
}: IncidentsTableProps) {
  const t = useTranslations();
  const language = usePreferencesStore((state) => state.language);
  const locale = language === 'es' ? 'es-CO' : 'en-US';
  const paginationKey = incidents.map((incident) => incident.id).join('|');
  const [paginationState, setPaginationState] = useState({
    key: paginationKey,
    page: 1,
  });
  const currentPage =
    paginationState.key === paginationKey ? paginationState.page : 1;
  const totalPages = Math.max(Math.ceil(incidents.length / PAGE_SIZE), 1);
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const firstItem = (safeCurrentPage - 1) * PAGE_SIZE + 1;
  const lastItem = Math.min(safeCurrentPage * PAGE_SIZE, incidents.length);
  const paginatedIncidents = useMemo(
    () =>
      incidents.slice(
        (safeCurrentPage - 1) * PAGE_SIZE,
        safeCurrentPage * PAGE_SIZE,
      ),
    [safeCurrentPage, incidents],
  );

  if (incidents.length === 0) {
    return (
      <article className={styles.card}>
        <h2>{t('table.title')}</h2>
        <p className={styles.empty}>{t('table.empty')}</p>
      </article>
    );
  }

  return (
    <article className={styles.card}>
      <header>
        <div>
          <h2>{t('table.title')}</h2>
          <p>
            {incidents.length} {t('table.results')} - {t('table.showing')}{' '}
            {firstItem}-{lastItem}
          </p>
        </div>
      </header>

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>{t('table.code')}</th>
              <th>{t('table.incidentTitle')}</th>
              <th>{t('table.project')}</th>
              <th>{t('table.category')}</th>
              <th>{t('table.priority')}</th>
              <th>{t('table.status')}</th>
              <th>{t('table.owner')}</th>
              <th>{t('table.dueDate')}</th>
              <th>{t('table.media')}</th>
            </tr>
          </thead>
          <tbody>
            {paginatedIncidents.map((incident) => (
              <tr key={incident.id}>
                <td data-label={t('table.code')}>
                  <strong>#{getIncidentSequenceId(incident)}</strong>
                  {createdIncidentIds.has(incident.id) ? (
                    <span className={styles.localBadge}>{t('table.local')}</span>
                  ) : null}
                </td>
                <td data-label={t('table.incidentTitle')}>{incident.title}</td>
                <td data-label={t('table.project')}>
                  {getIncidentProjectName(incident)}
                </td>
                <td data-label={t('table.category')}>
                  {getIncidentTypeName(incident)}
                </td>
                <td data-label={t('table.priority')}>
                  <span
                    className={`${styles.badge} ${styles[incident.priority]}`}
                  >
                    {getPriorityLabel(incident.priority, t)}
                  </span>
                </td>
                <td data-label={t('table.status')}>
                  <span className={`${styles.badge} ${styles[incident.status]}`}>
                    {getStatusLabel(incident.status, t)}
                  </span>
                </td>
                <td data-label={t('table.owner')}>
                  {getIncidentOwnerName(incident)}
                </td>
                <td data-label={t('table.dueDate')}>
                  {incident.dueDate
                    ? formatShortDate(incident.dueDate, locale)
                    : t('common.noDate')}
                </td>
                <td data-label={t('table.media')}>
                  {getIncidentMediaCount(incident) > 0
                    ? getIncidentMediaCount(incident)
                    : '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <footer className={styles.pagination} aria-label={t('table.pagination')}>
        <span>
          {t('table.page')} {safeCurrentPage} {t('table.of')} {totalPages}
        </span>

        <div className={styles.paginationActions}>
          <button
            disabled={safeCurrentPage === 1}
            onClick={() =>
              setPaginationState({
                key: paginationKey,
                page: Math.max(safeCurrentPage - 1, 1),
              })
            }
            type="button"
          >
            {t('table.previous')}
          </button>
          <button
            disabled={safeCurrentPage === totalPages}
            onClick={() =>
              setPaginationState({
                key: paginationKey,
                page: Math.min(safeCurrentPage + 1, totalPages),
              })
            }
            type="button"
          >
            {t('table.next')}
          </button>
        </div>
      </footer>
    </article>
  );
}
