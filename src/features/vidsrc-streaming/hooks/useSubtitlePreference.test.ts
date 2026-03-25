import { renderHook, act, waitFor } from '@testing-library/react';
import { useSubtitlePreference } from './useSubtitlePreference';
import * as loggingModule from '../utils/logging';

// Mock the logging module
jest.mock('../utils/logging');

describe('useSubtitlePreference', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Clear session storage before each test
    if (typeof window !== 'undefined') {
      window.sessionStorage.clear();
    }
  });

  it('should initialize with default language "en"', () => {
    const { result } = renderHook(() => useSubtitlePreference(550));

    expect(result.current.language).toBe('en');
  });

  it('should retrieve saved preference from session storage on mount', async () => {
    const tmdbId = 550;
    const key = `vidsrc_subtitle_lang_${tmdbId}`;

    // Set a saved preference
    if (typeof window !== 'undefined') {
      window.sessionStorage.setItem(key, 'es');
    }

    const { result } = renderHook(() => useSubtitlePreference(tmdbId));

    await waitFor(() => {
      expect(result.current.language).toBe('es');
    });
  });

  it('should update language state when setLanguage is called', async () => {
    const { result } = renderHook(() => useSubtitlePreference(550));

    act(() => {
      result.current.setLanguage('fr');
    });

    await waitFor(() => {
      expect(result.current.language).toBe('fr');
    });
  });

  it('should save language preference to session storage', async () => {
    const tmdbId = 550;
    const key = `vidsrc_subtitle_lang_${tmdbId}`;

    const { result } = renderHook(() => useSubtitlePreference(tmdbId));

    act(() => {
      result.current.setLanguage('de');
    });

    await waitFor(() => {
      if (typeof window !== 'undefined') {
        const saved = window.sessionStorage.getItem(key);
        expect(saved).toBe('de');
      }
    });
  });

  it('should log subtitle selection event', async () => {
    const tmdbId = 550;
    const { result } = renderHook(() => useSubtitlePreference(tmdbId));

    act(() => {
      result.current.setLanguage('pt');
    });

    await waitFor(() => {
      expect(loggingModule.logSubtitleSelection).toHaveBeenCalledWith(tmdbId, 'pt');
    });
  });

  it('should persist preference across different TMDB IDs', async () => {
    const tmdbId1 = 550;
    const tmdbId2 = 1399;
    const key1 = `vidsrc_subtitle_lang_${tmdbId1}`;
    const key2 = `vidsrc_subtitle_lang_${tmdbId2}`;

    const { result: result1 } = renderHook(() => useSubtitlePreference(tmdbId1));
    const { result: result2 } = renderHook(() => useSubtitlePreference(tmdbId2));

    act(() => {
      result1.current.setLanguage('es');
    });

    act(() => {
      result2.current.setLanguage('fr');
    });

    await waitFor(() => {
      if (typeof window !== 'undefined') {
        expect(window.sessionStorage.getItem(key1)).toBe('es');
        expect(window.sessionStorage.getItem(key2)).toBe('fr');
      }
    });
  });

  it('should handle session storage errors gracefully', async () => {
    const tmdbId = 550;

    // Mock sessionStorage to throw an error
    const originalSessionStorage = window.sessionStorage;
    Object.defineProperty(window, 'sessionStorage', {
      value: {
        getItem: jest.fn(() => {
          throw new Error('Storage error');
        }),
        setItem: jest.fn(() => {
          throw new Error('Storage error');
        }),
        clear: jest.fn(),
      },
      writable: true,
    });

    const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

    const { result } = renderHook(() => useSubtitlePreference(tmdbId));

    act(() => {
      result.current.setLanguage('it');
    });

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalled();
    });

    // Restore original sessionStorage
    Object.defineProperty(window, 'sessionStorage', {
      value: originalSessionStorage,
      writable: true,
    });

    consoleSpy.mockRestore();
  });

  it('should support all subtitle languages', async () => {
    const tmdbId = 550;
    const languages = ['en', 'es', 'fr', 'de', 'pt', 'it', 'ru', 'ja', 'zh'] as const;

    for (const lang of languages) {
      const { result } = renderHook(() => useSubtitlePreference(tmdbId));

      act(() => {
        result.current.setLanguage(lang);
      });

      await waitFor(() => {
        expect(result.current.language).toBe(lang);
      });
    }
  });
});
