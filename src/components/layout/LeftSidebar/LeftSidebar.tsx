'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { useTranslations } from '@/i18n/useTranslations';
import { useIncidentsStore } from '@/store/incidents.store';

import styles from './LeftSidebar.module.scss';

type LeftSidebarProps = {
  activeView: 'map' | 'dashboard' | 'options';
};

type IconName = 'map' | 'dashboard' | 'home' | 'settings';

const items = [
  {
    href: '/map',
    icon: 'map',
    view: 'map',
  },
  {
    href: '/dashboard',
    icon: 'dashboard',
    view: 'dashboard',
  },
  {
    href: '/options',
    icon: 'settings',
    view: 'options',
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

function getLabel(
  view: (typeof items)[number]['view'],
  t: ReturnType<typeof useTranslations>,
) {
  if (view === 'map') {
    return t('header.map');
  }

  if (view === 'dashboard') {
    return t('header.dashboard');
  }

  return t('header.options');
}

export function LeftSidebar({ activeView }: LeftSidebarProps) {
  const t = useTranslations();
  const router = useRouter();
  const startIncidentCreation = useIncidentsStore(
    (state) => state.startIncidentCreation,
  );

  function handleCreateIncident() {
    startIncidentCreation();
    router.push('/map');
  }

  return (
    <aside className={styles.sidebar} aria-label={t('sidebar.tools')}>
      <button
        aria-label={t('sidebar.createIncident')}
        className={styles.createButton}
        onClick={handleCreateIncident}
        title={t('sidebar.createIncident')}
        type="button"
      >
        +
      </button>

      <nav className={styles.items} aria-label={t('sidebar.sections')}>
        <Link
          aria-label={t('sidebar.home')}
          className={styles.item}
          href="/map"
          title={t('sidebar.home')}
        >
          <Icon name="home" />
        </Link>

        {items.map((item) => {
          const label = getLabel(item.view, t);

          return (
            <Link
              aria-label={label}
              className={`${styles.item} ${
                activeView === item.view ? styles.active : ''
              }`}
              href={item.href}
              key={item.href}
              title={label}
            >
              <Icon name={item.icon} />
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
