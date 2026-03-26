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
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const { language, setLanguage } = useSubtitlePreference(tmdbId);
  const { loading, error, embedURL, retry, retryWithNextDomain, currentDomain } = useVidsrcPlayer(
    tmdbId,
    contentType,
    season,
    episode,
    language,
    autoplay,
    customSubtitleUrl,
    undefined,
    selectedDomain
  );

  // Update selected domain when current domain changes
  useEffect(() => {
    if (currentDomain && !selectedDomain) {
      setSelectedDomain(currentDomain);
    }
  }, [currentDomain, selectedDomain]);

  // Create blob URL to break frame chain and bypass Vidsrc sandbox detection
  useEffect(() => {
    if (!embedURL) {
      setBlobUrl(null);
      return;
    }

    // Create HTML that wraps the embed URL in an iframe
    // This breaks the frame chain so Vidsrc's sbx.js can't detect the parent frame
    const html = `<!DOCTYPE html>
<html>
  <head>
    <style>* { margin: 0; padding: 0; overflow: hidden; }</style>
  </head>
  <body>
    <iframe
      src="${embedURL}"
      style="width:100vw;height:100vh;border:none;"
      allowfullscreen
      allow="autoplay; fullscreen; picture-in-picture"
    ></iframe>
  </body>
</html>`;

    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    setBlobUrl(url);

    // Cleanup old blob URLs to avoid memory leaks
    return () => URL.revokeObjectURL(url);
  }, [embedURL]);

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

        {/* Subtitle Selector and Domain Selector */}
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="flex items-center gap-3">
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

          {/* Domain/Server Selector */}
          <div className="flex items-center gap-3">
            <label
              htmlFor="domain-selector"
              className="text-sm font-medium text-gray-300"
            >
              Server:
            </label>
            <select
              id="domain-selector"
              value={selectedDomain || currentDomain || ''}
              onChange={(e) => {
                const newDomain = e.target.value as DomainProvider;
                if (newDomain) {
                  setSelectedDomain(newDomain);
                }
              }}
              disabled={loading}
              className="px-3 py-1 bg-gray-800 text-gray-100 text-sm rounded border border-gray-700 hover:border-gray-600 focus:outline-none focus:ring-2 focus:ring-netflix-red disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Select streaming server"
            >
              <option value="">Select a server...</option>
              {DOMAIN_PROVIDERS.map((domain) => (
                <option key={domain} value={domain}>
                  {domain}
                </option>
              ))}
            </select>
          </div>
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
                src={blobUrl ?? ''}
                title="Vidsrc Streaming Player"
                aria-label="Vidsrc Streaming Player"
                className="absolute inset-0 w-full h-full border-0 rounded-lg"
                sandbox="allow-scripts allow-popups allow-presentation allow-forms"
                referrerPolicy="no-referrer"
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
