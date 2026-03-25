# Vidsrc Streaming Integration - Design Document

## Overview

The Vidsrc streaming integration adds video streaming capabilities to the movie discovery platform by embedding Vidsrc's streaming service directly into movie detail pages. This design provides a secure, resilient, and user-friendly streaming experience that complements the existing TMDB data integration.

### Key Design Goals

1. **Resilience**: Multiple domain providers with automatic fallback ensure streaming availability
2. **Security**: Iframe sandboxing and URL validation protect against malicious content
3. **User Experience**: Seamless integration with existing movie details page, subtitle selection, and responsive design
4. **Observability**: Comprehensive logging and health monitoring for operational visibility
5. **Maintainability**: Clear separation of concerns with dedicated components for URL generation, configuration, and error handling

### System Context

The integration sits between the movie details page and the Vidsrc API, providing:
- Embed URL generation from TMDB IDs
- Domain provider management with health checks
- Subtitle language selection and persistence
- Error handling and user feedback
- Event logging for monitoring

---

## Architecture

### High-Level System Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    Movie Details Page                           │
│              (src/app/movies/[id]/page.tsx)                     │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│              VidsrcStreamingPlayer Component                     │
│         (Main entry point for streaming integration)            │
│  - Handles subtitle language selection                          │
│  - Manages player lifecycle                                     │
│  - Displays error states                                        │
└────────────────────────┬────────────────────────────────────────┘
                         │
        ┌────────────────┼────────────────┐
        │                │                │
        ▼                ▼                ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│ VidsrcConfig │ │ EmbedURL     │ │ StreamError  │
│ Manager      │ │ Generator    │ │ Boundary     │
│              │ │              │ │              │
│ - Domain     │ │ - URL        │ │ - Error      │
│   selection  │ │   building   │ │   handling   │
│ - Health     │ │ - Parameter  │ │ - Fallback   │
│   checks     │ │   encoding   │ │   UI         │
│ - Retry      │ │ - Validation │ │              │
│   logic      │ │              │ │              │
└──────┬───────┘ └──────┬───────┘ └──────────────┘
       │                │
       └────────────────┼────────────────┐
                        │                │
                        ▼                ▼
            ┌──────────────────┐  ┌──────────────────┐
            │  Vidsrc API      │  │  Session Storage │
            │  (Multiple       │  │  (Subtitle prefs)│
            │   domains)       │  │                  │
            └──────────────────┘  └──────────────────┘
```

### Data Flow

1. **Initialization**: Movie details page loads with TMDB ID
2. **URL Generation**: VidsrcConfigurationManager generates embed URL using EmbedURLGenerator
3. **Domain Selection**: ConfigurationManager selects primary domain, with fallbacks ready
4. **Rendering**: VidsrcStreamingPlayer renders iframe with generated URL
5. **User Interaction**: Subtitle selection updates URL and persists preference
6. **Error Handling**: StreamErrorBoundary catches failures and triggers retry logic
7. **Monitoring**: All events logged to monitoring service

### Integration Points

#### With Movie Details Page
- Positioned below movie overview section
- Receives TMDB ID as prop
- Maintains 16:9 aspect ratio
- Responsive across mobile, tablet, desktop

#### With TMDB Client
- Uses existing `getMovieDetails()` to validate movie exists
- Extracts TMDB ID for URL generation
- No additional TMDB API calls needed

#### With Session Storage
- Stores selected subtitle language preference
- Key format: `vidsrc_subtitle_lang_{tmdb_id}`
- Persists across page navigations within session

---

## Components and Interfaces

### VidsrcStreamingPlayer Component

**Purpose**: Main component that orchestrates the streaming player experience.

**Location**: `src/features/vidsrc-streaming/components/VidsrcStreamingPlayer.tsx`

**Props**:
```typescript
interface VidsrcStreamingPlayerProps {
  tmdbId: number;
  contentType: 'movie' | 'tv';
  season?: number;
  episode?: number;
  autoplay?: boolean;
  customSubtitleUrl?: string;
}
```

**Responsibilities**:
- Render subtitle language selector
- Manage subtitle preference state
- Coordinate with ConfigurationManager for URL generation
- Handle iframe rendering with security attributes
- Display loading and error states

**Key Features**:
- Subtitle language persistence in session storage
- Responsive iframe sizing (16:9 aspect ratio)
- Accessibility: ARIA labels, keyboard navigation
- Error boundary integration

### VidsrcConfigurationManager

**Purpose**: Manages domain provider selection, health checks, and retry logic.

**Location**: `src/features/vidsrc-streaming/services/VidsrcConfigurationManager.ts`

**Key Methods**:
```typescript
class VidsrcConfigurationManager {
  // Get the next available domain provider
  getNextDomain(): DomainProvider | null
  
  // Mark a domain as failed
  markDomainFailed(domain: DomainProvider): void
  
  // Reset domain priority list
  resetDomains(): void
  
  // Perform health check on all domains
  performHealthCheck(): Promise<void>
  
  // Get current active domain
  getActiveDomain(): DomainProvider | null
}
```

**Responsibilities**:
- Maintain ordered list of domain providers
- Track domain health status
- Implement exponential backoff retry logic
- Perform periodic health checks (every 5 minutes)
- Log all domain selection and failure events

**Domain Provider Priority**:
1. vidsrc-embed.ru (primary)
2. vidsrc-embed.su (secondary)
3. vidsrcme.su (tertiary)
4. vsrc.su (quaternary)

### VidsrcEmbedURLGenerator

**Purpose**: Constructs and validates embed URLs with proper parameter encoding.

**Location**: `src/features/vidsrc-streaming/services/VidsrcEmbedURLGenerator.ts`

**Key Methods**:
```typescript
class VidsrcEmbedURLGenerator {
  // Generate embed URL for movie
  generateMovieURL(config: EmbedURLConfig): string
  
  // Generate embed URL for TV episode
  generateTVURL(config: EmbedURLConfig): string
  
  // Parse embed URL to extract parameters
  parseEmbedURL(url: string): ParsedEmbedURL
  
  // Validate TMDB ID
  validateTmdbId(id: number): boolean
  
