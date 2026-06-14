'use client';

import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { demoUsers, toAuthUser, type DemoAuthUser } from '@/data/demoUsers';

type AuthStore = {
  currentUser: DemoAuthUser | null;
  hasHydrated: boolean;
  login: (email: string, password: string) => boolean;
  logout: () => void;
  setHasHydrated: (hasHydrated: boolean) => void;
};

export const FALLBACK_AUTH_USER: DemoAuthUser = {
  id: 'demo-user',
  name: 'Julian',
  email: 'julian@spybee.com',
  avatarUrl: '',
  role: 'Superadmin',
};

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      currentUser: null,
      hasHydrated: false,

      login: (email, password) => {
        const normalizedEmail = email.trim().toLowerCase();
        const user = demoUsers.find(
          (item) =>
            item.email.toLowerCase() === normalizedEmail &&
            item.password === password,
        );

        if (!user) {
          return false;
        }

        set({
          currentUser: toAuthUser(user),
        });

        return true;
      },

      logout: () => {
        set({
          currentUser: null,
        });
      },

      setHasHydrated: (hasHydrated) => {
        set({
          hasHydrated,
        });
      },
    }),
    {
      name: 'spybee-auth-store',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        currentUser: state.currentUser,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);
