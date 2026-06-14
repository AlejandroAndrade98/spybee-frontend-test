'use client';

import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import type { FormEvent } from 'react';
import { useEffect, useState } from 'react';

import { demoUsers } from '@/data/demoUsers';
import { useTranslations } from '@/i18n/useTranslations';
import { useAuthStore } from '@/store/auth.store';
import { usePreferencesStore } from '@/store/preferences.store';

import styles from './LoginForm.module.scss';

export function LoginForm() {
  const t = useTranslations();
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentUser = useAuthStore((state) => state.currentUser);
  const hasHydrated = useAuthStore((state) => state.hasHydrated);
  const login = useAuthStore((state) => state.login);
  const theme = usePreferencesStore((state) => state.theme);
  const language = usePreferencesStore((state) => state.language);
  const toggleTheme = usePreferencesStore((state) => state.toggleTheme);
  const setLanguage = usePreferencesStore((state) => state.setLanguage);
  const [email, setEmail] = useState('julian@spybee.com');
  const [password, setPassword] = useState('demo123');
  const [error, setError] = useState('');
  const nextPath = searchParams.get('next') ?? '/map';

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  useEffect(() => {
    if (hasHydrated && currentUser) {
      router.replace('/map');
    }
  }, [currentUser, hasHydrated, router]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');

    if (!login(email, password)) {
      setError(t('auth.invalidCredentials'));
      return;
    }

    router.replace(nextPath.startsWith('/') ? nextPath : '/map');
  }

  function fillDemoUser(demoEmail: string) {
    setEmail(demoEmail);
    setPassword('demo123');
    setError('');
  }

  return (
    <main className={styles.page}>
      <section className={styles.panel} aria-labelledby="login-title">
        <div className={styles.brandSide}>
          <Image
            alt="Spybee"
            className={styles.logo}
            height="98"
            priority
            src="/assets/spybee_logo_light.png"
            width="300"
          />
          <div>
            <p>{t('auth.demoLabel')}</p>
            <h1 id="login-title">{t('auth.title')}</h1>
            <span>{t('auth.subtitle')}</span>
          </div>
        </div>

        <div className={styles.formSide}>
          <div className={styles.toolbar}>
            <button
              aria-label={t('header.theme')}
              onClick={toggleTheme}
              title={
                theme === 'light' ? t('header.themeDark') : t('header.themeLight')
              }
              type="button"
            >
              {theme === 'light' ? '☾' : '☀'}
            </button>
            <div aria-label={t('header.language')}>
              <button
                aria-pressed={language === 'es'}
                className={language === 'es' ? styles.activeLanguage : ''}
                onClick={() => setLanguage('es')}
                type="button"
              >
                ES
              </button>
              <button
                aria-pressed={language === 'en'}
                className={language === 'en' ? styles.activeLanguage : ''}
                onClick={() => setLanguage('en')}
                type="button"
              >
                EN
              </button>
            </div>
          </div>

          <form className={styles.form} onSubmit={handleSubmit}>
            <div className={styles.field}>
              <label htmlFor="email">{t('auth.email')}</label>
              <input
                autoComplete="email"
                id="email"
                onChange={(event) => setEmail(event.target.value)}
                type="email"
                value={email}
              />
            </div>

            <div className={styles.field}>
              <label htmlFor="password">{t('auth.password')}</label>
              <input
                autoComplete="current-password"
                id="password"
                onChange={(event) => setPassword(event.target.value)}
                type="password"
                value={password}
              />
            </div>

            {error ? <p className={styles.error}>{error}</p> : null}

            <button className={styles.primary} type="submit">
              {t('auth.signIn')}
            </button>
          </form>

          <section className={styles.demoUsers} aria-labelledby="demo-users">
            <h2 id="demo-users">{t('auth.demoUsers')}</h2>
            <div>
              {demoUsers.map((user) => (
                <button
                  key={user.email}
                  onClick={() => fillDemoUser(user.email)}
                  type="button"
                >
                  <strong>{user.name}</strong>
                  <span>{user.role}</span>
                  <small>{user.email}</small>
                </button>
              ))}
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}