  // Validate domain is whitelisted
  validateDomain(domain: string): boolean
}
```

**URL Formats**:
- Movie: `https://{domain}/embed/movie?tmdb={tmdb_id}&ds_lang={lang}&autoplay={0|1}&sub_url={url}`
- TV: `https://{domain}/embed/tv?tmdb={tmdb_id}&season={season}&episode={episode}&ds_lang={lang}&autonext={0|1}`

**Responsibilities**:
- Build URLs with proper parameter encoding
- Validate TMDB IDs (positive integers)
- Validate domain against whitelist
- Parse URLs for round-trip validation
- Handle optional parameters (autoplay, custom subtitles, autonext)

### SubtitleLanguageSelector Component

**Purpose**: Provides UI for selecting subtitle languages.

**Location**: `src/features/vidsrc-streaming/components/SubtitleLanguageSelector.tsx`

**Props**:
```typescript
interface SubtitleLanguageSelectorProps {
  selectedLanguage: SubtitleLanguage;
  onLanguageChange: (language: SubtitleLanguage) => void;
  disabled?: boolean;
}
```

**Supported Languages**:
- English (en)
- Spanish (es)
- French (fr)
- German (de)
- Portuguese (pt)
- Italian (it)
- Russian (ru)
- Japanese (ja)
- Chinese (zh)

**Responsibilities**:
- Render language dropdown/selector
- Handle language selection changes
- Trigger URL update when language changes
- Persist selection to session storage

### StreamErrorBoundary Component

**Purpose**: Catches and handles streaming errors with user-friendly fallback UI.

**Location**: `src/features/vidsrc-streaming/components/StreamErrorBoundary.tsx`

**Error States Handled**:
1. Invalid TMDB ID
2. All domains unavailable
3. Network timeout
4. Invalid embed URL
5. Iframe loading failure

**Responsibilities**:
- Catch rendering errors
- Display appropriate error message
- Provide "Try Again" button
- Log errors to monitoring service
- Show fallback UI with helpful information

---

## Data Models

### EmbedURLConfig Interface

```typescript
interface EmbedURLConfig {
  tmdbId: number;
  contentType: 'movie' | 'tv';
  domain: DomainProvider;
  season?: number;
  episode?: number;
  subtitleLanguage?: SubtitleLanguage;
  autoplay?: boolean;
  customSubtitleUrl?: string;
  autonext?: boolean;
}
```

### DomainProvider Type

```typescript
type DomainProvider = 
  | 'vidsrc-embed.ru'
  | 'vidsrc-embed.su'
  | 'vidsrcme.su'
  | 'vsrc.su';

interface DomainProviderStatus {
  domain: DomainProvider;
  isHealthy: boolean;
  lastHealthCheckTime: number;
  failureCount: number;
  lastFailureTime?: number;
}
```

### StreamingPlayerProps Interface

```typescript
interface StreamingPlayerProps {
  tmdbId: number;
  contentType: 'movie' | 'tv';
  season?: number;
  episode?: number;
  autoplay?: boolean;
  customSubtitleUrl?: string;
  onError?: (error: StreamingError) => void;
  onSuccess?: () => void;
}
```

### SubtitleLanguage Type

```typescript
type SubtitleLanguage = 
  | 'en' | 'es' | 'fr' | 'de' | 'pt' 
  | 'it' | 'ru' | 'ja' | 'zh';

interface SubtitleLanguageOption {
  code: SubtitleLanguage;
  label: string;
  nativeLabel: string;
}
```

### ParsedEmbedURL Interface

```typescript
interface ParsedEmbedURL {
  domain: DomainProvider;
  contentType: 'movie' | 'tv';
  tmdbId: number;
  season?: number;
  episode?: number;
  subtitleLanguage?: SubtitleLanguage;
  autoplay?: boolean;
  customSubtitleUrl?: string;
  autonext?: boolean;
}
```

### StreamingError Type

```typescript
type StreamingErrorType = 
  | 'INVALID_TMDB_ID'
  | 'ALL_DOMAINS_FAILED'
  | 'NETWORK_TIMEOUT'
  | 'INVALID_URL'
  | 'IFRAME_LOAD_FAILED'
  | 'UNKNOWN';

interface StreamingError {
  type: StreamingErrorType;
  message: string;
  timestamp: number;
  tmdbId?: number;
  failedDomains?: DomainProvider[];
}
```

---

## Key Algorithms

### Domain Provider Fallback Logic

```
Algorithm: SelectNextDomain()
Input: Current domain list, failure history
Output: Next domain to try or null if all failed

1. Get list of all configured domains
2. Filter out domains marked as unhealthy
3. Sort by:
   a. Failure count (ascending)
   b. Last failure time (most recent first)
   c. Configuration priority order
4. Return first domain in sorted list
5. If no healthy domains, return null and trigger error state
```

### Exponential Backoff Retry Strategy

```
Algorithm: CalculateBackoffDelay(attemptNumber)
Input: Current attempt number (0-indexed)
Output: Delay in milliseconds

1. baseDelay = 100ms
2. maxDelay = 3000ms
3. delay = baseDelay * (2 ^ attemptNumber)
4. jitter = random(0, delay * 0.1)
5. return min(delay + jitter, maxDelay)

Example:
- Attempt 0: ~100ms
- Attempt 1: ~200-220ms
- Attempt 2: ~400-440ms
- Attempt 3: ~800-880ms (capped at 3000ms)
```

### Health Check Mechanism

```
Algorithm: PerformHealthCheck()
Input: List of domain providers
Output: Updated health status for each domain

1. For each domain in provider list:
   a. Create test embed URL with dummy TMDB ID
   b. Attempt HEAD request to domain with 5 second timeout
   c. If response status 200-299:
      - Mark domain as healthy
      - Reset failure count
   d. If timeout or error:
      - Increment failure count
      - Mark as unhealthy if failure count > threshold (3)
      - Record failure timestamp
   e. Log health check result
2. Schedule next health check in 5 minutes
```

### URL Parameter Parsing and Generation

