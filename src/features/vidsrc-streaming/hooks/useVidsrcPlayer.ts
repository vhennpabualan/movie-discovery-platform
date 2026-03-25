'use client';

import { useState, useEffect, useCallback } from 'react';
import type { DomainProvider, StreamingError, StreamingErrorType } from '../types/index';
import { VidsrcConfigurationManager } from '../services/VidsrcConfigurationManager';
import { VidsrcEmbedURLGenerator } from '../services/VidsrcEmbedURLGenerator';
import type { EmbedURLConfig } from '../types/index';

interface UseVidsrcPlayerState {
  loading: boolean;
  error: StreamingError | null;
  embedURL: string | null;
  currentDomain: DomainProvider | null;
  attemptedDomains: DomainProvider[];
}

export interface UseVidsrcPlayerReturn extends UseVidsrcPlayerState {
  retry: () => void;
}

/**
 * useVidsrcPlayer Hook
 *
 * Manages the state and logic for the Vidsrc streaming player.
 * Handles URL generation, error handling, domain fallback, and retry logic.
 *
 * @param tmdbId - The TMDB ID for the movie or TV show
 * @param contentType - The content type: 'movie' or 'tv'
 * @param season - Season number (required for TV content)
 * @param episode - Episode number (required for TV content)
 * @param subtitleLanguage - Optional subtitle language code
 * @param autoplay - Optional autoplay flag
 * @param customSubtitleUrl - Optional custom subtitle URL
 * @param autonext - Optional autonext flag for TV
 * @returns Object containing player state and retry function
 */
export function useVidsrcPlayer(
  tmdbId: number,
  contentType: 'movie' | 'tv',
  season?: number,
  episode?: number,
  subtitleLanguage?: string,
  autoplay?: boolean,
  customSubtitleUrl?: string,
  autonext?: boolean
): UseVidsrcPlayerReturn {
  const [state, setState] = useState<UseVidsrcPlayerState>({
    loading: true,
    error: null,
    embedURL: null,
    currentDomain: null,
    attemptedDomains: [],
  });

  const configManager = useCallback(() => new VidsrcConfigurationManager(), []);
  const urlGenerator = useCallback(() => new VidsrcEmbedURLGenerator(), []);

  const generateURL = useCallback(
    async (manager: VidsrcConfigurationManager, generator: VidsrcEmbedURLGenerator) => {
      try {
        // Validate TMDB ID
        generator.validateTmdbId(tmdbId);

        // Get next available domain
        const domain = manager.getNextDomain();
        if (!domain) {
          const error: StreamingError = {
            type: 'ALL_DOMAINS_FAILED',
            message: 'Stream not available - please try again later',
            timestamp: Date.now(),
            tmdbId,
            failedDomains: [],
          };
          setState((prev) => ({
            loading: false,
            error,
            embedURL: null,
            currentDomain: null,
            attemptedDomains: prev.attemptedDomains,
          }));
          return;
        }

        // Build config
        const config: EmbedURLConfig = {
          tmdbId,
          contentType,
          domain,
          season,
          episode,
          subtitleLanguage: subtitleLanguage as any,
          autoplay,
          customSubtitleUrl,
          autonext,
        };

        // Generate URL
        let url: string;
        if (contentType === 'tv') {
          url = generator.generateTVURL(config);
        } else {
          url = generator.generateMovieURL(config);
        }

        setState((prev) => ({
          loading: false,
          error: null,
          embedURL: url,
          currentDomain: domain,
          attemptedDomains: [...prev.attemptedDomains, domain],
        }));
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        let errorType: StreamingErrorType = 'UNKNOWN';

        if (errorMessage.includes('Invalid TMDB ID')) {
          errorType = 'INVALID_TMDB_ID';
        } else if (errorMessage.includes('Invalid domain')) {
          errorType = 'INVALID_URL';
        }

        const error: StreamingError = {
          type: errorType,
          message:
            errorType === 'INVALID_TMDB_ID'
              ? 'Invalid movie ID - streaming unavailable'
              : 'Unable to generate streaming URL',
          timestamp: Date.now(),
          tmdbId,
        };

        setState((prev) => ({
          loading: false,
          error,
          embedURL: null,
          currentDomain: null,
          attemptedDomains: prev.attemptedDomains,
        }));
      }
    },
    [tmdbId, contentType, season, episode, subtitleLanguage, autoplay, customSubtitleUrl, autonext]
  );

  const retry = useCallback(() => {
    setState({
      loading: true,
      error: null,
      embedURL: null,
      currentDomain: null,
      attemptedDomains: [],
    });

    const manager = configManager();
    const generator = urlGenerator();

    // Reset domain list on retry
    manager.resetDomains();

    generateURL(manager, generator);
  }, [configManager, urlGenerator, generateURL]);

  useEffect(() => {
    const manager = configManager();
    const generator = urlGenerator();

    generateURL(manager, generator);
  }, [generateURL, configManager, urlGenerator]);

  return {
    ...state,
    retry,
  };
}
