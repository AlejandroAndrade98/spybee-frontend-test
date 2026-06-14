'use client';

import { usePathname, useRouter } from 'next/navigation';
import type { ReactNode } from 'react';
import { useEffect } from 'react';

import { useTranslations } from '@/i18n/useTranslations';
import { useAuthStore } from '@/store/auth.store';

import styles from './AuthGuard.module.scss';

type AuthGuardProps = {
  children: ReactNode;
};

export function AuthGuard({ children }: AuthGuardProps) {
  const t = useTranslations();
  const router = useRouter();
  const pathname = usePathname();
  const currentUser = useAuthStore((state) => state.currentUser);
  const hasHydrated = useAuthStore((state) => state.hasHydrated);

  useEffect(() => {
    if (hasHydrated && !currentUser) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
    }
  }, [currentUser, hasHydrated, pathname, router]);

  if (!hasHydrated) {
    return <div className={styles.state}>{t('auth.checkingSession')}</div>;
  }

  if (!currentUser) {
    return <div className={styles.state}>{t('auth.redirecting')}</div>;
  }

  return children;
}
