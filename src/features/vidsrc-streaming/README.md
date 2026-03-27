# Vidsrc Streaming Integration

A comprehensive streaming integration feature that embeds Vidsrc streaming service directly into movie and TV show detail pages. This feature provides a secure, resilient, and user-friendly streaming experience with automatic domain fallback, subtitle selection, and comprehensive error handling.

## Overview

The Vidsrc streaming integration enables users to stream movies and TV shows directly from the application without leaving the page. The system automatically handles domain provider selection, manages health checks, and provides graceful error handling with user-friendly feedback.

### Key Features

- **Multiple Domain Providers**: Automatic fallback between 4 domain providers (vidsrc-embed.ru, vidsrc-embed.su, vidsrcme.su, vsrc.su)
- **Subtitle Language Selection**: Support for 9 languages with session persistence
- **Season & Episode Selection**: Interactive selector for TV shows with prev/next navigation
- **Video Quality Badges**: Visual indicators for video quality (HD, CAM, 4K, etc.)
- **Responsive Design**: Optimized for mobile, tablet, and desktop viewports
- **Security**: Iframe sandboxing, URL validation, and referrer policy enforcement
- **Error Handling**: Comprehensive error handling with user-friendly messages
- **Health Monitoring**: Periodic health checks and domain recovery
- **Event Logging**: Complete event logging for monitoring and debugging

## Installation

The feature is already integrated into the application. No additional installation is required.

## Usage

### Basic Movie Streaming

```typescript
import { VidsrcStreamingPlayer } from '@/features/vidsrc-streaming/components';

export function MovieDetailsPage({ movieId }: { movieId: number }) {
  return (
    <VidsrcStreamingPlayer
      tmdbId={movieId}
      contentType="movie"
    />
  );
}
```

### TV Show Streaming

```typescript
import { VidsrcStreamingPlayer } from '@/features/vidsrc-streaming/components';

export function TVShowDetailsPage({ showId, season, episode }: Props) {
  return (
    <VidsrcStreamingPlayer
      tmdbId={showId}
      contentType="tv"
      season={season}
      episode={episode}
      totalSeasons={5}
      totalEpisodesInSeason={10}
      videoQuality="HD"
    />
  );
}
```

### With Video Quality Badge

```typescript
import { VidsrcStreamingPlayer } from '@/features/vidsrc-streaming/components';

export function MovieDetailsPage({ movieId }: { movieId: number }) {
  return (
    <VidsrcStreamingPlayer
      tmdbId={movieId}
      contentType="movie"
      videoQuality="4K"  // Options: 'HD', 'CAM', 'TS', 'TC', 'DVDRIP', 'WEBRIP', 'BLURAY', '4K'
    />
  );
}
```

### With Callbacks

```typescript
import { VidsrcStreamingPlayer } from '@/features/vidsrc-streaming/components';
import type { StreamingError } from '@/features/vidsrc-streaming/types';

export function MovieDetailsPage({ movieId }: { movieId: number }) {
  const handleSuccess = () => {
    console.log('Player loaded successfully');
  };

  const handleError = (error: StreamingError) => {
    console.error('Streaming error:', error);
  };

  return (
    <VidsrcStreamingPlayer
      tmdbId={movieId}
      contentType="movie"
      onSuccess={handleSuccess}
      onError={handleError}
    />
  );
}
```

### With Custom Subtitles

```typescript
import { VidsrcStreamingPlayer } from '@/features/vidsrc-streaming/components';

export function MovieDetailsPage({ movieId }: { movieId: number }) {
  return (
    <VidsrcStreamingPlayer
      tmdbId={movieId}
      contentType="movie"
      customSubtitleUrl="https://example.com/subtitles.vtt"
    />
  );
}
```

## Component API

### VidsrcStreamingPlayer

Main component for embedding the streaming player.

#### Props

