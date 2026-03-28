'use client';

import { useState } from 'react';

interface AnimeStreamingPlayerProps {
  anilistId: number;
  episode?: number;
  totalEpisodes?: number;
  season?: number;
  totalSeasons?: number;
  preferredLanguage?: 'sub' | 'dub';
  onEpisodeChange?: (episode: number) => void;
  onSeasonChange?: (season: number) => void;
}

/**
 * AnimeStreamingPlayer Component
 * 
 * Dedicated anime streaming player using VidNest API with AniList IDs
 * Supports episode selection and sub/dub preferences
 */
export function AnimeStreamingPlayer({
  anilistId,
  episode = 1,
  totalEpisodes = 1,
  season = 1,
  totalSeasons = 3,
  preferredLanguage = 'sub',
  onEpisodeChange,
  onSeasonChange,
}: AnimeStreamingPlayerProps) {
  const [currentEpisode, setCurrentEpisode] = useState(episode);
  const [currentSeason, setCurrentSeason] = useState(season);
  const [language, setLanguage] = useState<'sub' | 'dub'>(preferredLanguage);
  const [provider, setProvider] = useState<'vidnest' | 'animepahe'>('vidnest');
  const [iframeError, setIframeError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Generate embed URL based on provider
  const embedURL = provider === 'vidnest'
    ? `https://vidnest.fun/anime/${anilistId}/${currentEpisode}/${language}`
    : `https://vidnest.fun/animepahe/${anilistId}/${currentEpisode}/${language}`;

  const handleSeasonChange = (newSeason: number) => {
    setCurrentSeason(newSeason);
    setCurrentEpisode(1); // Reset to episode 1 when changing seasons
    setIframeError(false);
    setIsLoading(true);
    if (onSeasonChange) {
      onSeasonChange(newSeason);
    }
  };

  const handleEpisodeChange = (newEpisode: number) => {
    setCurrentEpisode(newEpisode);
    setIframeError(false);
    setIsLoading(true);
    if (onEpisodeChange) {
      onEpisodeChange(newEpisode);
    }
  };

  const handlePrevEpisode = () => {
    if (currentEpisode > 1) {
      handleEpisodeChange(currentEpisode - 1);
    }
  };

  const handleNextEpisode = () => {
    if (currentEpisode < totalEpisodes) {
      handleEpisodeChange(currentEpisode + 1);
    }
  };

  const handleProviderChange = (newProvider: 'vidnest' | 'animepahe') => {
    setProvider(newProvider);
    setIframeError(false);
    setIsLoading(true);
  };

  const handleLanguageChange = (newLanguage: 'sub' | 'dub') => {
    setLanguage(newLanguage);
    setIframeError(false);
    setIsLoading(true);
  };

  return (
    <div className="w-full">
      {/* Controls */}
      <div className="mb-4 flex flex-col gap-3">
        {/* Season Selector (if multiple seasons) */}
        {totalSeasons > 1 && (
          <div className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg border border-gray-700">
            <label htmlFor="season-selector" className="text-sm font-medium text-gray-300">
              Season:
            </label>
            <select
              id="season-selector"
              value={currentSeason}
              onChange={(e) => handleSeasonChange(parseInt(e.target.value, 10))}
              className="px-3 py-1 bg-gray-900 text-gray-100 text-sm rounded border border-gray-600 hover:border-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500"
              aria-label="Select season"
            >
              {Array.from({ length: totalSeasons }, (_, i) => i + 1).map((s) => (
                <option key={s} value={s}>
                  Season {s}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Episode Navigation */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handlePrevEpisode}
            disabled={currentEpisode <= 1}
            className="px-3 py-1 bg-gray-800 text-gray-100 text-sm rounded border border-gray-700 hover:border-netflix-red hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            aria-label="Previous episode"
          >
            ← Prev
          </button>
          
          <div className="flex items-center gap-2">
            <label htmlFor="episode-selector" className="text-sm font-medium text-gray-300">
              Episode:
            </label>
            <select
              id="episode-selector"
              value={currentEpisode}
              onChange={(e) => handleEpisodeChange(parseInt(e.target.value, 10))}
              className="px-3 py-1 bg-gray-800 text-gray-100 text-sm rounded border border-gray-700 hover:border-gray-600 focus:outline-none focus:ring-2 focus:ring-netflix-red"
              aria-label="Select episode"
            >
              {Array.from({ length: totalEpisodes }, (_, i) => i + 1).map((ep) => (
                <option key={ep} value={ep}>
                  Episode {ep}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleNextEpisode}
            disabled={currentEpisode >= totalEpisodes}
            className="px-3 py-1 bg-gray-800 text-gray-100 text-sm rounded border border-gray-700 hover:border-netflix-red hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            aria-label="Next episode"
          >
            Next →
          </button>
        </div>

        {/* Language & Provider Selection */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <label htmlFor="language-selector" className="text-sm font-medium text-gray-300">
              Audio:
            </label>
            <select
              id="language-selector"
              value={language}
              onChange={(e) => handleLanguageChange(e.target.value as 'sub' | 'dub')}
              className="px-3 py-1 bg-gray-800 text-gray-100 text-sm rounded border border-gray-700 hover:border-gray-600 focus:outline-none focus:ring-2 focus:ring-netflix-red"
              aria-label="Select audio language"
            >
              <option value="sub">Subbed</option>
              <option value="dub">Dubbed</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label htmlFor="provider-selector" className="text-sm font-medium text-gray-300">
              Source:
            </label>
            <select
              id="provider-selector"
              value={provider}
              onChange={(e) => handleProviderChange(e.target.value as 'vidnest' | 'animepahe')}
              className="px-3 py-1 bg-gray-800 text-gray-100 text-sm rounded border border-gray-700 hover:border-gray-600 focus:outline-none focus:ring-2 focus:ring-netflix-red"
              aria-label="Select streaming provider"
            >
              <option value="vidnest">VidNest</option>
              <option value="animepahe">AnimePahe</option>
            </select>
          </div>
        </div>
      </div>

      {/* Player Container - 16:9 Aspect Ratio */}
      <div className="w-full bg-black rounded-lg overflow-hidden">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900 z-10">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-netflix-red mx-auto mb-4"></div>
              <p className="text-gray-400 text-sm">Loading episode...</p>
            </div>
          </div>
        )}
        
        {iframeError && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900 z-10">
            <div className="text-center p-6">
              <p className="text-red-400 mb-4">Failed to load episode</p>
              <button
                onClick={() => {
                  setIframeError(false);
                  setIsLoading(true);
                }}
                className="px-4 py-2 bg-netflix-red hover:bg-red-700 text-white rounded transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
        )}
        
        <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
          <iframe
            key={embedURL} // Force reload on URL change
            src={embedURL}
            title={`Anime Episode ${currentEpisode}`}
            aria-label={`Anime streaming player - Episode ${currentEpisode}`}
            className="absolute inset-0 w-full h-full border-0 rounded-lg"
            referrerPolicy="no-referrer"
            allowFullScreen
            allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
            loading="lazy"
            onLoad={() => {
              setIsLoading(false);
              setIframeError(false);
              console.log('[AnimePlayer] Player loaded successfully');
              console.log('[AnimePlayer] Embed URL:', embedURL);
            }}
            onError={() => {
              setIsLoading(false);
              setIframeError(true);
              console.warn('[AnimePlayer] Failed to load player');
              console.warn('[AnimePlayer] Failed URL:', embedURL);
            }}
          />
        </div>
      </div>

      {/* Debug Info */}
      <div className="mt-2 text-xs text-gray-500 text-center">
        <details>
          <summary className="cursor-pointer hover:text-gray-400">Debug Info</summary>
          <div className="mt-2 text-left bg-gray-900 p-3 rounded">
            <p>AniList ID: {anilistId}</p>
            {totalSeasons > 1 && <p>Season: {currentSeason}</p>}
            <p>Episode: {currentEpisode}</p>
            <p>Language: {language}</p>
            <p>Provider: {provider}</p>
            <p className="break-all">URL: {embedURL}</p>
          </div>
        </details>
      </div>

      {/* Episode Info */}
      <div className="mt-3 text-center text-sm text-gray-400">
        {totalSeasons > 1 && <span>Season {currentSeason} • </span>}
        Episode {currentEpisode} of {totalEpisodes} • {language === 'sub' ? 'Subbed' : 'Dubbed'}
      </div>
    </div>
  );
}
