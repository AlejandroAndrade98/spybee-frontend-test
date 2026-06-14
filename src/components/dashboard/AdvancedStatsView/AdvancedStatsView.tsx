'use client';

import { useMemo } from 'react';

import { RiskIndicators } from '@/components/dashboard/RiskIndicators/RiskIndicators';
import { SummaryCard } from '@/components/dashboard/SummaryCard/SummaryCard';
import { TeamPerformance } from '@/components/dashboard/TeamPerformance/TeamPerformance';
import { TrendChart } from '@/components/dashboard/TrendChart/TrendChart';
import { useTranslations } from '@/i18n/useTranslations';
import { usePreferencesStore } from '@/store/preferences.store';
import type { Incident } from '@/types/incident';
import { getDashboardStats } from '@/utils/dashboardStats';

import styles from './AdvancedStatsView.module.scss';

type AdvancedStatsViewProps = {
  incidents: Incident[];
};

export function AdvancedStatsView({ incidents }: AdvancedStatsViewProps) {
  const t = useTranslations();
  const language = usePreferencesStore((state) => state.language);
  const locale = language === 'en' ? 'en-US' : 'es-CO';
  const stats = useMemo(
    () => getDashboardStats(incidents, locale),
    [incidents, locale],
  );

  return (
    <div className={styles.view}>
      <header className={styles.intro}>
        <div>
          <p>{t('stats.scope')}</p>
          <h2>{t('stats.title')}</h2>
        </div>
        <strong>
          {incidents.length} {t('stats.visibleIncidents')}
        </strong>
      </header>

      <section className={styles.section} aria-labelledby="trend-risk-title">
        <div className={styles.sectionHeader}>
          <h2 id="trend-risk-title">{t('stats.trendRisk')}</h2>
          <p>{t('stats.trendRiskDescription')}</p>
        </div>
        <div className={styles.trendGrid}>
          <TrendChart points={stats.trend} />
          <RiskIndicators risks={stats.risks} />
        </div>
      </section>

      <section className={styles.section} aria-labelledby="distribution-title">
        <div className={styles.sectionHeader}>
          <h2 id="distribution-title">{t('stats.distributionTitle')}</h2>
          <p>{t('stats.distributionDescription')}</p>
        </div>
        <div className={styles.twoColumnGrid}>
          <SummaryCard
            description={t('stats.categoriesDescription')}
            items={stats.categories}
            title={t('stats.categoriesTitle')}
          />
          <SummaryCard
            description={t('stats.tagsDescription')}
            items={stats.tags}
            title={t('stats.tagsTitle')}
          />
        </div>
      </section>

      <section className={styles.section} aria-labelledby="team-title">
        <div className={styles.sectionHeader}>
          <h2 id="team-title">{t('stats.teamSection')}</h2>
          <p>{t('stats.teamSectionDescription')}</p>
        </div>
        <TeamPerformance items={stats.team} />
      </section>
    </div>
  );
}
