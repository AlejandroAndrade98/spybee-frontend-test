import Link from 'next/link';

import styles from './LeftSidebar.module.scss';

type LeftSidebarProps = {
  activeView: 'map' | 'dashboard';
};

const items = [
  {
    href: '/map',
    label: 'Mapa',
    icon: '🗺️',
    view: 'map',
  },
  {
    href: '/dashboard',
    label: 'Dashboard',
    icon: '📊',
    view: 'dashboard',
  },
] as const;

export function LeftSidebar({ activeView }: LeftSidebarProps) {
  return (
    <aside className={styles.sidebar} aria-label="Project tools">
      <button className={styles.createButton} type="button" aria-label="Crear incidencia">
        +
      </button>

      <div className={styles.items}>
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`${styles.item} ${
              activeView === item.view ? styles.active : ''
            }`}
            aria-label={item.label}
            title={item.label}
          >
            <span aria-hidden="true">{item.icon}</span>
          </Link>
        ))}
      </div>
    </aside>
  );
}