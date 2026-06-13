'use client';

import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type ThemePreference = 'light' | 'dark';
export type LanguagePreference = 'es' | 'en';

type PreferencesStore = {
  theme: ThemePreference;
  language: LanguagePreference;
  toggleTheme: () => void;
  setLanguage: (language: LanguagePreference) => void;
};

export const usePreferencesStore = create<PreferencesStore>()(
  persist(
    (set) => ({
      theme: 'light',
      language: 'es',

      toggleTheme: () => {
        set((state) => ({
          theme: state.theme === 'light' ? 'dark' : 'light',
        }));
      },

      setLanguage: (language) => {
        set({
          language,
        });
      },
    }),
    {
      name: 'spybee-preferences-store',
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
