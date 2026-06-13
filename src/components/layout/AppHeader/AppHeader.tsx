import Link from 'next/link';

import styles from './AppHeader.module.scss';

type AppHeaderProps = {
  activeView: 'map' | 'dashboard';
};

export function AppHeader({ activeView }: AppHeaderProps) {
  const sectionLabel = activeView === 'map' ? 'Mapa' : 'Dashboard';

  return (
    <header className={styles.header}>
      <Link href="/map" className={styles.brand} aria-label="Ir al mapa">
        <div className={styles.mark} aria-hidden="true">
          <span />
        </div>

        <strong>Spybee</strong>
      </Link>

      <div className={styles.project}>
        <strong>Proyecto Onboarding</strong>
        <span>{sectionLabel}</span>
      </div>

      <div className={styles.userArea} aria-label="Usuario activo">
        <span className={styles.flag} aria-hidden="true" />
        <div className={styles.avatar} aria-hidden="true">
          J
        </div>
        <div className={styles.userText}>
          <strong>Julian</strong>
          <span>Superadmin</span>
        </div>
      </div>
    </header>
  );
}
