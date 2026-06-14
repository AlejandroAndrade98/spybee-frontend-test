'use client';

import type { ReactNode } from 'react';

import { AuthGuard } from '@/components/auth/AuthGuard/AuthGuard';
import { AppHeader } from '@/components/layout/AppHeader/AppHeader';
import { LeftSidebar } from '@/components/layout/LeftSidebar/LeftSidebar';
import { useTranslations } from '@/i18n/useTranslations';

import styles from './AppShell.module.scss';

type AppShellProps = {
  activeView: 'map' | 'dashboard' | 'options';
  children: ReactNode;
};

export function AppShell({ activeView, children }: AppShellProps) {
  const t = useTranslations();

  return (
    <AuthGuard>
      <div className={styles.shell}>
        <a className={styles.skipLink} href="#main-content">
          {t('common.skipContent')}
        </a>

        <AppHeader activeView={activeView} />

        <div className={styles.body}>
          <LeftSidebar activeView={activeView} />

          <main className={styles.content} id="main-content">
            {children}
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}