```typescript
interface StreamingPlayerProps {
  /** TMDB ID for the movie or TV show (required) */
  tmdbId: number;

  /** Content type: 'movie' or 'tv' (required) */
  contentType: 'movie' | 'tv';

  /** Season number (required for TV content) */
  season?: number;

  /** Episode number (required for TV content) */
  episode?: number;

  /** Total number of seasons (for TV shows) */
  totalSeasons?: number;

  /** Total number of episodes in the current season (for TV shows) */
  totalEpisodesInSeason?: number;

  /** Whether to autoplay the video (optional, defaults to false) */
  autoplay?: boolean;

  /** Custom subtitle URL to use (optional) */
  customSubtitleUrl?: string;

  /** Video quality indicator (optional, for display purposes) */
  videoQuality?: 'HD' | 'CAM' | 'TS' | 'TC' | 'DVDRIP' | 'WEBRIP' | 'BLURAY' | '4K';

  /** Callback fired when an error occurs */
  onError?: (error: StreamingError) => void;

  /** Callback fired when streaming loads successfully */
  onSuccess?: () => void;

  /** Callback fired when season changes (TV shows only) */
  onSeasonChange?: (season: number) => void;

  /** Callback fired when episode changes (TV shows only) */
  onEpisodeChange?: (episode: number) => void;
}
```

#### Features

- Automatic embed URL generation from TMDB ID
- Subtitle language selection with session persistence
- Domain fallback on failure
- Responsive 16:9 aspect ratio
- Accessibility features (ARIA labels, keyboard navigation)
- Error boundary integration

### SubtitleLanguageSelector

Component for selecting subtitle languages.

#### Props

```typescript
interface SubtitleLanguageSelectorProps {
  /** Currently selected language */
  selectedLanguage: SubtitleLanguage;

  /** Callback when language changes */
  onLanguageChange: (language: SubtitleLanguage) => void;

  /** Whether the selector is disabled */
  disabled?: boolean;
}
```

#### Supported Languages

- English (en)
- Spanish (es)
- French (fr)
- German (de)
- Portuguese (pt)
- Italian (it)
- Russian (ru)
- Japanese (ja)
- Chinese (zh)

### SeasonEpisodeSelector

Component for selecting season and episode for TV shows.

#### Props

```typescript
interface SeasonEpisodeSelectorProps {
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
```

#### Features

- Dropdown selectors for season and episode
- Automatic episode reset when season changes
- Quick navigation buttons (Prev/Next)
- Responsive layout for mobile and desktop
- Disabled state support

### VideoQualityBadge

Component for displaying video quality indicators.

#### Props

```typescript
interface VideoQualityBadgeProps {
  /** The quality level to display */
  quality?: 'HD' | 'CAM' | 'TS' | 'TC' | 'DVDRIP' | 'WEBRIP' | 'BLURAY' | '4K';

  /** Additional CSS classes */
  className?: string;
}
```

#### Quality Levels

- **4K / BLURAY**: Purple badge (highest quality)
- **HD / WEBRIP**: Green badge (high quality)
- **DVDRIP**: Blue badge (medium quality)
- **TS / TC**: Yellow badge (low quality)
- **CAM**: Red badge (lowest quality)

### VideoQualitySelector

Component for selecting video quality (when multiple sources are available).

#### Props

```typescript
interface VideoQualitySelectorProps {
  /** Available quality options */
  availableQualities: VideoQuality[];

  /** Currently selected quality */
  selectedQuality: VideoQuality;

  /** Callback when quality changes */
  onQualityChange: (quality: VideoQuality) => void;

  /** Whether the selector is disabled */
  disabled?: boolean;
}
```

### StreamErrorBoundary

Error boundary component for catching and handling streaming errors.

#### Props

```typescript
interface StreamErrorBoundaryProps {
  /** The error to display */
  error?: StreamingError | null;

  /** Callback when retry is clicked */
  onRetry?: () => void;

  /** Child components */
  children: React.ReactNode;
}
```

## Services

### VidsrcEmbedURLGenerator

Service for generating and parsing Vidsrc embed URLs.

```typescript
import { VidsrcEmbedURLGenerator } from '@/features/vidsrc-streaming/services';

const generator = new VidsrcEmbedURLGenerator();

// Generate movie URL
const movieUrl = generator.generateMovieURL({
  tmdbId: 550,
  contentType: 'movie',
  domain: 'vidsrc-embed.ru',
  subtitleLanguage: 'en',
  autoplay: false,
});

// Generate TV URL
const tvUrl = generator.generateTVURL({
  tmdbId: 1399,
  contentType: 'tv',
  domain: 'vidsrc-embed.ru',
  season: 1,
  episode: 1,
  subtitleLanguage: 'en',
  autonext: true,
});

// Parse URL
const parsed = generator.parseEmbedURL(movieUrl);

// Validate TMDB ID
generator.validateTmdbId(550); // true

// Validate domain
generator.validateDomain('vidsrc-embed.ru'); // true
```

