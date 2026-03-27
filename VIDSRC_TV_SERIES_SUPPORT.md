# VidSrc TV Series Support - Implementation Summary

## Overview
VidSrc fully supports TV series in addition to movies. This document outlines how the implementation handles TV series streaming with season and episode selection.

## URL Structure

### Movies
```
https://vidsrc-embed.ru/embed/movie?tmdb=550
```

### TV Series
```
https://vidsrc-embed.ru/embed/tv?tmdb=1399&season=1&episode=1
```

## Key Components

### 1. VidsrcEmbedURLGenerator Service
Handles URL generation for both movies and TV shows:

- **generateMovieURL()** - Generates embed URLs for movies
- **generateTVURL()** - Generates embed URLs for TV shows with season/episode parameters
- **parseEmbedURL()** - Parses and validates embed URLs

**TV URL Parameters:**
- `tmdb` - TMDB ID (required)
- `season` - Season number (required for TV)
- `episode` - Episode number (required for TV)
- `ds_lang` - Subtitle language (optional)
- `autoplay` - Autoplay flag (optional)
- `autonext` - Auto-play next episode (optional for TV)
- `sub_url` - Custom subtitle URL (optional)

### 2. SeasonEpisodeSelector Component
Provides UI controls for selecting seasons and episodes:

**Features:**
- Dropdown selectors for season and episode
- Quick navigation buttons (Previous/Next)
- Automatic episode reset when season changes
- Responsive design with Tailwind CSS
- Accessibility features (ARIA labels)

**Props:**
```typescript
interface SeasonEpisodeSelectorProps {
  selectedSeason: number;
  selectedEpisode: number;
  totalSeasons: number;
  totalEpisodesInSeason: number;
  onSeasonChange: (season: number) => void;
  onEpisodeChange: (episode: number) => void;
  disabled?: boolean;
}
```

### 3. VidsrcStreamingPlayer Component
Main component for embedding the streaming player:

**TV Show Usage:**
```typescript
<VidsrcStreamingPlayer
  tmdbId={1399}
  contentType="tv"
  season={1}
  episode={1}
  totalSeasons={5}
  totalEpisodesInSeason={10}
  videoQuality="HD"
/>
```

**Features:**
- Automatic URL generation based on content type
- Season/episode selector for TV shows
- Subtitle language selection
- Domain/server fallback
- Error handling and retry logic
- Responsive 16:9 aspect ratio
- Security features (sandbox, referrer policy)

### 4. useVidsrcPlayer Hook
Manages player state and URL generation:

```typescript
useVidsrcPlayer(
  tmdbId,           // TMDB ID
  contentType,      // 'movie' | 'tv'
  season,           // Season number (TV only)
  episode,          // Episode number (TV only)
  subtitleLanguage, // Subtitle language code
  autoplay,         // Autoplay flag
  customSubtitleUrl,// Custom subtitle URL
  autonext,         // Auto-play next episode
  preferredDomain   // Preferred domain provider
)
```

## TV Show Details Page Integration

The TV show details page (`src/app/tv/[id]/page.tsx`) integrates the streaming player:

```typescript
<VidsrcStreamingPlayer
  tmdbId={tvId}
  contentType="tv"
  season={initialSeason}
  episode={initialEpisode}
  totalSeasons={tvShow.number_of_seasons}
  totalEpisodesInSeason={episodeCount}
  videoQuality="HD"
/>
```

**URL Parameters:**
- `?season=2&episode=5` - Navigate to specific season/episode

## Security Features

### Iframe Sandbox Attributes
```
sandbox="allow-scripts allow-same-origin allow-popups allow-presentation"
```

### Referrer Policy
```
referrerPolicy="no-referrer"
```

### Allowed Domains (Whitelist)
- vidsrc-embed.ru
- vidsrc-embed.su
- vidsrcme.su
- vsrc.su

## Subtitle Support

VidSrc supports multiple subtitle languages:
- English (en)
- Spanish (es)
- French (fr)
- German (de)
- Portuguese (pt)
- Italian (it)
- Russian (ru)
- Japanese (ja)
- Chinese (zh)
- And more...

Subtitles are persisted per TMDB ID using the `useSubtitlePreference` hook.

## Error Handling

The player includes comprehensive error handling:

1. **Domain Fallback** - Automatically tries next domain on failure
2. **Health Checks** - Periodic health checks for all domains
3. **Retry Logic** - Manual retry button for users
4. **Error Messages** - User-friendly error messages

## Testing

All VidSrc streaming components have comprehensive test coverage:

- `VidsrcStreamingPlayer.test.tsx` - Main component tests
- `VidsrcStreamingPlayer.security.test.tsx` - Security feature tests
- `VidsrcStreamingPlayer.responsive.test.tsx` - Responsive design tests
- `VidsrcEmbedURLGenerator.test.ts` - URL generation tests
- `useVidsrcPlayer.test.ts` - Hook tests
- `SubtitleLanguageSelector.test.tsx` - Subtitle selector tests

## Example: Watching a TV Show

1. User navigates to `/tv/1399` (Game of Thrones)
2. Page loads with Season 1, Episode 1 by default
3. User can:
   - Select different season from dropdown
   - Select different episode from dropdown
   - Use Previous/Next buttons for quick navigation
   - Change subtitle language
   - Switch streaming server if one fails
4. Player generates URL: `https://vidsrc-embed.ru/embed/tv?tmdb=1399&season=1&episode=1&ds_lang=en`
5. Iframe loads and plays the episode

## Browser Compatibility

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

## Performance Considerations

- Lazy loading of iframe
- Responsive image loading for posters
- Efficient state management with React hooks
- Domain health checks run in background
- Subtitle preferences cached in session storage
