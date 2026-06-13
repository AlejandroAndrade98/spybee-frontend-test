'use client';

import { useCallback } from 'react';

import { getMessage, type MessageKey } from '@/i18n/messages';
import { usePreferencesStore } from '@/store/preferences.store';

export function useTranslations() {
  const language = usePreferencesStore((state) => state.language);

  return useCallback(
    (key: MessageKey) => getMessage(language, key),
    [language],
  );
}
