import type { SummaryItem } from '@/utils/incidentMetrics';

import styles from './SummaryCard.module.scss';

type SummaryCardProps = {
  title: string;
  description: string;
  items: SummaryItem[];
  maxItems?: number;
};

export function SummaryCard({
  title,
  description,
  items,
  maxItems = 6,
}: SummaryCardProps) {
  const visibleItems = items.slice(0, maxItems);
  const maxValue = Math.max(...visibleItems.map((item) => item.value), 1);

  return (
    <article className={styles.card}>
      <header>
        <h2>{title}</h2>
        <p>{description}</p>
      </header>

      {visibleItems.length > 0 ? (
        <div className={styles.items}>
          {visibleItems.map((item) => (
            <div className={styles.item} key={item.label}>
              <span>{item.label}</span>
              <div className={styles.track} aria-hidden="true">
                <span
                  className={styles.fill}
                  style={{ width: `${(item.value / maxValue) * 100}%` }}
                />
              </div>
              <strong>{item.value}</strong>
            </div>
          ))}
        </div>
      ) : (
        <p className={styles.empty}>Sin datos para mostrar.</p>
      )}
    </article>
  );
}