```
Algorithm: ParseEmbedURL(url)
Input: Full embed URL string
Output: ParsedEmbedURL object or error

1. Extract domain from URL using regex
2. Validate domain is in whitelist
3. Parse query parameters:
   a. Extract tmdb ID (required)
   b. Extract season/episode (for TV)
   c. Extract ds_lang (optional)
   d. Extract autoplay (optional)
   e. Extract sub_url (optional)
   f. Extract autonext (optional)
4. Validate TMDB ID is positive integer
5. Return ParsedEmbedURL object
6. If any validation fails, throw error with details

Algorithm: GenerateEmbedURL(config)
Input: EmbedURLConfig object
Output: Valid embed URL string

1. Validate TMDB ID is positive integer
2. Validate domain is in whitelist
3. Build base URL: https://{domain}/embed/{contentType}
4. Add required parameters: tmdb={id}
5. If TV content, add: season={season}&episode={episode}
6. If subtitle language provided, add: ds_lang={lang}
7. If autoplay enabled, add: autoplay=1
8. If custom subtitle URL provided, add: sub_url={encoded_url}
9. If TV and autonext enabled, add: autonext=1
10. Return complete URL
```

---

## Integration Points

### Integration with Movie Details Page

**File**: `src/app/movies/[id]/page.tsx`

**Integration Pattern**:
```typescript
// In MovieDetailsContent component, after overview section:
<section className="mt-12 md:mt-16 pt-6 md:pt-8 border-t border-netflix-gray/20">
  <h2 className="text-2xl md:text-3xl font-bold text-white mb-6">Watch Now</h2>
  <VidsrcStreamingPlayer 
    tmdbId={movieId}
    contentType="movie"
    autoplay={false}
    onError={(error) => logStreamingError(error)}
  />
</section>
```

**Positioning**: Below Related Movies section
**Aspect Ratio**: 16:9 (responsive)
**Mobile Breakpoint**: Full width with padding on screens < 768px

### Integration with TMDB Client

**Usage**:
- No additional TMDB API calls needed
- TMDB ID already available from page params
- Movie validation already performed by `getMovieDetails()`

**Error Handling**:
- If movie doesn't exist (404), streaming player not rendered
- If network error, streaming player shows error state

### Session Storage for Subtitle Preferences

**Storage Key**: `vidsrc_subtitle_lang_{tmdb_id}`
**Storage Value**: SubtitleLanguage code (e.g., 'en', 'es')
**Persistence**: Session-scoped (cleared on browser close)
**Retrieval**: On component mount, check session storage for saved preference

**Implementation**:
```typescript
// Save preference
sessionStorage.setItem(`vidsrc_subtitle_lang_${tmdbId}`, language);

// Retrieve preference
const saved = sessionStorage.getItem(`vidsrc_subtitle_lang_${tmdbId}`);
const language = saved || 'en'; // Default to English
```

---

## Error Handling Strategy

### Network Timeout Handling

**Timeout Duration**: 5 seconds per domain attempt

**Flow**:
1. Attempt to load embed URL from primary domain
2. If no response within 5 seconds, abort request
3. Log timeout event with domain and timestamp
4. Trigger fallback to next domain
5. Repeat until domain available or all exhausted
6. If all timeout, display "Connection timeout" message

### Domain Provider Failure Handling

**Failure Scenarios**:
- HTTP error responses (4xx, 5xx)
- Network errors (DNS, connection refused)
- Timeout (no response within 5 seconds)
- Invalid response format

**Recovery Strategy**:
1. Mark domain as failed
2. Increment failure counter
3. If failure count > 3, mark as unhealthy
4. Select next domain from priority list
5. Retry with exponential backoff
6. Log failure with reason and retry attempt

### Invalid TMDB ID Handling

**Validation**:
- Must be positive integer
- Must be > 0
- Must be <= 2147483647 (32-bit max)

**Error Message**: "Invalid movie ID - streaming unavailable"

**Logging**: Log invalid ID attempt with value for security monitoring

### User-Facing Error Messages

| Error Type | Message | Action |
|-----------|---------|--------|
| Invalid TMDB ID | "Invalid movie ID - streaming unavailable" | None (no retry) |
| All domains failed | "Stream not available - please try again later" | "Try Again" button |
| Network timeout | "Connection timeout - please check your internet connection" | "Retry" button |
| Iframe load failed | "Unable to load streaming player" | "Try Again" button |
| Unknown error | "An unexpected error occurred" | "Try Again" button |

---

## Security Considerations

### Iframe Sandbox Attributes

**Sandbox Configuration**:
```html
<iframe
  src={embedUrl}
  sandbox="allow-scripts allow-same-origin allow-popups allow-presentation"
  referrerPolicy="no-referrer"
  title="Vidsrc Streaming Player"
/>
```

**Rationale**:
- `allow-scripts`: Required for video player functionality
- `allow-same-origin`: Allows player to access its own resources
- `allow-popups`: Allows external links (e.g., to streaming services)
- `allow-presentation`: Allows fullscreen mode
- **NOT included**: `allow-top-navigation` (prevents iframe from navigating parent)

### URL Validation

**Validation Steps**:
1. Parse URL to extract domain
2. Verify domain is in configured whitelist
3. Verify URL scheme is HTTPS only
4. Validate all parameters are properly encoded
5. Reject URLs with suspicious patterns (e.g., javascript:, data:)

**Whitelist**:
```typescript
const ALLOWED_DOMAINS = [
  'vidsrc-embed.ru',
  'vidsrc-embed.su',
  'vidsrcme.su',
  'vsrc.su'
];
```

### Referrer Policy

**Policy**: `no-referrer`

**Rationale**: Prevents Vidsrc from knowing which movie the user is watching, protecting user privacy.

### Domain Whitelist Validation

**Implementation**:
```typescript
function validateDomain(domain: string): boolean {
  const normalizedDomain = domain.toLowerCase().trim();
  return ALLOWED_DOMAINS.includes(normalizedDomain);
}
```

**Enforcement**: All URLs must pass validation before rendering in iframe.

---

## Configuration

### Environment Variables

