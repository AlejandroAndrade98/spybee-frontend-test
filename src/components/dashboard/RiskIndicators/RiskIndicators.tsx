'use client';

import { useTranslations } from '@/i18n/useTranslations';
import type { RiskStats } from '@/utils/dashboardStats';

import styles from './RiskIndicators.module.scss';

type RiskIndicatorsProps = {
  risks: RiskStats;
};

export function RiskIndicators({ risks }: RiskIndicatorsProps) {
  const t = useTranslations();
  const items = [
    {
      label: t('stats.riskHighOpen'),
      value: risks.highPriorityOpen,
      tone: styles.red,
    },
    {
      label: t('stats.riskOverdue'),
      value: risks.overdue,
      tone: styles.red,
    },
    {
      label: t('stats.riskWithoutMedia'),
      value: risks.withoutMedia,
      tone: styles.yellow,
    },
    {
      label: t('stats.riskOnPause'),
      value: risks.onPause,
      tone: styles.blue,
    },
    {
      label: t('stats.riskClosedLate'),
      value: risks.closedLate,
      tone: styles.neutral,
    },
  ];

  return (
    <article className={styles.card}>
      <header>
        <h2>{t('stats.riskTitle')}</h2>
        <p>{t('stats.riskDescription')}</p>
      </header>

      <div className={styles.grid}>
        {items.map((item) => (
          <div className={`${styles.item} ${item.tone}`} key={item.label}>
            <span>{item.label}</span>
            <strong>{item.value}</strong>
          </div>
        ))}
      </div>
    </article>
  );
}
