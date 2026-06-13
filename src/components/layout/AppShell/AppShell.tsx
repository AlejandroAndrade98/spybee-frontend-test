import type { ReactNode } from 'react';

import { AppHeader } from '@/components/layout/AppHeader/AppHeader';
import { LeftSidebar } from '@/components/layout/LeftSidebar/LeftSidebar';

import styles from './AppShell.module.scss';

type AppShellProps = {
  activeView: 'map' | 'dashboard';
  children: ReactNode;
};

export function AppShell({ activeView, children }: AppShellProps) {
  return (
    <div className={styles.shell}>
      <AppHeader activeView={activeView} />

      <div className={styles.body}>
        <LeftSidebar activeView={activeView} />

        <main className={styles.content}>{children}</main>
      </div>
    </div>
  );
}