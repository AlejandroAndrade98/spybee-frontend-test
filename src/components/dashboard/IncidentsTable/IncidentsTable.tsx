'use client';

import { useMemo, useState } from 'react';

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

function getPriorityLabel(priority: Incident['priority']) {
  if (priority === 'high') {
    return 'Alta';
  }

  if (priority === 'medium') {
    return 'Media';
  }

  return 'Baja';
}

function getStatusLabel(status: Incident['status']) {
  if (status === 'open') {
    return 'Abierta';
  }

  if (status === 'closed') {
    return 'Cerrada';
  }

  return 'En pausa';
}

export function IncidentsTable({
  incidents,
  createdIncidentIds,
}: IncidentsTableProps) {
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
        <h2>Incidencias filtradas</h2>
        <p className={styles.empty}>No hay incidencias para estos filtros.</p>
      </article>
    );
  }

  return (
    <article className={styles.card}>
      <header>
        <div>
          <h2>Incidencias filtradas</h2>
          <p>
            {incidents.length} resultados visibles · Mostrando {firstItem}-
            {lastItem}
          </p>
        </div>
      </header>

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Codigo</th>
              <th>Titulo</th>
              <th>Proyecto</th>
              <th>Categoria</th>
              <th>Prioridad</th>
              <th>Estado</th>
              <th>Responsable</th>
              <th>Vencimiento</th>
              <th>Evidencias</th>
            </tr>
          </thead>
          <tbody>
            {paginatedIncidents.map((incident) => (
              <tr key={incident.id}>
                <td>
                  <strong>#{getIncidentSequenceId(incident)}</strong>
                  {createdIncidentIds.has(incident.id) ? (
                    <span className={styles.localBadge}>Local</span>
                  ) : null}
                </td>
                <td>{incident.title}</td>
                <td>{getIncidentProjectName(incident)}</td>
                <td>{getIncidentTypeName(incident)}</td>
                <td>
                  <span
                    className={`${styles.badge} ${styles[incident.priority]}`}
                  >
                    {getPriorityLabel(incident.priority)}
                  </span>
                </td>
                <td>
                  <span className={`${styles.badge} ${styles[incident.status]}`}>
                    {getStatusLabel(incident.status)}
                  </span>
                </td>
                <td>{getIncidentOwnerName(incident)}</td>
                <td>{formatShortDate(incident.dueDate)}</td>
                <td>
                  {getIncidentMediaCount(incident) > 0
                    ? getIncidentMediaCount(incident)
                    : '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <footer className={styles.pagination} aria-label="Paginacion">
        <span>
          Pagina {safeCurrentPage} de {totalPages}
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
            Anterior
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
            Siguiente
          </button>
        </div>
      </footer>
    </article>
  );
}
