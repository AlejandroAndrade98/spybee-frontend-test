import Link from 'next/link';

import styles from './AppHeader.module.scss';

type AppHeaderProps = {
  activeView: 'map' | 'dashboard';
};

export function AppHeader({ activeView }: AppHeaderProps) {
  return (
    <header className={styles.header}>
      <div className={styles.brand}>
        <div className={styles.logo} aria-hidden="true">
          S
        </div>

        <div>
          <strong>Spybee</strong>
          <span>Project incidents</span>
        </div>
      </div>

      <nav className={styles.nav} aria-label="Main navigation">
        <Link
          href="/map"
          className={`${styles.navLink} ${
            activeView === 'map' ? styles.active : ''
          }`}
        >
          Mapa
        </Link>

        <Link
          href="/dashboard"
          className={`${styles.navLink} ${
            activeView === 'dashboard' ? styles.active : ''
          }`}
        >
          Dashboard
        </Link>
      </nav>

      <div className={styles.project}>
        <span>Proyecto</span>
        <strong>Torre Acqua - Etapa 2</strong>
      </div>
    </header>
  );
}