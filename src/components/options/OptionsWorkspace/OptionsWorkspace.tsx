'use client';

import { useRouter } from 'next/navigation';

import { useTranslations } from '@/i18n/useTranslations';
import { useAuthStore } from '@/store/auth.store';
import { useIncidentsStore } from '@/store/incidents.store';
import { usePreferencesStore } from '@/store/preferences.store';

import styles from './OptionsWorkspace.module.scss';

export function OptionsWorkspace() {
  const t = useTranslations();
  const router = useRouter();
  const currentUser = useAuthStore((state) => state.currentUser);
  const theme = usePreferencesStore((state) => state.theme);
  const language = usePreferencesStore((state) => state.language);
  const toggleTheme = usePreferencesStore((state) => state.toggleTheme);
  const setLanguage = usePreferencesStore((state) => state.setLanguage);
  const startIncidentCreation = useIncidentsStore(
    (state) => state.startIncidentCreation,
  );

  function handleCreateIncident() {
    startIncidentCreation();
    router.push('/map');
  }

  return (
    <section className={styles.workspace} aria-labelledby="options-title">
      <header className={styles.header}>
        <div>
          <p>{t('common.projectTrail')}</p>
          <h1 id="options-title">{t('options.title')}</h1>
        </div>
        <button onClick={handleCreateIncident} type="button">
          {t('map.createIncident')}
        </button>
      </header>

      <div className={styles.grid}>
        <article className={styles.card}>
          <span className={styles.icon}>SUN</span>
          <div>
            <h2>{t('options.themeTitle')}</h2>
            <p>{t('options.themeDescription')}</p>
          </div>
          <button className={styles.action} onClick={toggleTheme} type="button">
            {theme === 'light' ? t('header.themeDark') : t('header.themeLight')}
          </button>
        </article>

        <article className={styles.card}>
          <span className={styles.icon}>ES</span>
          <div>
            <h2>{t('options.languageTitle')}</h2>
            <p>{t('options.languageDescription')}</p>
          </div>
          <div className={styles.segmented}>
            <button
              className={language === 'es' ? styles.selected : ''}
              onClick={() => setLanguage('es')}
              type="button"
            >
              ES
            </button>
            <button
              className={language === 'en' ? styles.selected : ''}
              onClick={() => setLanguage('en')}
              type="button"
            >
              EN
            </button>
          </div>
        </article>

        <article className={styles.card}>
          <span className={styles.icon}>USR</span>
          <div>
            <h2>{t('options.usersTitle')}</h2>
            <p>{t('options.usersDescription')}</p>
          </div>
          <strong>{currentUser?.role ?? 'Demo'}</strong>
        </article>

        <article className={styles.card}>
          <span className={styles.icon}>PRJ</span>
          <div>
            <h2>{t('options.projectTitle')}</h2>
            <p>{t('options.projectDescription')}</p>
          </div>
          <strong>Proyecto Onboarding</strong>
        </article>

        <article className={styles.card}>
          <span className={styles.icon}>EXP</span>
          <div>
            <h2>{t('options.exportsTitle')}</h2>
            <p>{t('options.exportsDescription')}</p>
          </div>
          <strong>MVP</strong>
        </article>
      </div>
    </section>
  );
}
