'use client';

import { useEffect, useState } from 'react';
import { useVidsrcPlayer } from '../hooks/useVidsrcPlayer';
import { useSubtitlePreference } from '../hooks/useSubtitlePreference';
import type { StreamingPlayerProps, DomainProvider } from '../types/index';
import { DOMAIN_PROVIDERS } from '../config/domains';
import { SubtitleLanguageSelector } from './SubtitleLanguageSelector';
import { StreamErrorBoundary } from './StreamErrorBoundary';
import { LoadingSkeleton } from '@/features/ui/components/LoadingSkeleton';

/**
 * VidsrcStreamingPlayer Component
 *
 * Main component for embedding Vidsrc streaming player into movie/TV details pages.
 * Handles URL generation, subtitle selection, error handling, and responsive layout.
 *
 * Features:
 * - Automatic embed URL generation from TMDB ID
 * - Subtitle language selection with session persistence
 * - Domain fallback on failure
 * - Responsive 16:9 aspect ratio
 * - Accessibility features (ARIA labels, keyboard navigation)
 * - Error boundary integration
 *
 * @example
 * // Basic usage for movies
 * <VidsrcStreamingPlayer
 *   tmdbId={550}
 *   contentType="movie"
 * />
 *
 * @example
 * // TV show with season/episode
 * <VidsrcStreamingPlayer
 *   tmdbId={1399}
 *   contentType="tv"
 *   season={1}
 *   episode={1}
 * />
 *
 * @example
 * // With callbacks
 * <VidsrcStreamingPlayer
 *   tmdbId={550}
 *   contentType="movie"
 *   onSuccess={() => console.log('Player loaded')}
 *   onError={(error) => console.error('Player error:', error)}
 * />
 */
export function VidsrcStreamingPlayer({
  tmdbId,
  contentType,
  season,
  episode,
  autoplay = false,
  customSubtitleUrl,
  onError,
  onSuccess,
}: StreamingPlayerProps) {
  const [selectedDomain, setSelectedDomain] = useState<DomainProvider | null>(null);
  const { language, setLanguage } = useSubtitlePreference(tmdbId);
  const { loading, error, embedURL, retry, retryWithNextDomain, currentDomain } = useVidsrcPlayer(
    tmdbId,
    contentType,
    season,
    episode,
    language,
    autoplay,
    customSubtitleUrl,
    undefined, // autonext
    selectedDomain
  );

  // Update selected domain when current domain changes
  useEffect(() => {
    if (currentDomain && !selectedDomain) {
      setSelectedDomain(currentDomain);
    }
  }, [currentDomain, selectedDomain]);

  // Call onSuccess callback when player loads successfully
  useEffect(() => {
    if (!loading && !error && embedURL && onSuccess) {
      onSuccess();
    }
  }, [loading, error, embedURL, onSuccess]);

  // Call onError callback when error occurs
  useEffect(() => {
    if (error && onError) {
      onError(error);
    }
  }, [error, onError]);

  return (
    <StreamErrorBoundary error={error} onRetry={retry}>
      <div className="w-full">
        {/* TV Show Season/Episode Display */}
        {contentType === 'tv' && season !== undefined && episode !== undefined && (
          <div className="mb-4 text-sm text-gray-400">
            Season {season}, Episode {episode}
          </div>
        )}

        {/* Domain Selector */}
        <div className="mb-4 flex items-center gap-3">
          <label
            htmlFor="domain-selector"
            className="text-sm font-medium text-gray-300"
          >
            Server:
          </label>
          <select
            id="domain-selector"
            value={selectedDomain || ''}
            onChange={(e) => {
              const newDomain = e.target.value as DomainProvider;
              setSelectedDomain(newDomain);
            }}
            disabled={loading}
            className="bg-netflix-dark-secondary text-white text-sm rounded-lg px-3 py-2 border border-netflix-gray/30 focus:outline-none focus:ring-2 focus:ring-netflix-red focus:border-transparent disabled:opacity-50"
          >
            {DOMAIN_PROVIDERS.map((domain) => (
              <option key={domain} value={domain}>
                {domain}
              </option>
            ))}
          </select>
          {loading && (
            <span className="text-xs text-gray-500">Connecting...</span>
          )}
        </div>
        <div className="mb-4 flex items-center gap-3">
          <label
            htmlFor="subtitle-selector"
            className="text-sm font-medium text-gray-300"
          >
            Subtitles:
          </label>
          <SubtitleLanguageSelector
            selectedLanguage={language}
            onLanguageChange={setLanguage}
            disabled={loading}
          />
        </div>

        {/* Loading State */}
        {loading && (
          <div className="w-full bg-black rounded-lg overflow-hidden">
            <div className="aspect-video bg-gray-900 animate-pulse" />
          </div>
        )}

        {/* Player Container - 16:9 Aspect Ratio */}
        {!loading && embedURL && (
          <div className="w-full bg-black rounded-lg overflow-hidden">
            {/* Responsive container with 16:9 aspect ratio */}
            <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
              <iframe
                src={embedURL}
                title="Vidsrc Streaming Player"
                aria-label="Vidsrc Streaming Player"
                className="absolute inset-0 w-full h-full border-0 rounded-lg"
                sandbox="allow-scripts allow-same-origin allow-presentation allow-popups allow-popups-to-escape-sandbox allow-forms allow-top-navigation-by-user-activation"
                referrerPolicy="origin"
                allow="autoplay; fullscreen; picture-in-picture"
                allowFullScreen
                loading="lazy"
                onLoad={() => {
                  // Iframe loaded successfully - clear any errors
                  console.log('[Vidsrc] Player loaded successfully');
                }}
                onError={() => {
                  // If iframe fails to load, trigger retry with next domain
                  console.warn('[Vidsrc] Iframe failed to load, retrying with next domain');
                  retryWithNextDomain();
                }}
              />
            </div>
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="w-full bg-gray-900 rounded-lg p-6 text-center">
            <p className="text-gray-400 mb-4">{error.message}</p>
            <button
              onClick={retry}
              className="bg-netflix-red hover:bg-netflix-red/90 text-white font-semibold py-2 px-6 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-netflix-red focus:ring-offset-2 focus:ring-offset-black"
              aria-label="Retry loading streaming player"
            >
              Try Again
            </button>
          </div>
        )}
      </div>
    </StreamErrorBoundary>
  );
}
