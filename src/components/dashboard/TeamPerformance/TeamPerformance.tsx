'use client';

import { useTranslations } from '@/i18n/useTranslations';
import type { TeamPerformanceItem } from '@/utils/dashboardStats';

import styles from './TeamPerformance.module.scss';

type TeamPerformanceProps = {
  items: TeamPerformanceItem[];
};

export function TeamPerformance({ items }: TeamPerformanceProps) {
  const t = useTranslations();
  const maxTotal = Math.max(...items.map((item) => item.total), 1);

  return (
    <article className={styles.card}>
      <header>
        <h2>{t('stats.teamTitle')}</h2>
        <p>{t('stats.teamDescription')}</p>
      </header>

      {items.length > 0 ? (
        <div className={styles.items}>
          {items.map((item) => (
            <section className={styles.item} key={item.id}>
              <div className={styles.itemHeader}>
                <strong>{item.name}</strong>
                <span>{item.total}</span>
              </div>
              <div className={styles.track} aria-hidden="true">
                <span style={{ width: `${(item.total / maxTotal) * 100}%` }} />
              </div>
              <dl>
                <div>
                  <dt>{t('stats.teamOpen')}</dt>
                  <dd>{item.open}</dd>
                </div>
                <div>
                  <dt>{t('stats.teamClosed')}</dt>
                  <dd>{item.closed}</dd>
                </div>
                <div>
                  <dt>{t('stats.teamOverdue')}</dt>
                  <dd>{item.overdue}</dd>
                </div>
                <div>
                  <dt>{t('stats.teamClosure')}</dt>
                  <dd>{item.closureRate}%</dd>
                </div>
              </dl>
            </section>
          ))}
        </div>
      ) : (
        <p className={styles.empty}>{t('table.empty')}</p>
      )}
    </article>
  );
}
