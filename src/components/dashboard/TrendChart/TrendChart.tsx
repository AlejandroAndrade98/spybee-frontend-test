'use client';

import { useMemo } from 'react';

import { useTranslations } from '@/i18n/useTranslations';
import type { TrendPoint } from '@/utils/dashboardStats';

import styles from './TrendChart.module.scss';

type TrendChartProps = {
  points: TrendPoint[];
};

const CHART_WIDTH = 640;
const CHART_HEIGHT = 220;
const PADDING = 32;

export function TrendChart({ points }: TrendChartProps) {
  const t = useTranslations();
  const maxValue = Math.max(
    ...points.flatMap((point) => [point.created, point.closed, point.backlog]),
    1,
  );
  const plotWidth = CHART_WIDTH - PADDING * 2;
  const plotHeight = CHART_HEIGHT - PADDING * 2;

  const linePath = useMemo(() => {
    if (points.length === 0) {
      return '';
    }

    return points
      .map((point, index) => {
        const x =
          PADDING +
          (points.length === 1 ? plotWidth / 2 : (index / (points.length - 1)) * plotWidth);
        const y =
          CHART_HEIGHT - PADDING - (point.backlog / maxValue) * plotHeight;

        return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
      })
      .join(' ');
  }, [maxValue, plotHeight, plotWidth, points]);

  if (points.length === 0) {
    return <p className={styles.empty}>{t('stats.noTrend')}</p>;
  }

  return (
    <article className={styles.card}>
      <header>
        <div>
          <h2>{t('stats.trendTitle')}</h2>
          <p>{t('stats.trendDescription')}</p>
        </div>
      </header>

      <div className={styles.chartWrap}>
        <svg
          aria-label={t('stats.trendTitle')}
          className={styles.chart}
          role="img"
          viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
        >
          {[0, 0.5, 1].map((step) => {
            const y = CHART_HEIGHT - PADDING - step * plotHeight;

            return (
              <line
                className={styles.gridLine}
                key={step}
                x1={PADDING}
                x2={CHART_WIDTH - PADDING}
                y1={y}
                y2={y}
              />
            );
          })}

          {points.map((point, index) => {
            const groupWidth = plotWidth / points.length;
            const baseX = PADDING + index * groupWidth + groupWidth * 0.2;
            const barWidth = Math.max(groupWidth * 0.18, 8);
            const createdHeight = (point.created / maxValue) * plotHeight;
            const closedHeight = (point.closed / maxValue) * plotHeight;

            return (
              <g key={point.key}>
                <rect
                  className={styles.createdBar}
                  height={createdHeight}
                  rx="4"
                  width={barWidth}
                  x={baseX}
                  y={CHART_HEIGHT - PADDING - createdHeight}
                />
                <rect
                  className={styles.closedBar}
                  height={closedHeight}
                  rx="4"
                  width={barWidth}
                  x={baseX + barWidth + 4}
                  y={CHART_HEIGHT - PADDING - closedHeight}
                />
                <text
                  className={styles.axisText}
                  textAnchor="middle"
                  x={PADDING + index * groupWidth + groupWidth / 2}
                  y={CHART_HEIGHT - 8}
                >
                  {point.label}
                </text>
              </g>
            );
          })}

          <path className={styles.backlogLine} d={linePath} />
        </svg>
      </div>

      <div className={styles.legend}>
        <span className={styles.created}>{t('stats.created')}</span>
        <span className={styles.closed}>{t('stats.closed')}</span>
        <span className={styles.backlog}>{t('stats.backlog')}</span>
      </div>
    </article>
  );
}
