'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
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
  retryWithNextDomain: () => void;
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
  autonext?: boolean,
  preferredDomain?: DomainProvider | null
): UseVidsrcPlayerReturn {
  const [state, setState] = useState<UseVidsrcPlayerState>({
    loading: true,
    error: null,
    embedURL: null,
    currentDomain: null,
    attemptedDomains: [],
  });

  const configManagerRef = useRef<VidsrcConfigurationManager | null>(null);
  const urlGeneratorRef = useRef<VidsrcEmbedURLGenerator | null>(null);

  const configManager = useCallback(() => {
    if (!configManagerRef.current) {
      configManagerRef.current = new VidsrcConfigurationManager();
    }
    return configManagerRef.current;
  }, []);

  const urlGenerator = useCallback(() => {
    if (!urlGeneratorRef.current) {
      urlGeneratorRef.current = new VidsrcEmbedURLGenerator();
    }
    return urlGeneratorRef.current;
  }, []);

  const generateURL = useCallback(
    async (manager: VidsrcConfigurationManager, generator: VidsrcEmbedURLGenerator, forceDomain?: DomainProvider | null) => {
      try {
        // Validate TMDB ID
        generator.validateTmdbId(tmdbId);

        // Get domain - use preferred domain if provided and valid, otherwise get next available
        let domain: DomainProvider | null = forceDomain || null;
        if (!domain) {
          domain = manager.getNextDomain();
        }
        
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
    [tmdbId, contentType, season, episode, subtitleLanguage, autoplay, customSubtitleUrl, autonext, preferredDomain]
  );

  // Effect to handle preferred domain changes
  useEffect(() => {
    if (preferredDomain && preferredDomain !== state.currentDomain) {
      setState((prev) => ({
        ...prev,
        loading: true,
        error: null,
        embedURL: null,
      }));

      const manager = configManager();
      const generator = urlGenerator();

      generateURL(manager, generator, preferredDomain);
    }
  }, [preferredDomain, state.currentDomain, configManager, urlGenerator, generateURL]);

  const retryWithNextDomain = useCallback(() => {
    setState((prev) => ({
      ...prev,
      loading: true,
      error: null,
      embedURL: null,
    }));

    const manager = configManager();
    const generator = urlGenerator();

    // Mark current domain as failed if we have one
    if (state.currentDomain) {
      manager.markDomainFailed(state.currentDomain);
      console.log(`[Vidsrc] Marked domain as failed: ${state.currentDomain}, trying next domain...`);
    }

    generateURL(manager, generator);
  }, [configManager, urlGenerator, generateURL, state.currentDomain]);

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

    // Reset domain list on full retry
    manager.resetDomains();

    generateURL(manager, generator);
  }, [configManager, urlGenerator, generateURL]);

  useEffect(() => {
    const manager = configManager();
    const generator = urlGenerator();

    generateURL(manager, generator, preferredDomain);
  }, [generateURL, configManager, urlGenerator, preferredDomain]);

  return {
    ...state,
    retry,
    retryWithNextDomain,
  };
}