### VidsrcConfigurationManager

Service for managing domain providers and health checks.

```typescript
import { VidsrcConfigurationManager } from '@/features/vidsrc-streaming/services';

const manager = new VidsrcConfigurationManager();

// Get next available domain
const domain = manager.getNextDomain();

// Mark domain as failed
manager.markDomainFailed('vidsrc-embed.ru');

// Reset domains
manager.resetDomains();

// Get active domain
const activeDomain = manager.getActiveDomain();

// Calculate backoff delay
const delay = manager.calculateBackoffDelay(2); // ~400ms

// Perform health check
await manager.performHealthCheck();

// Start/stop health checks
manager.startHealthChecks();
manager.stopHealthChecks();
```

## Hooks

### useVidsrcPlayer

Hook for managing player state and URL generation.

```typescript
import { useVidsrcPlayer } from '@/features/vidsrc-streaming/hooks';

function MyComponent() {
  const { loading, error, embedURL, currentDomain, retry } = useVidsrcPlayer(
    550,           // tmdbId
    'movie',       // contentType
    undefined,     // season
    undefined,     // episode
    'en',          // language
    false,         // autoplay
    undefined      // customSubtitleUrl
  );

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error.message}</div>;

  return <iframe src={embedURL} />;
}
```

### useSubtitlePreference

Hook for managing subtitle language preference.

```typescript
import { useSubtitlePreference } from '@/features/vidsrc-streaming/hooks';

function MyComponent() {
  const { language, setLanguage } = useSubtitlePreference(550);

  return (
    <select value={language} onChange={(e) => setLanguage(e.target.value as any)}>
      <option value="en">English</option>
      <option value="es">Spanish</option>
      {/* ... */}
    </select>
  );
}
```

### useHealthCheck

Hook for managing health checks.

```typescript
import { useHealthCheck } from '@/features/vidsrc-streaming/hooks';

function MyComponent() {
  const { isHealthy, lastCheckTime } = useHealthCheck();

  return (
    <div>
      Status: {isHealthy ? 'Healthy' : 'Unhealthy'}
      Last check: {lastCheckTime}
    </div>
  );
}
```

## Utilities

### URL Validation

```typescript
import {
  isValidEmbedURL,
  sanitizeEmbedURL,
} from '@/features/vidsrc-streaming/utils/url-validation';

// Validate URL
const isValid = isValidEmbedURL('https://vidsrc-embed.ru/embed/movie?tmdb=550');

// Sanitize URL
const clean = sanitizeEmbedURL('https://vidsrc-embed.ru/embed/movie?tmdb=550');
```

### Error Messages

```typescript
import {
  getErrorMessage,
  getAllErrorMessages,
} from '@/features/vidsrc-streaming/utils/error-messages';

// Get message for error type
const message = getErrorMessage('INVALID_TMDB_ID');

// Get all error messages
const allMessages = getAllErrorMessages();
```

### Logging

```typescript
import {
  logURLGeneration,
  logDomainFailure,
  logSubtitleSelection,
} from '@/features/vidsrc-streaming/utils/logging';

// Log URL generation
logURLGeneration(550, 'vidsrc-embed.ru', { contentType: 'movie' });

// Log domain failure
logDomainFailure('vidsrc-embed.ru', 'timeout', 0);

// Log subtitle selection
logSubtitleSelection(550, 'es');
```

## Configuration

### Environment Variables

```bash
# Enable/disable Vidsrc streaming feature
NEXT_PUBLIC_VIDSRC_ENABLED=true

# Enable/disable autoplay by default
NEXT_PUBLIC_VIDSRC_AUTOPLAY=false

# Default subtitle language
NEXT_PUBLIC_VIDSRC_DEFAULT_LANGUAGE=en

# Enable/disable health checks
NEXT_PUBLIC_VIDSRC_HEALTH_CHECKS_ENABLED=true

# Enable/disable event logging
NEXT_PUBLIC_VIDSRC_LOGGING_ENABLED=true
```

### Domain Configuration

Domain providers are configured in `src/features/vidsrc-streaming/config/domains.ts`:

```typescript
export const DOMAIN_PROVIDERS: DomainProvider[] = [
  'vidsrc-embed.ru',    // Primary
  'vidsrc-embed.su',    // Secondary
  'vidsrcme.su',        // Tertiary
  'vsrc.su',            // Quaternary
];

export const DOMAIN_CONFIG = {
  healthCheckInterval: 5 * 60 * 1000,  // 5 minutes
  failureThreshold: 3,                  // Mark unhealthy after 3 failures
  healthCheckTimeout: 5 * 1000,         // 5 seconds
};
```