```bash
# Vidsrc Configuration
NEXT_PUBLIC_VIDSRC_ENABLED=true
NEXT_PUBLIC_VIDSRC_AUTOPLAY=false
NEXT_PUBLIC_VIDSRC_HEALTH_CHECK_INTERVAL=300000  # 5 minutes in ms
NEXT_PUBLIC_VIDSRC_TIMEOUT=5000  # 5 seconds in ms
NEXT_PUBLIC_VIDSRC_MAX_RETRIES=3
NEXT_PUBLIC_VIDSRC_BACKOFF_BASE=100  # milliseconds
NEXT_PUBLIC_VIDSRC_BACKOFF_MAX=3000  # milliseconds
```

### Domain Provider Configuration

**Configuration File**: `src/features/vidsrc-streaming/config/domains.ts`

```typescript
export const DOMAIN_PROVIDERS: DomainProvider[] = [
  'vidsrc-embed.ru',
  'vidsrc-embed.su',
  'vidsrcme.su',
  'vsrc.su'
];

export const DOMAIN_CONFIG = {
  healthCheckInterval: 5 * 60 * 1000, // 5 minutes
  failureThreshold: 3,
  timeoutMs: 5000,
};
```

### Default Settings

- **Autoplay**: Disabled by default (can be enabled via env var)
- **Subtitle Language**: English (en) by default
- **Aspect Ratio**: 16:9
- **Responsive Breakpoints**: 
  - Mobile: < 768px (full width with padding)
  - Tablet: 768px - 1024px (80% width)
  - Desktop: > 1024px (full width)

---

## File Structure

### Proposed Directory Layout

```
src/features/vidsrc-streaming/
├── components/
│   ├── VidsrcStreamingPlayer.tsx
│   ├── VidsrcStreamingPlayer.test.tsx
│   ├── SubtitleLanguageSelector.tsx
│   ├── SubtitleLanguageSelector.test.tsx
│   ├── StreamErrorBoundary.tsx
│   └── StreamErrorBoundary.test.tsx
├── services/
│   ├── VidsrcConfigurationManager.ts
│   ├── VidsrcConfigurationManager.test.ts
│   ├── VidsrcEmbedURLGenerator.ts
│   └── VidsrcEmbedURLGenerator.test.ts
├── config/
│   ├── domains.ts
│   ├── languages.ts
│   └── constants.ts
├── types/
│   └── index.ts
├── hooks/
│   ├── useVidsrcPlayer.ts
│   ├── useSubtitlePreference.ts
│   └── useHealthCheck.ts
├── utils/
│   ├── url-validation.ts
│   ├── error-messages.ts
│   └── logging.ts
└── README.md
```

### File Organization Details

