'use client';

import Link from 'next/link';
import { useEffect } from 'react';

import { useTranslations } from '@/i18n/useTranslations';
import { usePreferencesStore } from '@/store/preferences.store';

import styles from './AppHeader.module.scss';

type AppHeaderProps = {
  activeView: 'map' | 'dashboard';
};

export function AppHeader({ activeView }: AppHeaderProps) {
  const t = useTranslations();
  const theme = usePreferencesStore((state) => state.theme);
  const language = usePreferencesStore((state) => state.language);
  const toggleTheme = usePreferencesStore((state) => state.toggleTheme);
  const setLanguage = usePreferencesStore((state) => state.setLanguage);
  const sectionLabel =
    activeView === 'map' ? t('header.map') : t('header.dashboard');

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  return (
    <header className={styles.header}>
      <Link href="/map" className={styles.brand} aria-label={t('header.goMap')}>
        <div className={styles.mark} aria-hidden="true">
          <span />
        </div>

        <strong>Spybee</strong>
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
          title={theme === 'light' ? t('header.themeDark') : t('header.themeLight')}
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