### Timeout Configuration

Timeouts are configured in `src/features/vidsrc-streaming/config/constants.ts`:

```typescript
export const TIMEOUTS = {
  embedLoad: 5000,        // 5 seconds
  healthCheck: 5000,      // 5 seconds
  domainFallback: 5000,   // 5 seconds
};

export const BACKOFF_CONFIG = {
  baseDelay: 100,         // 100ms
  maxDelay: 3000,         // 3 seconds
  useJitter: true,        // Add random jitter
  jitterFactor: 0.1,      // 10% jitter
};
```

## Error Handling

### Error Types

```typescript
type StreamingErrorType =
  | 'INVALID_TMDB_ID'      // TMDB ID failed validation
  | 'ALL_DOMAINS_FAILED'   // All domain providers exhausted
  | 'NETWORK_TIMEOUT'      // Request timeout
  | 'INVALID_URL'          // Generated URL failed validation
  | 'IFRAME_LOAD_FAILED'   // Iframe failed to load
  | 'UNKNOWN';             // Unknown error
```

### Error Messages

| Error Type | Message |
|-----------|---------|
| INVALID_TMDB_ID | "Invalid movie ID - streaming unavailable" |
| ALL_DOMAINS_FAILED | "Stream not available - please try again later" |
| NETWORK_TIMEOUT | "Connection timeout - please check your internet connection" |
| INVALID_URL | "Invalid streaming URL" |
| IFRAME_LOAD_FAILED | "Unable to load streaming player" |
| UNKNOWN | "An unexpected error occurred" |

## Security

### Iframe Sandbox Configuration

The iframe is rendered with the following sandbox attributes:

```html
<iframe
  sandbox="allow-scripts allow-same-origin allow-popups allow-presentation"
  referrerPolicy="no-referrer"
/>
```

**Allowed:**
- `allow-scripts`: Required for video player functionality
- `allow-same-origin`: Allows player to access its own resources
- `allow-popups`: Allows external links
- `allow-presentation`: Allows fullscreen mode

**Not Allowed:**
- `allow-top-navigation`: Prevents iframe from navigating parent window

### URL Validation

All URLs are validated before rendering:

1. HTTPS scheme only (no HTTP)
2. Domain must be whitelisted
3. URL must contain `/embed/` path
4. URL must have `tmdb` parameter with non-empty value
5. No suspicious patterns (javascript:, data:, etc.)

## Testing

The feature includes comprehensive test coverage:

- **Unit Tests**: 169 tests covering services, utilities, and hooks
- **Component Tests**: 23 tests for VidsrcStreamingPlayer
- **Security Tests**: 16 tests for iframe sandbox and URL validation
- **Responsive Tests**: 21 tests for responsive design
- **URL Validation Tests**: 40 tests for URL validation
- **Logging Tests**: 19 tests for event logging

Run tests with:

```bash
npm test -- --testPathPatterns="vidsrc"
```

## Performance

- **Player Load Time**: < 2 seconds
- **Domain Fallback**: < 5 seconds per attempt
- **Health Check Interval**: 5 minutes
- **Exponential Backoff**: 100ms base, 3000ms max

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari 14+, Chrome Mobile)

## Accessibility

- ARIA labels on all interactive elements
- Keyboard navigation support
- Focus indicators on buttons
- Color contrast meets WCAG AA standards
- Semantic HTML structure

## Troubleshooting

### Player Not Loading

1. Check browser console for errors
2. Verify TMDB ID is valid
3. Check internet connection
4. Try clicking "Try Again" button
5. Check if domain is accessible

### Subtitles Not Working

1. Verify subtitle language is selected
2. Check if custom subtitle URL is valid
3. Verify subtitle file format (VTT, SRT)
4. Check browser console for CORS errors

### Domain Fallback Issues

1. Check domain health status
2. Verify all domains are accessible
3. Check firewall/proxy settings
4. Review health check logs

## Contributing

When contributing to this feature:

1. Follow existing code style and patterns
2. Add tests for new functionality
3. Update documentation
4. Ensure all tests pass
5. Test on multiple screen sizes

## License

This feature is part of the Movie Discovery Platform and follows the same license.