**components/**: React components for UI
- VidsrcStreamingPlayer: Main orchestrator component
- SubtitleLanguageSelector: Language selection dropdown
- StreamErrorBoundary: Error handling wrapper

**services/**: Business logic and API integration
- VidsrcConfigurationManager: Domain management and health checks
- VidsrcEmbedURLGenerator: URL construction and parsing

**config/**: Configuration constants
- domains.ts: Domain provider list and settings
- languages.ts: Supported subtitle languages
- constants.ts: Timeouts, retry settings, etc.

**types/**: TypeScript interfaces and types
- index.ts: All type definitions

**hooks/**: Custom React hooks
- useVidsrcPlayer: Main player state management
- useSubtitlePreference: Subtitle preference persistence
- useHealthCheck: Health check scheduling

**utils/**: Utility functions
- url-validation.ts: URL validation logic
- error-messages.ts: User-facing error messages
- logging.ts: Event logging helpers

---

## Testing Strategy

### Unit Testing Approach

**URL Generation Tests**:
- Test valid movie URL generation
- Test valid TV URL generation with season/episode
- Test parameter encoding (special characters, spaces)
- Test optional parameter inclusion (autoplay, custom subtitles)
- Test TMDB ID validation (negative, zero, non-integer)
- Test domain validation (whitelisted vs non-whitelisted)

**Configuration Manager Tests**:
- Test domain selection from priority list
- Test domain failure marking and recovery
- Test exponential backoff calculation
- Test health check status updates
- Test retry logic with multiple failures

**Error Handling Tests**:
- Test invalid TMDB ID error message
- Test all domains failed error message
- Test network timeout error message
- Test error boundary catches rendering errors

**Subtitle Preference Tests**:
- Test language selection persistence
- Test session storage retrieval
- Test default language fallback

### Component Testing Approach

**VidsrcStreamingPlayer Tests**:
- Test component renders with valid TMDB ID
- Test subtitle selector appears and functions
- Test iframe renders with correct URL
- Test error state displays on failure
- Test responsive layout on different screen sizes
- Test accessibility (ARIA labels, keyboard navigation)

**SubtitleLanguageSelector Tests**:
- Test all language options render
- Test language selection triggers callback
- Test selected language is highlighted
- Test disabled state

**StreamErrorBoundary Tests**:
- Test error boundary catches errors
- Test appropriate error message displays
- Test "Try Again" button triggers retry
- Test error logging occurs

### Integration Testing Approach

**End-to-End Flow**:
1. Load movie details page with valid TMDB ID
2. Verify streaming player renders
3. Select subtitle language
4. Verify URL updates with language parameter
5. Verify preference persists on page reload
6. Simulate domain failure
7. Verify fallback to next domain
8. Verify error message displays if all fail

**Integration with Movie Details Page**:
- Test player positioned correctly below overview
- Test player doesn't interfere with other page elements
- Test responsive behavior on mobile/tablet/desktop
- Test error handling doesn't break page layout

### Property-Based Testing for Round-Trip URL Generation

**Property**: For all valid TMDB IDs and parameter combinations, parsing a generated URL should recover all original parameters.

**Test Configuration**:
- Minimum 100 iterations
- Generate random TMDB IDs (1 to 2147483647)
- Generate random subtitle languages
- Generate random boolean flags (autoplay, autonext)
- Generate random season/episode combinations

**Test Implementation**:
```typescript
// Pseudocode
property('URL round-trip preserves all parameters', () => {
  const config = generateRandomEmbedURLConfig();
  const url = generator.generateEmbedURL(config);
  const parsed = generator.parseEmbedURL(url);
  
  assert(parsed.tmdbId === config.tmdbId);
  assert(parsed.contentType === config.contentType);
  assert(parsed.subtitleLanguage === config.subtitleLanguage);
  assert(parsed.autoplay === config.autoplay);
  // ... verify all parameters
});
```

---

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: URL Format for Movies

*For any* valid TMDB ID, generating a movie embed URL should produce a URL matching the format `https://{domain}/embed/movie?tmdb={tmdb_id}` where domain is one of the configured providers.

**Validates: Requirements 1.1**

### Property 2: Domain Fallback on Failure

*For any* sequence of domain failures, the configuration manager should attempt domains in the configured priority order until a healthy domain is found or all are exhausted.

**Validates: Requirements 1.2, 2.2**

### Property 3: Iframe Sandbox Attributes

*For any* rendered streaming player, the iframe element should contain exactly the sandbox attributes: `allow-scripts`, `allow-same-origin`, `allow-popups`, `allow-presentation`, and should NOT contain `allow-top-navigation`.

**Validates: Requirements 6.1, 6.2**

### Property 4: Subtitle Language Parameter Encoding

*For any* supported subtitle language selection, appending that language to the embed URL should result in the `ds_lang` parameter being present with the correct language code.

**Validates: Requirements 3.2**

### Property 5: Autoplay Parameter Presence

*For any* autoplay configuration, when autoplay is enabled, the generated URL should contain `autoplay=1`; when disabled, the parameter should be absent.

**Validates: Requirements 4.1, 4.2**

### Property 6: Custom Subtitle URL Encoding

*For any* custom subtitle URL provided, the generated embed URL should contain the `sub_url` parameter with the URL properly encoded.

**Validates: Requirements 4.3**

### Property 7: Subtitle Preference Persistence

*For any* selected subtitle language, storing it in session storage and retrieving it should return the same language code.

**Validates: Requirements 3.4**

### Property 8: Timeout Triggers Fallback

*For any* domain that fails to respond within 5 seconds, the configuration manager should mark it as unavailable and attempt the next provider in the priority list.

**Validates: Requirements 5.2, 8.1**

### Property 9: Exponential Backoff Calculation

*For any* retry attempt number, the calculated backoff delay should follow the formula: `min(baseDelay * 2^attempt + jitter, maxDelay)` where baseDelay is 100ms and maxDelay is 3000ms.

**Validates: Requirements 8.4**

### Property 10: TMDB ID Validation

*For any* TMDB ID, validation should accept positive integers and reject zero, negative numbers, and non-integers.

**Validates: Requirements 11.1, 11.3**

### Property 11: TV Episode URL Format

*For any* valid TV show configuration with TMDB ID, season, and episode, generating a TV embed URL should produce a URL matching the format `https://{domain}/embed/tv?tmdb={tmdb_id}&season={season}&episode={episode}`.

**Validates: Requirements 10.1**

### Property 12: Autonext Parameter for TV

*For any* TV show with autonext enabled, the generated URL should contain the `autonext=1` parameter.

**Validates: Requirements 10.3**

### Property 13: Domain Whitelist Validation

*For any* embed URL, the domain should be validated against the configured whitelist before rendering in an iframe.

**Validates: Requirements 6.4**

### Property 14: Referrer Policy Security

*For any* rendered iframe, the `referrerPolicy` attribute should be set to `no-referrer`.

**Validates: Requirements 6.3**

### Property 15: URL Round-Trip Preservation (Core Property)

*For any* valid embed URL configuration (TMDB ID, content type, season, episode, subtitle language, autoplay, custom subtitle URL, autonext), generating the URL and then parsing it should recover all original parameters exactly.

**Validates: Requirements 13.1, 13.2, 13.3, 13.4**

### Property 16: URL Round-Trip Idempotence

*For any* valid embed URL, the round-trip operation (generate → parse → generate) should produce a URL equivalent to the original.

**Validates: Requirements 13.4**

### Property 17: Health Check Interval Consistency

*For any* health check cycle, the next health check should be scheduled exactly 5 minutes after the previous one completes.

**Validates: Requirements 14.1**

### Property 18: Domain Recovery After Health Check

*For any* domain that was marked unhealthy, if a subsequent health check succeeds, the domain should be re-added to the active provider list.

**Validates: Requirements 14.3**

### Property 19: Logging Completeness for URL Generation

*For any* generated embed URL, a log event should be created containing: timestamp, TMDB ID, selected domain provider, and all parameters used.

**Validates: Requirements 9.1**

### Property 20: Logging Completeness for Domain Failures

*For any* domain provider failure, a log event should be created containing: timestamp, domain name, failure reason, and retry attempt number.

**Validates: Requirements 9.2**

### Property 21: Responsive Layout Aspect Ratio

*For any* viewport size, the streaming player should maintain a 16:9 aspect ratio.

**Validates: Requirements 7.2**

### Property 22: Mobile Responsive Scaling

*For any* viewport width less than 768px, the streaming player should scale to fit the mobile screen with appropriate padding.

**Validates: Requirements 7.3**

### Property 23: Retry Resets Domain Priority

*For any* retry attempt after all domains have failed, the domain priority list should be reset and the first domain should be attempted again.

**Validates: Requirements 5.4**

---

## Error Handling

### Error Categories and Responses

**Invalid TMDB ID**
- Validation: Check if ID is positive integer
- Response: Display "Invalid movie ID - streaming unavailable"
- Logging: Log validation failure with invalid ID value
- Recovery: No automatic retry (user must navigate to valid movie)

**All Domains Failed**
- Trigger: All configured domains exhausted without success
- Response: Display "Stream not available - please try again later" with "Try Again" button
- Logging: Log all domain failures with reasons
- Recovery: User can click "Try Again" to reset domain list and retry

**Network Timeout**
- Trigger: Domain doesn't respond within 5 seconds
- Response: Attempt next domain automatically
- Logging: Log timeout with domain and attempt number
- Recovery: Automatic fallback to next domain

**Connection Timeout (All Domains)**
- Trigger: All domains timeout
- Response: Display "Connection timeout - please check your internet connection" with "Retry" button
- Logging: Log all timeouts
- Recovery: User can click "Retry" to attempt again

**Iframe Load Failure**
- Trigger: Iframe fails to load embed URL
- Response: Display "Unable to load streaming player" with "Try Again" button
- Logging: Log iframe load error
- Recovery: User can click "Try Again" to reload

**Unknown Error**
- Trigger: Unexpected error during streaming
- Response: Display "An unexpected error occurred" with "Try Again" button
- Logging: Log full error details for debugging
- Recovery: User can click "Try Again"

### Error Boundary Implementation

The StreamErrorBoundary component wraps the streaming player and:
1. Catches rendering errors
2. Logs errors to monitoring service
3. Displays appropriate error message
4. Provides recovery action (usually "Try Again" button)
5. Prevents error from breaking page layout

---

## Testing Strategy (Detailed)

### Unit Testing

#### URL Generation Tests

**Test Suite**: `VidsrcEmbedURLGenerator.test.ts`

```typescript
describe('VidsrcEmbedURLGenerator', () => {
  // Movie URL generation
  test('generates valid movie URL with TMDB ID', () => {
    const config = { tmdbId: 550, contentType: 'movie', domain: 'vidsrc-embed.ru' };
    const url = generator.generateMovieURL(config);
    expect(url).toMatch(/https:\/\/vidsrc-embed\.ru\/embed\/movie\?tmdb=550/);
  });

  // TV URL generation
  test('generates valid TV URL with season and episode', () => {
    const config = { 
      tmdbId: 1399, 
      contentType: 'tv', 
      season: 1, 
      episode: 1,
      domain: 'vidsrc-embed.ru' 
    };
    const url = generator.generateTVURL(config);
    expect(url).toMatch(/season=1&episode=1/);
  });

  // Parameter encoding
  test('properly encodes special characters in custom subtitle URL', () => {
    const config = { 
      tmdbId: 550, 
      contentType: 'movie',
      domain: 'vidsrc-embed.ru',
      customSubtitleUrl: 'https://example.com/subs?lang=en&format=vtt'
    };
    const url = generator.generateMovieURL(config);
    expect(url).toContain('sub_url=');
    expect(url).not.toContain('?lang='); // Should be encoded
  });

  // TMDB ID validation
  test('rejects negative TMDB IDs', () => {
    expect(() => generator.validateTmdbId(-1)).toThrow();
  });

  test('rejects zero TMDB ID', () => {
    expect(() => generator.validateTmdbId(0)).toThrow();
  });

  test('accepts positive TMDB IDs', () => {
    expect(generator.validateTmdbId(550)).toBe(true);
  });

  // Domain validation
  test('accepts whitelisted domains', () => {
    expect(generator.validateDomain('vidsrc-embed.ru')).toBe(true);
  });

  test('rejects non-whitelisted domains', () => {
    expect(generator.validateDomain('malicious.com')).toBe(false);
  });
});
```

#### Configuration Manager Tests

**Test Suite**: `VidsrcConfigurationManager.test.ts`

```typescript
describe('VidsrcConfigurationManager', () => {
  // Domain selection
  test('returns first domain when all healthy', () => {
    const manager = new VidsrcConfigurationManager();
    expect(manager.getNextDomain()).toBe('vidsrc-embed.ru');
  });

  // Domain failure handling
  test('marks domain as failed and selects next', () => {
    const manager = new VidsrcConfigurationManager();
    manager.markDomainFailed('vidsrc-embed.ru');
    expect(manager.getNextDomain()).toBe('vidsrc-embed.su');
  });

  // Exponential backoff
  test('calculates exponential backoff correctly', () => {
    expect(manager.calculateBackoffDelay(0)).toBeLessThan(150);
    expect(manager.calculateBackoffDelay(1)).toBeLessThan(250);
    expect(manager.calculateBackoffDelay(2)).toBeLessThan(500);
    expect(manager.calculateBackoffDelay(3)).toBeLessThanOrEqual(3000);
  });

  // Health check
  test('marks domain as unhealthy after failed health check', async () => {
    const manager = new VidsrcConfigurationManager();
    // Mock failed health check
    await manager.performHealthCheck();
    // Verify unhealthy domains are excluded
  });

  // Reset functionality
  test('resets domain list on retry', () => {
    const manager = new VidsrcConfigurationManager();
    manager.markDomainFailed('vidsrc-embed.ru');
    manager.resetDomains();
    expect(manager.getNextDomain()).toBe('vidsrc-embed.ru');
  });
});
```

#### Subtitle Preference Tests

**Test Suite**: `useSubtitlePreference.test.ts`

```typescript
describe('useSubtitlePreference', () => {
  test('saves subtitle preference to session storage', () => {
    const { result } = renderHook(() => useSubtitlePreference(550));
    act(() => {
      result.current.setLanguage('es');
    });
    expect(sessionStorage.getItem('vidsrc_subtitle_lang_550')).toBe('es');
  });

  test('retrieves saved preference on mount', () => {
    sessionStorage.setItem('vidsrc_subtitle_lang_550', 'fr');
    const { result } = renderHook(() => useSubtitlePreference(550));
    expect(result.current.language).toBe('fr');
  });

  test('defaults to English when no preference saved', () => {
    sessionStorage.clear();
    const { result } = renderHook(() => useSubtitlePreference(550));
    expect(result.current.language).toBe('en');
  });
});
```

### Component Testing

#### VidsrcStreamingPlayer Tests

**Test Suite**: `VidsrcStreamingPlayer.test.tsx`

```typescript
describe('VidsrcStreamingPlayer', () => {
  test('renders iframe with valid TMDB ID', () => {
    render(<VidsrcStreamingPlayer tmdbId={550} contentType="movie" />);
    const iframe = screen.getByTitle('Vidsrc Streaming Player');
    expect(iframe).toBeInTheDocument();
  });

  test('displays subtitle language selector', () => {
    render(<VidsrcStreamingPlayer tmdbId={550} contentType="movie" />);
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  test('updates iframe URL when subtitle language changes', () => {
    render(<VidsrcStreamingPlayer tmdbId={550} contentType="movie" />);
    const selector = screen.getByRole('combobox');
    fireEvent.change(selector, { target: { value: 'es' } });
    const iframe = screen.getByTitle('Vidsrc Streaming Player');
    expect(iframe.src).toContain('ds_lang=es');
  });

  test('displays error message for invalid TMDB ID', () => {
    render(<VidsrcStreamingPlayer tmdbId={-1} contentType="movie" />);
    expect(screen.getByText(/Invalid movie ID/)).toBeInTheDocument();
  });

  test('maintains 16:9 aspect ratio', () => {
    const { container } = render(<VidsrcStreamingPlayer tmdbId={550} contentType="movie" />);
    const wrapper = container.querySelector('[style*="aspect"]');
    expect(wrapper).toHaveClass('aspect-video'); // or similar
  });

  test('applies mobile styles on small screens', () => {
    // Mock window.matchMedia for mobile
    window.matchMedia = jest.fn().mockImplementation(query => ({
      matches: query === '(max-width: 768px)',
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    }));

    const { container } = render(<VidsrcStreamingPlayer tmdbId={550} contentType="movie" />);
    expect(container.querySelector('[class*="mobile"]')).toBeInTheDocument();
  });
});
```

#### SubtitleLanguageSelector Tests

**Test Suite**: `SubtitleLanguageSelector.test.tsx`

```typescript
describe('SubtitleLanguageSelector', () => {
  test('renders all supported languages', () => {
    render(
      <SubtitleLanguageSelector 
        selectedLanguage="en" 
        onLanguageChange={jest.fn()} 
      />
    );
    expect(screen.getByText('English')).toBeInTheDocument();
    expect(screen.getByText('Spanish')).toBeInTheDocument();
    expect(screen.getByText('French')).toBeInTheDocument();
  });

  test('calls onLanguageChange when language is selected', () => {
    const onChange = jest.fn();
    render(
      <SubtitleLanguageSelector 
        selectedLanguage="en" 
        onLanguageChange={onChange} 
      />
    );
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'es' } });
    expect(onChange).toHaveBeenCalledWith('es');
  });

  test('highlights selected language', () => {
    render(
      <SubtitleLanguageSelector 
        selectedLanguage="es" 
        onLanguageChange={jest.fn()} 
      />
    );
    const selected = screen.getByRole('option', { selected: true });
    expect(selected).toHaveTextContent('Spanish');
  });

  test('disables selector when disabled prop is true', () => {
    render(
      <SubtitleLanguageSelector 
        selectedLanguage="en" 
        onLanguageChange={jest.fn()}
        disabled={true}
      />
    );
    expect(screen.getByRole('combobox')).toBeDisabled();
  });
});
```

#### StreamErrorBoundary Tests

**Test Suite**: `StreamErrorBoundary.test.tsx`

```typescript
describe('StreamErrorBoundary', () => {
  test('displays error message when child throws', () => {
    const ThrowError = () => {
      throw new Error('Test error');
    };
    render(
      <StreamErrorBoundary>
        <ThrowError />
      </StreamErrorBoundary>
    );
    expect(screen.getByText(/An unexpected error occurred/)).toBeInTheDocument();
  });

  test('displays Try Again button', () => {
    const ThrowError = () => {
      throw new Error('Test error');
    };
    render(
      <StreamErrorBoundary>
        <ThrowError />
      </StreamErrorBoundary>
    );
    expect(screen.getByRole('button', { name: /Try Again/ })).toBeInTheDocument();
  });

  test('logs error to monitoring service', () => {
    const logSpy = jest.spyOn(console, 'error').mockImplementation();
    const ThrowError = () => {
      throw new Error('Test error');
    };
    render(
      <StreamErrorBoundary>
        <ThrowError />
      </StreamErrorBoundary>
    );
    expect(logSpy).toHaveBeenCalled();
    logSpy.mockRestore();
  });
});
```

### Property-Based Testing

#### URL Round-Trip Property Test

**Test Suite**: `VidsrcEmbedURLGenerator.pbt.ts`

```typescript
import fc from 'fast-check';

describe('VidsrcEmbedURLGenerator - Property-Based Tests', () => {
  // Property 1: URL Round-Trip Preservation
  test(
    'URL round-trip preserves all parameters',
    () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 2147483647 }), // TMDB ID
          fc.oneof(
            fc.constant('movie'),
            fc.tuple(
              fc.constant('tv'),
              fc.integer({ min: 1, max: 100 }), // season
              fc.integer({ min: 1, max: 100 }) // episode
            )
          ),
          fc.oneof(
            fc.constant(undefined),
            fc.constantFrom('en', 'es', 'fr', 'de', 'pt', 'it', 'ru', 'ja', 'zh')
          ),
          fc.boolean(), // autoplay
          fc.boolean(), // autonext
          (tmdbId, contentTypeData, language, autoplay, autonext) => {
            const contentType = Array.isArray(contentTypeData) ? 'tv' : 'movie';
            const [, season, episode] = Array.isArray(contentTypeData) 
              ? contentTypeData 
              : [undefined, undefined, undefined];

            const config: EmbedURLConfig = {
              tmdbId,
              contentType,
              domain: 'vidsrc-embed.ru',
              season,
              episode,
              subtitleLanguage: language,
              autoplay,
              autonext,
            };

            const url = generator.generateEmbedURL(config);
            const parsed = generator.parseEmbedURL(url);

            // Verify all parameters are preserved
            expect(parsed.tmdbId).toBe(tmdbId);
            expect(parsed.contentType).toBe(contentType);
            if (contentType === 'tv') {
              expect(parsed.season).toBe(season);
              expect(parsed.episode).toBe(episode);
            }
            if (language) {
              expect(parsed.subtitleLanguage).toBe(language);
            }
            expect(parsed.autoplay).toBe(autoplay);
            if (contentType === 'tv') {
              expect(parsed.autonext).toBe(autonext);
            }
          }
        ),
        { numRuns: 100 }
      );
    },
    // Feature: vidsrc-streaming-integration, Property 15: URL Round-Trip Preservation
  );

  // Property 2: URL Round-Trip Idempotence
  test(
    'URL round-trip is idempotent',
    () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 2147483647 }),
          fc.constantFrom('movie', 'tv'),
          (tmdbId, contentType) => {
            const config: EmbedURLConfig = {
              tmdbId,
              contentType,
              domain: 'vidsrc-embed.ru',
            };

            const url1 = generator.generateEmbedURL(config);
            const parsed1 = generator.parseEmbedURL(url1);
            const url2 = generator.generateEmbedURL(parsed1);
            const parsed2 = generator.parseEmbedURL(url2);

            // Second round-trip should produce same result
            expect(parsed2).toEqual(parsed1);
          }
        ),
        { numRuns: 100 }
      );
    },
    // Feature: vidsrc-streaming-integration, Property 16: URL Round-Trip Idempotence
  );

  // Property 3: Exponential Backoff Bounds
  test(
    'exponential backoff respects maximum delay',
    () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 10 }),
          (attemptNumber) => {
            const delay = manager.calculateBackoffDelay(attemptNumber);
            expect(delay).toBeLessThanOrEqual(3000);
            expect(delay).toBeGreaterThanOrEqual(0);
          }
        ),
        { numRuns: 100 }
      );
    },
    // Feature: vidsrc-streaming-integration, Property 9: Exponential Backoff Calculation
  );

  // Property 4: TMDB ID Validation
  test(
    'TMDB ID validation accepts only positive integers',
    () => {
      fc.assert(
        fc.property(
          fc.integer(),
          (id) => {
            const isValid = generator.validateTmdbId(id);
            expect(isValid).toBe(id > 0);
          }
        ),
        { numRuns: 100 }
      );
    },
    // Feature: vidsrc-streaming-integration, Property 10: TMDB ID Validation
  );
});
```

### Integration Testing

#### End-to-End Streaming Flow

**Test Suite**: `streaming-integration.e2e.test.ts`

```typescript
describe('Vidsrc Streaming Integration - E2E', () => {
  test('complete streaming flow from movie details page', async () => {
    // 1. Navigate to movie details page
    await page.goto('/movies/550');
    
    // 2. Verify streaming player renders
    const iframe = await page.$('iframe[title="Vidsrc Streaming Player"]');
    expect(iframe).toBeTruthy();
    
    // 3. Select subtitle language
    const selector = await page.$('select[aria-label="Subtitle Language"]');
    await selector.select('es');
    
    // 4. Verify URL updated with language parameter
    const src = await iframe.getAttribute('src');
    expect(src).toContain('ds_lang=es');
    
    // 5. Verify preference persisted
    await page.reload();
    const savedLanguage = await page.evaluate(() => 
      sessionStorage.getItem('vidsrc_subtitle_lang_550')
    );
    expect(savedLanguage).toBe('es');
  });

  test('handles domain failure gracefully', async () => {
    // Mock first domain to fail
    await page.route('**/vidsrc-embed.ru/**', route => route.abort());
    
    // Navigate to movie details
    await page.goto('/movies/550');
    
    // Verify fallback domain is used
    const iframe = await page.$('iframe[title="Vidsrc Streaming Player"]');
    const src = await iframe.getAttribute('src');
    expect(src).toContain('vidsrc-embed.su');
  });

  test('displays error when all domains fail', async () => {
    // Mock all domains to fail
    await page.route('**/vidsrc-embed.ru/**', route => route.abort());
    await page.route('**/vidsrc-embed.su/**', route => route.abort());
    await page.route('**/vidsrcme.su/**', route => route.abort());
    await page.route('**/vsrc.su/**', route => route.abort());
    
    // Navigate to movie details
    await page.goto('/movies/550');
    
    // Verify error message displayed
    const errorMsg = await page.$('text=Stream not available');
    expect(errorMsg).toBeTruthy();
    
    // Verify Try Again button present
    const retryBtn = await page.$('button:has-text("Try Again")');
    expect(retryBtn).toBeTruthy();
  });
});
```

### Test Configuration

**Minimum Iterations**: 100 per property-based test
**Test Framework**: Jest for unit/component tests, fast-check for property-based tests
**Coverage Target**: 85% code coverage for streaming integration feature
**CI Integration**: Tests run on every commit, blocking merge if coverage drops


---

## Design Summary

This design document provides a comprehensive blueprint for integrating Vidsrc streaming into the movie discovery platform. The architecture emphasizes:

1. **Resilience through redundancy**: Multiple domain providers with automatic fallback ensure streaming availability even when individual domains fail.

2. **Security by design**: Iframe sandboxing, URL validation, and domain whitelisting protect against malicious content while maintaining functionality.

3. **User-centric experience**: Seamless integration with existing movie details page, subtitle language selection with persistence, and responsive design across all devices.

4. **Operational visibility**: Comprehensive logging and health monitoring enable proactive issue detection and resolution.

5. **Correctness verification**: 23 formally specified properties ensure the system behaves correctly across all valid inputs and scenarios.

### Key Implementation Priorities

1. **Phase 1**: Core URL generation and validation (Properties 1, 10, 13, 14)
2. **Phase 2**: Domain management and fallback logic (Properties 2, 8, 9, 18)
3. **Phase 3**: Component rendering and UI integration (Properties 3, 4, 5, 6, 21, 22)
4. **Phase 4**: Subtitle persistence and user preferences (Property 7)
5. **Phase 5**: Health checks and monitoring (Properties 17, 19, 20)
6. **Phase 6**: Error handling and recovery (Properties 11, 12, 23)

### Testing Coverage

- **Unit Tests**: 40+ tests covering URL generation, configuration management, and validation
- **Component Tests**: 20+ tests covering React components and user interactions
- **Property-Based Tests**: 4 comprehensive properties with 100+ iterations each
- **Integration Tests**: End-to-end flows covering complete streaming scenarios
- **Target Coverage**: 85% code coverage for streaming integration feature

### Next Steps

1. Review and approve this design document
2. Create implementation tasks based on the file structure and component specifications
3. Begin Phase 1 implementation with URL generation and validation
4. Implement property-based tests alongside feature development
5. Conduct security review of iframe sandbox configuration
6. Performance testing to ensure 2-second player load time requirement
