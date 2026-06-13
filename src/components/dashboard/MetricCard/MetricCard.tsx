import styles from './MetricCard.module.scss';

type MetricCardProps = {
  label: string;
  value: number;
  detail: string;
  tone?: 'neutral' | 'green' | 'blue' | 'yellow' | 'red';
};

export function MetricCard({
  label,
  value,
  detail,
  tone = 'neutral',
}: MetricCardProps) {
  return (
    <article className={`${styles.card} ${styles[tone]}`}>
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{detail}</small>
    </article>
  );
}
