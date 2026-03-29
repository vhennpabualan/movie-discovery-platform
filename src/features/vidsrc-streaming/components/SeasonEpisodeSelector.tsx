'use client';

import { useState, useEffect } from 'react';

export interface SeasonEpisodeSelectorProps {
  /** Current selected season */
  selectedSeason: number;
  /** Current selected episode */
  selectedEpisode: number;
  /** Total number of seasons available */
  totalSeasons: number;
  /** Total number of episodes in the selected season */
  totalEpisodesInSeason: number;
  /** Callback when season changes */
  onSeasonChange: (season: number) => void;
  /** Callback when episode changes */
  onEpisodeChange: (episode: number) => void;
  /** Whether the selector is disabled */
  disabled?: boolean;
}

/**
 * SeasonEpisodeSelector Component
 * 
 * Provides dropdowns for selecting season and episode for TV shows.
 * Automatically updates episode options when season changes.
 */
export function SeasonEpisodeSelector({
  selectedSeason,
  selectedEpisode,
  totalSeasons,
  totalEpisodesInSeason,
  onSeasonChange,
  onEpisodeChange,
  disabled = false,
}: SeasonEpisodeSelectorProps) {
  const [localSeason, setLocalSeason] = useState(selectedSeason);
  const [localEpisode, setLocalEpisode] = useState(selectedEpisode);

  // Update local state when props change
  useEffect(() => {
    setLocalSeason(selectedSeason);
    setLocalEpisode(selectedEpisode);
  }, [selectedSeason, selectedEpisode]);

  const handleSeasonChange = (newSeason: number) => {
    setLocalSeason(newSeason);
    setLocalEpisode(1); // Reset to episode 1 when season changes
    onSeasonChange(newSeason);
    onEpisodeChange(1);
  };

  const handleEpisodeChange = (newEpisode: number) => {
    setLocalEpisode(newEpisode);
    onEpisodeChange(newEpisode);
  };

  return (
    <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
      {/* Season Selector */}
      <div className="flex items-center gap-2">
        <label
          htmlFor="season-selector"
          className="text-sm font-medium text-gray-300 whitespace-nowrap"
        >
          Season:
        </label>
        <select
          id="season-selector"
          value={localSeason}
          onChange={(e) => handleSeasonChange(Number(e.target.value))}
          disabled={disabled}
          className="px-3 py-1.5 bg-gray-800 text-gray-100 text-sm rounded border border-gray-700 hover:border-gray-600 focus:outline-none focus:ring-2 focus:ring-netflix-red disabled:opacity-50 disabled:cursor-not-allowed min-w-[80px]"
          aria-label="Select season"
        >
          {Array.from({ length: totalSeasons }, (_, i) => i + 1).map((season) => (
            <option key={season} value={season}>
              {season}
            </option>
          ))}
        </select>
      </div>

      {/* Episode Selector */}
      <div className="flex items-center gap-2">
        <label
          htmlFor="episode-selector"
          className="text-sm font-medium text-gray-300 whitespace-nowrap"
        >
          Episode:
        </label>
        <select
          id="episode-selector"
          value={localEpisode}
          onChange={(e) => handleEpisodeChange(Number(e.target.value))}
          disabled={disabled}
          className="px-3 py-1.5 bg-gray-800 text-gray-100 text-sm rounded border border-gray-700 hover:border-gray-600 focus:outline-none focus:ring-2 focus:ring-netflix-red disabled:opacity-50 disabled:cursor-not-allowed min-w-[80px]"
          aria-label="Select episode"
        >
          {Array.from({ length: totalEpisodesInSeason }, (_, i) => i + 1).map((episode) => (
            <option key={episode} value={episode}>
              {episode}
            </option>
          ))}
        </select>
      </div>

      {/* Quick Navigation Buttons */}
      <div className="flex gap-2">
        <button
          onClick={() => {
            if (localEpisode > 1) {
              handleEpisodeChange(localEpisode - 1);
            } else if (localSeason > 1) {
              handleSeasonChange(localSeason - 1);
            }
          }}
          disabled={disabled || (localSeason === 1 && localEpisode === 1)}
          className="px-3 py-1.5 bg-gray-800 text-gray-100 text-sm rounded border border-gray-700 hover:border-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-netflix-red disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          aria-label="Previous episode"
          title="Previous episode"
        >
          ← Prev
        </button>
        <button
          onClick={() => {
            if (localEpisode < totalEpisodesInSeason) {
              handleEpisodeChange(localEpisode + 1);
            } else if (localSeason < totalSeasons) {
              handleSeasonChange(localSeason + 1);
            }
          }}
          disabled={
            disabled ||
            (localSeason === totalSeasons && localEpisode === totalEpisodesInSeason)
          }
          className="px-3 py-1.5 bg-gray-800 text-gray-100 text-sm rounded border border-gray-700 hover:border-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-netflix-red disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          aria-label="Next episode"
          title="Next episode"
        >
          Next →
        </button>
      </div>
    </div>
  );
}
