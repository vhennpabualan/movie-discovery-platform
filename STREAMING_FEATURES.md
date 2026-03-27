# Streaming Features Guide

This document explains the new features added to the Vidsrc streaming integration: video quality badges and season/episode selection for TV shows.

## Overview

Two major features have been added to enhance the streaming experience:

1. **Video Quality Badges** - Visual indicators showing the quality of the video stream (HD, CAM, 4K, etc.)
2. **Season & Episode Selection** - Interactive controls for TV shows to select and navigate between seasons and episodes

## Video Quality Badges

### What is it?

Video quality badges are visual indicators that display the quality level of the streaming content. They help users quickly identify the video quality before watching.

### Quality Levels

The following quality levels are supported:

| Quality | Badge Color | Description |
|---------|------------|-------------|
| 4K | Purple | Ultra HD 4K resolution |
| BLURAY | Purple | Blu-ray quality |
| HD | Green | High Definition (720p/1080p) |
| WEBRIP | Green | Web-ripped HD quality |
| DVDRIP | Blue | DVD-ripped quality |
| TS | Yellow | Telesync (theater recording) |
| TC | Yellow | Telecine (theater recording) |
| CAM | Red | Camera recording (lowest quality) |

### Usage

#### Basic Usage

```typescript
import { VidsrcStreamingPlayer } from '@/features/vidsrc-streaming/components';

export function MoviePage() {
  return (
    <VidsrcStreamingPlayer
      tmdbId={550}
      contentType="movie"
      videoQuality="HD"
    />
  );
}
```

#### Using the Badge Component Directly

```typescript
import { VideoQualityBadge } from '@/features/vidsrc-streaming/components';

export function MovieCard() {
  return (
    <div>
      <h3>Fight Club</h3>
      <VideoQualityBadge quality="4K" />
    </div>
  );
}
```

#### Dynamic Quality Selection

```typescript
import { VideoQualitySelector } from '@/features/vidsrc-streaming/components';
import { useState } from 'react';

export function PlayerControls() {
  const [quality, setQuality] = useState<VideoQuality>('HD');

  return (
    <VideoQualitySelector
      availableQualities={['4K', 'HD', 'DVDRIP']}
      selectedQuality={quality}
      onQualityChange={setQuality}
    />
  );
}
```

### Implementation Details

- Quality badges are purely visual indicators
- The actual video quality depends on the streaming provider (Vidsrc)
- Badge colors are designed for quick visual identification
- Badges are responsive and work on all screen sizes

## Season & Episode Selection

### What is it?

For TV shows, users can now select which season and episode they want to watch using interactive dropdown menus and quick navigation buttons.

### Features

- **Season Selector**: Dropdown to select any season
- **Episode Selector**: Dropdown to select any episode in the current season
- **Quick Navigation**: Prev/Next buttons to quickly move between episodes
- **Auto-Reset**: When changing seasons, automatically resets to episode 1
- **Smart Navigation**: Prev/Next buttons automatically handle season boundaries

### Usage

#### Basic TV Show Streaming

```typescript
import { VidsrcStreamingPlayer } from '@/features/vidsrc-streaming/components';

export function TVShowPage() {
  return (
    <VidsrcStreamingPlayer
      tmdbId={1399}  // Game of Thrones
      contentType="tv"
      season={1}
      episode={1}
      totalSeasons={8}
      totalEpisodesInSeason={10}
      videoQuality="HD"
    />
  );
}
```

#### With Callbacks

