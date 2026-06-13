'use client';

import Link from 'next/link';

import { useTranslations } from '@/i18n/useTranslations';
import { useIncidentsStore } from '@/store/incidents.store';

import styles from './LeftSidebar.module.scss';

type LeftSidebarProps = {
  activeView: 'map' | 'dashboard';
};

type IconName = 'map' | 'dashboard' | 'home' | 'settings';

const items = [
  {
    href: '/map',
    label: 'Mapa',
    icon: 'map',
    view: 'map',
  },
  {
    href: '/dashboard',
    label: 'Dashboard',
    icon: 'dashboard',
    view: 'dashboard',
  },
] as const;

function Icon({ name }: { name: IconName }) {
  if (name === 'dashboard') {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24">
        <path d="M4 13h6v7H4zM14 4h6v16h-6zM4 4h6v5H4z" />
      </svg>
    );
  }

  if (name === 'home') {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24">
        <path d="M4 11.5 12 5l8 6.5V20h-5v-5H9v5H4z" />
      </svg>
    );
  }

  if (name === 'settings') {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24">
        <path d="M12 8a4 4 0 1 1 0 8 4 4 0 0 1 0-8Zm0-5 1.4 3.1 3.4-.4-2 2.8 2 2.8-3.4-.4L12 14l-1.4-3.1-3.4.4 2-2.8-2-2.8 3.4.4L12 3Z" />
      </svg>
    );
  }

  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path d="m4 5 5-2 6 2 5-2v16l-5 2-6-2-5 2V5Zm5 0v12m6-10v12" />
    </svg>
  );
}

export function LeftSidebar({ activeView }: LeftSidebarProps) {
  const t = useTranslations();
  const startIncidentCreation = useIncidentsStore(
    (state) => state.startIncidentCreation,
  );

  return (
    <aside className={styles.sidebar} aria-label={t('sidebar.tools')}>
      <button
        className={styles.createButton}
        onClick={startIncidentCreation}
        type="button"
        aria-label={t('sidebar.createIncident')}
        title={t('sidebar.createIncident')}
      >
        +
      </button>

      <nav className={styles.items} aria-label={t('sidebar.sections')}>
        <Link
          href="/map"
          className={styles.item}
          aria-label={t('sidebar.home')}
          title={t('sidebar.home')}
        >
          <Icon name="home" />
        </Link>

        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`${styles.item} ${
              activeView === item.view ? styles.active : ''
            }`}
            aria-label={
              item.view === 'map' ? t('header.map') : t('header.dashboard')
            }
            title={
              item.view === 'map' ? t('header.map') : t('header.dashboard')
            }
          >
            <Icon name={item.icon} />
          </Link>
        ))}

        <button
          className={styles.item}
          type="button"
          aria-label={t('sidebar.settings')}
          title={t('sidebar.settings')}
        >
          <Icon name="settings" />
        </button>
      </nav>
    </aside>
  );
}
