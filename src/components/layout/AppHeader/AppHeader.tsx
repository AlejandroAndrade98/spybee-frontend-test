'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

import { useTranslations } from '@/i18n/useTranslations';
import { useAuthStore } from '@/store/auth.store';
import { usePreferencesStore } from '@/store/preferences.store';

import styles from './AppHeader.module.scss';

type AppHeaderProps = {
  activeView: 'map' | 'dashboard' | 'options';
};

export function AppHeader({ activeView }: AppHeaderProps) {
  const t = useTranslations();
  const router = useRouter();
  const currentUser = useAuthStore((state) => state.currentUser);
  const logout = useAuthStore((state) => state.logout);
  const theme = usePreferencesStore((state) => state.theme);
  const language = usePreferencesStore((state) => state.language);
  const toggleTheme = usePreferencesStore((state) => state.toggleTheme);
  const setLanguage = usePreferencesStore((state) => state.setLanguage);
  const sectionLabel =
    activeView === 'map'
      ? t('header.map')
      : activeView === 'dashboard'
        ? t('header.dashboard')
        : t('header.options');
  const userInitial = currentUser?.name?.charAt(0).toUpperCase() ?? 'J';

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  function handleLogout() {
    logout();
    router.replace('/login');
  }

  return (
    <header className={styles.header}>
      <Link href="/map" className={styles.brand} aria-label={t('header.goMap')}>
        <Image
          alt="Spybee"
          className={styles.logo}
          height="44"
          priority
          src="/assets/spybee_logo_light.png"
          width="136"
        />
      </Link>

      <div className={styles.project}>
        <strong>Proyecto Onboarding</strong>
        <span>{sectionLabel}</span>
      </div>

      <div className={styles.userArea} aria-label={t('header.activeUser')}>
        <button
          aria-label={t('header.theme')}
          className={styles.themeButton}
          onClick={toggleTheme}
          title={
            theme === 'light' ? t('header.themeDark') : t('header.themeLight')
          }
          type="button"
        >
          <span aria-hidden="true">{theme === 'light' ? '☾' : '☀'}</span>
        </button>
        <div className={styles.languageToggle} aria-label={t('header.language')}>
          <button
            aria-pressed={language === 'es'}
            className={language === 'es' ? styles.selectedLanguage : ''}
            onClick={() => setLanguage('es')}
            type="button"
          >
            ES
          </button>
          <button
            aria-pressed={language === 'en'}
            className={language === 'en' ? styles.selectedLanguage : ''}
            onClick={() => setLanguage('en')}
            type="button"
          >
            EN
          </button>
        </div>
        <div className={styles.avatar} aria-hidden="true">
          {userInitial}
        </div>
        <div className={styles.userText}>
          <strong>{currentUser?.name ?? 'Julian'}</strong>
          <span>{currentUser?.role ?? 'Superadmin'}</span>
        </div>
        <button
          className={styles.logoutButton}
          onClick={handleLogout}
          type="button"
        >
          {t('auth.logout')}
        </button>
      </div>
    </header>
  );
}