```typescript
import { VidsrcStreamingPlayer } from '@/features/vidsrc-streaming/components';
import { useState } from 'react';

export function TVShowPage() {
  const [currentSeason, setCurrentSeason] = useState(1);
  const [currentEpisode, setCurrentEpisode] = useState(1);

  const handleSeasonChange = (season: number) => {
    console.log(`Season changed to: ${season}`);
    setCurrentSeason(season);
    // You could fetch new episode data here
  };

  const handleEpisodeChange = (episode: number) => {
    console.log(`Episode changed to: ${episode}`);
    setCurrentEpisode(episode);
    // You could update URL or analytics here
  };

  return (
    <VidsrcStreamingPlayer
      tmdbId={1399}
      contentType="tv"
      season={currentSeason}
      episode={currentEpisode}
      totalSeasons={8}
      totalEpisodesInSeason={10}
      onSeasonChange={handleSeasonChange}
      onEpisodeChange={handleEpisodeChange}
    />
  );
}
```

#### Using the Selector Component Directly

```typescript
import { SeasonEpisodeSelector } from '@/features/vidsrc-streaming/components';
import { useState } from 'react';

export function TVShowControls() {
  const [season, setSeason] = useState(1);
  const [episode, setEpisode] = useState(1);

  return (
    <SeasonEpisodeSelector
      selectedSeason={season}
      selectedEpisode={episode}
      totalSeasons={5}
      totalEpisodesInSeason={12}
      onSeasonChange={setSeason}
      onEpisodeChange={setEpisode}
    />
  );
}
```

### Navigation Behavior

#### Prev Button

- If on episode 2+: Goes to previous episode in current season
- If on episode 1 of season 2+: Goes to last episode of previous season
- Disabled if on Season 1, Episode 1

#### Next Button

- If not on last episode: Goes to next episode in current season
- If on last episode of a season: Goes to episode 1 of next season
- Disabled if on last episode of last season

### Implementation Details

- Episode count is fetched from TMDB API for each season
- Selector state is managed internally with React hooks
- Changes trigger player reload with new season/episode
- URL can be updated via callbacks to maintain state on refresh

## Complete Example: TV Show Details Page

Here's a complete example showing both features in action:

```typescript
import { Suspense } from 'react';
import { getTVShowDetails } from '@/lib/api/tmdb-client';
import { VidsrcStreamingPlayer } from '@/features/vidsrc-streaming/components';

interface TVShowPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ season?: string; episode?: string }>;
}

async function TVShowContent({ tvId, season, episode }: any) {
  const tvShow = await getTVShowDetails(tvId);
  
  // Find episode count for selected season
  const seasonData = tvShow.seasons.find(s => s.season_number === season);
  const episodeCount = seasonData?.episode_count || 1;

  return (
    <div>
      <h1>{tvShow.name}</h1>
      
      {/* Streaming Player with both features */}
      <VidsrcStreamingPlayer
        tmdbId={tvId}
        contentType="tv"
        season={season}
        episode={episode}
        totalSeasons={tvShow.number_of_seasons}
        totalEpisodesInSeason={episodeCount}
        videoQuality="HD"
        onSeasonChange={(newSeason) => {
          // Update URL or analytics
          console.log(`Watching Season ${newSeason}`);
        }}
        onEpisodeChange={(newEpisode) => {
          // Update URL or analytics
          console.log(`Watching Episode ${newEpisode}`);
        }}
      />
    </div>
  );
}

export default async function TVShowPage({ params, searchParams }: TVShowPageProps) {
  const { id } = await params;
  const { season = '1', episode = '1' } = await searchParams;
  
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <TVShowContent 
        tvId={parseInt(id)} 
        season={parseInt(season)}
        episode={parseInt(episode)}
      />
    </Suspense>
  );
}
```

## API Reference

### VidsrcStreamingPlayer Props

```typescript
interface StreamingPlayerProps {
  tmdbId: number;                    // TMDB ID (required)
  contentType: 'movie' | 'tv';       // Content type (required)
  season?: number;                   // Season number (TV only)
  episode?: number;                  // Episode number (TV only)
  totalSeasons?: number;             // Total seasons (TV only)
  totalEpisodesInSeason?: number;    // Episodes in current season (TV only)
  videoQuality?: VideoQuality;       // Quality badge
  autoplay?: boolean;                // Auto-play video
  customSubtitleUrl?: string;        // Custom subtitle URL
  onError?: (error: StreamingError) => void;
  onSuccess?: () => void;
  onSeasonChange?: (season: number) => void;
  onEpisodeChange?: (episode: number) => void;
}
```

