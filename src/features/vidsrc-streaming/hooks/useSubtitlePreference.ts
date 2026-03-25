'use client';

import { useState, useEffect, useCallback } from 'react';
import type { SubtitleLanguage } from '../types/index';
import { SUBTITLE_PREFERENCE_KEY } from '../config/constants';
import { logSubtitleSelection } from '../utils/logging';

export interface UseSubtitlePreferenceReturn {
  language: SubtitleLanguage;
  setLanguage: (language: SubtitleLanguage) => void;
}

/**
 * useSubtitlePreference Hook
 *
 * Manages the user's subtitle language preference.
 * Persists preference to session storage and logs selection events.
 *
 * @param tmdbId - The TMDB ID for the movie or TV show
 * @returns Object containing current language and setter function
 */
export function useSubtitlePreference(tmdbId: number): UseSubtitlePreferenceReturn {
  const [language, setLanguageState] = useState<SubtitleLanguage>('en');

  // Initialize from session storage on mount
  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && window.sessionStorage) {
        const key = `${SUBTITLE_PREFERENCE_KEY}_${tmdbId}`;
        const saved = window.sessionStorage.getItem(key);
        if (saved) {
          setLanguageState(saved as SubtitleLanguage);
        }
      }
    } catch (error) {
      console.warn('[Vidsrc] Failed to read subtitle preference from session storage:', error);
    }
  }, [tmdbId]);

  const setLanguage = useCallback(
    (newLanguage: SubtitleLanguage) => {
      setLanguageState(newLanguage);

      // Save to session storage
      try {
        if (typeof window !== 'undefined' && window.sessionStorage) {
          const key = `${SUBTITLE_PREFERENCE_KEY}_${tmdbId}`;
          window.sessionStorage.setItem(key, newLanguage);
        }
      } catch (error) {
        console.warn('[Vidsrc] Failed to save subtitle preference to session storage:', error);
      }

      // Log selection event
      logSubtitleSelection(tmdbId, newLanguage);
    },
    [tmdbId]
  );

  return {
    language,
    setLanguage,
  };
}
