'use client';

import { useTranslations } from '@/i18n/useTranslations';

import styles from './DashboardViewToggle.module.scss';

export type DashboardViewMode = 'summary' | 'statistics';

type DashboardViewToggleProps = {
  value: DashboardViewMode;
  onChange: (value: DashboardViewMode) => void;
};

export function DashboardViewToggle({
  value,
  onChange,
}: DashboardViewToggleProps) {
  const t = useTranslations();

  return (
    <div className={styles.toggle} aria-label={t('dashboard.viewMode')}>
      <button
        aria-pressed={value === 'summary'}
        className={value === 'summary' ? styles.active : ''}
        onClick={() => onChange('summary')}
        type="button"
      >
        {t('dashboard.summaryView')}
      </button>
      <button
        aria-pressed={value === 'statistics'}
        className={value === 'statistics' ? styles.active : ''}
        onClick={() => onChange('statistics')}
        type="button"
      >
        {t('dashboard.statisticsView')}
      </button>
    </div>
  );
}
