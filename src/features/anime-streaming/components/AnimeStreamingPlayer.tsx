'use client';

import { useState, useEffect, useMemo } from 'react';

type Provider = 'vidnest' | 'animepahe' | 'vidsrc' | 'vidsrcicu';

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

const PROVIDERS: { value: Provider; label: string }[] = [
  { value: 'vidnest',   label: 'VidNest'   },
  { value: 'animepahe', label: 'AnimePahe' },
  { value: 'vidsrc',    label: 'VidSrc'    },
  { value: 'vidsrcicu', label: 'VidSrc.icu' },
];

export function AnimeStreamingPlayer({
  anilistId,
  episode = 1,
  totalEpisodes = 1,
  season = 1,
  totalSeasons = 1,
  preferredLanguage = 'sub',
  onEpisodeChange,
  onSeasonChange,
}: AnimeStreamingPlayerProps) {
  const [currentEpisode, setCurrentEpisode] = useState(episode);
  const [currentSeason, setCurrentSeason] = useState(season);
  const [language, setLanguage] = useState<'sub' | 'dub'>(preferredLanguage);
  const [provider, setProvider] = useState<Provider>('vidnest');
  const [iframeError, setIframeError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isTheaterMode, setIsTheaterMode] = useState(false);

  // Sync state if props change
  useEffect(() => {
    setCurrentEpisode(episode);
    setCurrentSeason(season);
    setIsLoading(true);
  }, [anilistId, episode, season]);

  // Prevent background scrolling when in Theater Mode
  useEffect(() => {
    if (isTheaterMode) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isTheaterMode]);

  const embedURL = useMemo(() => {
    switch (provider) {
      case 'vidnest':
        return `https://vidnest.fun/anime/${anilistId}/${currentEpisode}/${language}?autoplay=0`;
      case 'animepahe':
        return `https://vidnest.fun/animepahe/${anilistId}/${currentEpisode}/${language}?autoplay=0`;
      case 'vidsrc':
        return `https://vidsrc.cc/v2/embed/anime/ani${anilistId}/${currentEpisode}/${language}?autoPlay=0`;
      case 'vidsrcicu':
        return `https://vidsrc.icu/embed/anime/${anilistId}/${currentEpisode}/${language === 'dub' ? 1 : 0}`;
    }
  }, [anilistId, currentEpisode, language, provider]);

  const handleProviderChange = (newProvider: Provider) => {
    setProvider(newProvider);
    setIframeError(false);
    setIsLoading(true);
  };

  const handleSeasonChange = (newSeason: number) => {
    setCurrentSeason(newSeason);
    setCurrentEpisode(1);
    setIsLoading(true);
    setIframeError(false);
    onSeasonChange?.(newSeason);
  };

  const handleEpisodeChange = (newEpisode: number) => {
    setCurrentEpisode(newEpisode);
    setIsLoading(true);
    setIframeError(false);
    onEpisodeChange?.(newEpisode);
  };

  return (
    <div className="w-full max-w-5xl mx-auto">
      {/* Controls */}
      <div className="mb-4 flex flex-col gap-3">
        {totalSeasons > 1 && (
          <div className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg border border-gray-700">
            <label className="text-sm font-medium text-gray-300">Season:</label>
            <select
              value={currentSeason}
              onChange={(e) => handleSeasonChange(parseInt(e.target.value, 10))}
              className="px-3 py-1 bg-gray-900 text-gray-100 text-sm rounded border border-gray-600 focus:ring-2 focus:ring-red-500"
            >
              {Array.from({ length: totalSeasons }, (_, i) => i + 1).map((s) => (
                <option key={s} value={s}>Season {s}</option>
              ))}
            </select>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Episode navigation */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleEpisodeChange(currentEpisode - 1)}
              disabled={currentEpisode <= 1}
              className="px-4 py-1 bg-gray-800 disabled:opacity-30 rounded border border-gray-700 hover:bg-gray-700 transition-colors"
            >
              ← Prev
            </button>
            <select
              value={currentEpisode}
              onChange={(e) => handleEpisodeChange(parseInt(e.target.value, 10))}
              className="px-3 py-1 bg-gray-800 text-sm rounded border border-gray-700"
            >
              {Array.from({ length: totalEpisodes }, (_, i) => i + 1).map((ep) => (
                <option key={ep} value={ep}>Episode {ep}</option>
              ))}
            </select>
            <button
              onClick={() => handleEpisodeChange(currentEpisode + 1)}
              disabled={currentEpisode >= totalEpisodes}
              className="px-4 py-1 bg-gray-800 disabled:opacity-30 rounded border border-gray-700 hover:bg-gray-700 transition-colors"
            >
              Next →
            </button>
          </div>

          {/* Settings Group */}
          <div className="flex flex-wrap gap-4 items-center">
            {/* Theater Mode Toggle */}
            <button 
              onClick={() => setIsTheaterMode(!isTheaterMode)}
              className={`px-3 py-1 text-xs rounded border transition-all ${
                isTheaterMode 
                ? 'bg-yellow-600 border-yellow-500 text-white' 
                : 'bg-gray-800 border-gray-700 text-gray-400 hover:text-white'
              }`}
            >
              {isTheaterMode ? 'Exit Theater' : 'Theater Mode'}
            </button>

            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as 'sub' | 'dub')}
              className="bg-transparent text-sm text-gray-300 outline-none"
            >
              <option value="sub">Sub</option>
              <option value="dub">Dub</option>
            </select>

            <div className="flex gap-1">
              {PROVIDERS.map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => handleProviderChange(value)}
                  className={`px-3 py-1 text-xs rounded border transition-colors ${
                    provider === value
                      ? 'bg-red-600 border-red-500 text-white'
                      : 'bg-gray-800 border-gray-700 text-gray-400 hover:bg-gray-700 hover:text-white'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Player Container */}
      <div className={`transition-all duration-500 shadow-2xl ${
        isTheaterMode 
          ? 'fixed inset-0 z-[100] w-screen h-screen bg-black' 
          : 'relative w-full aspect-video bg-black rounded-lg overflow-hidden border border-gray-800'
      }`}>
        
        {/* Theater Mode Exit (Overlay) */}
        {isTheaterMode && (
          <button 
            onClick={() => setIsTheaterMode(false)}
            className="absolute top-6 right-6 z-[110] p-3 bg-black/50 hover:bg-black/80 text-white rounded-full backdrop-blur-md transition-all border border-white/10"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        )}

        {isLoading && !iframeError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900 z-20">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-red-600 mb-2"></div>
            <p className="text-xs text-gray-500">Buffering source...</p>
          </div>
        )}
        
        {iframeError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900 z-30">
            <p className="text-red-500 mb-2 text-sm">Provider connection failed</p>
            <button
              onClick={() => { setIframeError(false); setIsLoading(true); }}
              className="text-xs underline text-gray-400"
            >
              Retry
            </button>
          </div>
        )}

        <iframe
          key={embedURL}
          src={embedURL}
          title={`Episode ${currentEpisode}`}
          className="w-full h-full border-none"
          referrerPolicy="no-referrer"
          allowFullScreen
          allow="fullscreen; picture-in-picture; encrypted-media"
          onLoad={() => setIsLoading(false)}
          onError={() => { setIsLoading(false); setIframeError(true); }}
        />
      </div>

      <div className="mt-4 text-center text-xs text-gray-500 uppercase tracking-widest">
        Now Playing: Ep {currentEpisode} / {totalEpisodes} · {language.toUpperCase()} · {PROVIDERS.find(p => p.value === provider)?.label}
      </div>
    </div>
  );
}