### VideoQuality Type

```typescript
type VideoQuality = 
  | 'HD' 
  | 'CAM' 
  | 'TS' 
  | 'TC' 
  | 'DVDRIP' 
  | 'WEBRIP' 
  | 'BLURAY' 
  | '4K';
```

## Testing

### Testing Video Quality Badges

```typescript
import { render, screen } from '@testing-library/react';
import { VideoQualityBadge } from '@/features/vidsrc-streaming/components';

test('renders HD badge', () => {
  render(<VideoQualityBadge quality="HD" />);
  expect(screen.getByText('HD')).toBeInTheDocument();
});

test('renders 4K badge with correct color', () => {
  const { container } = render(<VideoQualityBadge quality="4K" />);
  const badge = container.querySelector('span');
  expect(badge).toHaveClass('text-purple-400');
});
```

### Testing Season/Episode Selector

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { SeasonEpisodeSelector } from '@/features/vidsrc-streaming/components';

test('changes season', () => {
  const onSeasonChange = jest.fn();
  render(
    <SeasonEpisodeSelector
      selectedSeason={1}
      selectedEpisode={1}
      totalSeasons={5}
      totalEpisodesInSeason={10}
      onSeasonChange={onSeasonChange}
      onEpisodeChange={jest.fn()}
    />
  );
  
  const seasonSelect = screen.getByLabelText('Select season');
  fireEvent.change(seasonSelect, { target: { value: '2' } });
  
  expect(onSeasonChange).toHaveBeenCalledWith(2);
});
```

## Browser Support

Both features are supported on:

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari 14+, Chrome Mobile)

## Accessibility

Both features follow accessibility best practices:

- ARIA labels on all interactive elements
- Keyboard navigation support
- Focus indicators
- Color contrast meets WCAG AA standards
- Screen reader friendly

## Troubleshooting

### Quality Badge Not Showing

- Ensure `videoQuality` prop is provided
- Check that the quality value is one of the supported types
- Verify the component is imported correctly

### Season/Episode Selector Not Working

- Ensure `totalSeasons` and `totalEpisodesInSeason` are provided
- Check that `contentType` is set to `'tv'`
- Verify season and episode numbers are valid
- Check browser console for errors

### Player Not Updating on Season/Episode Change

- Ensure the player component is re-rendering
- Check that the `season` and `episode` props are being updated
- Verify callbacks are firing correctly
- Check network tab for new embed URL requests

## Future Enhancements

Potential future improvements:

1. **Auto-detect quality** from streaming provider
2. **Quality switching** without page reload
3. **Episode thumbnails** in selector
4. **Auto-play next episode** feature
5. **Watch progress tracking** across episodes
6. **Keyboard shortcuts** for navigation (e.g., N for next episode)

## Contributing

When contributing to these features:

1. Follow existing code patterns
2. Add tests for new functionality
3. Update documentation
4. Test on multiple screen sizes
5. Ensure accessibility compliance

## Related Files

- `src/features/vidsrc-streaming/components/VidsrcStreamingPlayer.tsx`
- `src/features/vidsrc-streaming/components/SeasonEpisodeSelector.tsx`
- `src/features/vidsrc-streaming/components/VideoQualityBadge.tsx`
- `src/features/vidsrc-streaming/types/index.ts`
- `src/app/tv/[id]/page.tsx`
- `src/app/movies/[id]/page.tsx`
- `src/lib/api/tmdb-client.ts`

## Support

For issues or questions:

1. Check the main README: `src/features/vidsrc-streaming/README.md`
2. Review the component documentation
3. Check browser console for errors
4. Open an issue with reproduction steps
