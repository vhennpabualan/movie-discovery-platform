# Implementation Plan: Vidsrc Streaming Integration

## Overview

This implementation plan breaks down the Vidsrc streaming integration feature into discrete, actionable tasks organized by phase. Each task builds incrementally on previous work, with property-based tests validating correctness at each step. The implementation follows the file structure defined in the design document and integrates seamlessly with the existing movie details page.

## Phase 1: Core Infrastructure and Types

- [x] 1.1 Create types and interfaces for Vidsrc streaming
  - Create `src/features/vidsrc-streaming/types/index.ts`
  - Define all TypeScript interfaces: `EmbedURLConfig`, `DomainProvider`, `DomainProviderStatus`, `StreamingPlayerProps`, `SubtitleLanguage`, `SubtitleLanguageOption`, `ParsedEmbedURL`, `StreamingError`, `StreamingErrorType`
  - Export all types for use across the feature
  - _Requirements: 1.1, 3.2, 4.1, 6.1, 10.1, 11.1_

- [x] 1.2 Create configuration constants and domain settings
  - Create `src/features/vidsrc-streaming/config/domains.ts`
  - Define `DOMAIN_PROVIDERS` array with priority order: vidsrc-embed.ru, vidsrc-embed.su, vidsrcme.su, vsrc.su
  - Define `DOMAIN_CONFIG` with health check interval (5 minutes), failure threshold (3), timeout (5 seconds)
  - Export domain configuration for use in services
  - _Requirements: 2.1, 2.2, 8.2, 14.1_

- [x] 1.3 Create subtitle language configuration
  - Create `src/features/vidsrc-streaming/config/languages.ts`
  - Define `SUBTITLE_LANGUAGES` array with all supported languages: en, es, fr, de, pt, it, ru, ja, zh
  - Define `SUBTITLE_LANGUAGE_OPTIONS` with labels and native labels for each language
  - Export language configuration for UI components
  - _Requirements: 3.1, 3.2_

- [x] 1.4 Create constants and environment configuration
  - Create `src/features/vidsrc-streaming/config/constants.ts`
  - Define timeout constants (5000ms), retry settings, backoff parameters (base 100ms, max 3000ms)
  - Define environment variable names and defaults
  - Export all constants for use across feature
  - _Requirements: 4.1, 5.2, 8.4_

## Phase 2: URL Generation and Validation Services

- [x] 2.1 Implement VidsrcEmbedURLGenerator service
  - Create `src/features/vidsrc-streaming/services/VidsrcEmbedURLGenerator.ts`
  - Implement `generateMovieURL(config: EmbedURLConfig): string` method
    - Build base URL: `https://{domain}/embed/movie?tmdb={tmdb_id}`
    - Add optional parameters: ds_lang, autoplay, sub_url
    - Properly encode all parameters
  - Implement `generateTVURL(config: EmbedURLConfig): string` method
    - Build base URL: `https://{domain}/embed/tv?tmdb={tmdb_id}&season={season}&episode={episode}`
    - Add optional parameters: ds_lang, autoplay, autonext, sub_url
  - _Requirements: 1.1, 4.1, 4.2, 4.3, 10.1, 10.3_

- [x] 2.2 Implement URL validation methods in VidsrcEmbedURLGenerator
  - Implement `validateTmdbId(id: number): boolean` method
    - Check if ID is positive integer
    - Check if ID is within valid range (1 to 2147483647)
    - Throw error with details if invalid
  - Implement `validateDomain(domain: string): boolean` method
    - Check if domain is in configured whitelist
    - Perform case-insensitive comparison
    - Return boolean result
  - _Requirements: 6.4, 11.1, 11.3_

- [x] 2.3 Implement URL parsing method in VidsrcEmbedURLGenerator
  - Implement `parseEmbedURL(url: string): ParsedEmbedURL` method
    - Extract domain from URL using regex
    - Validate domain is whitelisted
    - Parse query parameters: tmdb, season, episode, ds_lang, autoplay, sub_url, autonext
    - Validate TMDB ID is positive integer
    - Return `ParsedEmbedURL` object with all extracted parameters
    - Throw error if URL is invalid
  - _Requirements: 13.1, 13.2, 13.3, 13.4_

- [x] 2.4 Write unit tests for VidsrcEmbedURLGenerator
  - Create `src/features/vidsrc-streaming/services/VidsrcEmbedURLGenerator.test.ts`
  - Test valid movie URL generation with TMDB ID
  - Test valid TV URL generation with season and episode
  - Test parameter encoding for special characters
  - Test TMDB ID validation (negative, zero, positive)
  - Test domain validation (whitelisted vs non-whitelisted)
  - Test URL parsing extracts all parameters correctly
  - _Requirements: 1.1, 11.1, 13.1_

- [ ]* 2.5 Write property test for URL round-trip preservation
  - Create property test in `src/features/vidsrc-streaming/services/VidsrcEmbedURLGenerator.test.ts`
  - **Property 15: URL Round-Trip Preservation**
  - **Validates: Requirements 13.1, 13.2, 13.3, 13.4**
  - Generate random valid TMDB IDs (1 to 2147483647)
  - Generate random subtitle languages from supported set
  - Generate random boolean flags (autoplay, autonext)
  - Generate random season/episode combinations for TV
  - For each combination: generate URL, parse it, verify all parameters match original
  - Run minimum 100 iterations
  - _Requirements: 13.1, 13.2, 13.3, 13.4_

- [ ]* 2.6 Write property test for URL round-trip idempotence
  - Add property test in `src/features/vidsrc-streaming/services/VidsrcEmbedURLGenerator.test.ts`
  - **Property 16: URL Round-Trip Idempotence**
  - **Validates: Requirements 13.4**
  - Generate random valid configurations
  - For each: generate URL → parse → generate again → parse again
  - Verify second parse result equals first parse result
  - Run minimum 100 iterations
  - _Requirements: 13.4_

## Phase 3: Configuration Management and Domain Handling

- [x] 3.1 Implement VidsrcConfigurationManager service
  - Create `src/features/vidsrc-streaming/services/VidsrcConfigurationManager.ts`
  - Initialize with domain provider list and health status tracking
  - Implement `getNextDomain(): DomainProvider | null` method
    - Return first healthy domain from priority list
    - Filter out unhealthy domains
    - Sort by failure count and last failure time
    - Return null if all domains exhausted
  - Implement `markDomainFailed(domain: DomainProvider): void` method
    - Increment failure counter for domain
    - Record failure timestamp
    - Mark as unhealthy if failure count exceeds threshold (3)
    - Log failure event
  - _Requirements: 2.1, 2.2, 5.2, 8.1_

- [x] 3.2 Implement domain recovery and reset in VidsrcConfigurationManager
  - Implement `resetDomains(): void` method
    - Reset all domains to healthy state
    - Clear failure counters
    - Reset domain priority to configured order
    - Log reset event
  - Implement `getActiveDomain(): DomainProvider | null` method
    - Return currently active domain
    - Return null if no healthy domains available
  - _Requirements: 5.4, 8.1_

- [x] 3.3 Implement exponential backoff calculation in VidsrcConfigurationManager
  - Implement `calculateBackoffDelay(attemptNumber: number): number` method
    - Calculate delay: `baseDelay * (2 ^ attemptNumber)`
    - Add random jitter: `random(0, delay * 0.1)`
    - Cap at maximum delay (3000ms)
    - Return calculated delay in milliseconds
  - _Requirements: 8.4_

- [x] 3.4 Implement health check mechanism in VidsrcConfigurationManager
  - Implement `performHealthCheck(): Promise<void>` method
    - For each domain provider:
      - Create test embed URL with dummy TMDB ID
      - Attempt HEAD request with 5 second timeout
      - If successful (200-299): mark healthy, reset failure count
      - If timeout or error: increment failure count, mark unhealthy if threshold exceeded
      - Log health check result
    - Schedule next health check in 5 minutes
  - _Requirements: 14.1, 14.2, 14.3_

- [x] 3.5 Write unit tests for VidsrcConfigurationManager
  - Create `src/features/vidsrc-streaming/services/VidsrcConfigurationManager.test.ts`
  - Test domain selection returns first domain when all healthy
  - Test domain failure marking and next domain selection
  - Test exponential backoff calculation respects bounds
  - Test health check marks domains as unhealthy
  - Test reset functionality restores domain list
  - Test retry resets domain priority
  - _Requirements: 2.1, 2.2, 5.4, 8.4_

- [ ]* 3.6 Write property test for exponential backoff bounds
  - Add property test in `src/features/vidsrc-streaming/services/VidsrcConfigurationManager.test.ts`
  - **Property 9: Exponential Backoff Calculation**
  - **Validates: Requirements 8.4**
  - Generate random attempt numbers (0 to 10)
  - For each: calculate backoff delay
  - Verify delay is between 0 and 3000ms
  - Verify delay increases with attempt number
  - Run minimum 100 iterations
  - _Requirements: 8.4_

- [ ]* 3.7 Write property test for TMDB ID validation
  - Add property test in `src/features/vidsrc-streaming/services/VidsrcEmbedURLGenerator.test.ts`
  - **Property 10: TMDB ID Validation**
  - **Validates: Requirements 11.1, 11.3**
  - Generate random integers (positive, negative, zero)
  - For each: validate TMDB ID
  - Verify validation accepts only positive integers
  - Run minimum 100 iterations
  - _Requirements: 11.1, 11.3_

## Phase 4: Utility Functions and Helpers

- [x] 4.1 Create URL validation utility functions
  - Create `src/features/vidsrc-streaming/utils/url-validation.ts`
  - Implement `isValidEmbedURL(url: string): boolean` function
    - Check URL scheme is HTTPS
    - Validate domain is whitelisted
    - Check URL format matches expected pattern
    - Return boolean result
  - Implement `sanitizeEmbedURL(url: string): string` function
    - Remove any suspicious patterns (javascript:, data:, etc.)
    - Validate and return clean URL
  - _Requirements: 6.4, 13.1_

- [x] 4.2 Create error message utility functions
  - Create `src/features/vidsrc-streaming/utils/error-messages.ts`
  - Define error message constants for all error types:
    - Invalid TMDB ID: "Invalid movie ID - streaming unavailable"
    - All domains failed: "Stream not available - please try again later"
    - Network timeout: "Connection timeout - please check your internet connection"
    - Iframe load failed: "Unable to load streaming player"
    - Unknown error: "An unexpected error occurred"
  - Implement `getErrorMessage(errorType: StreamingErrorType): string` function
  - _Requirements: 5.1, 5.3, 8.3, 11.2_

- [x] 4.3 Create logging utility functions
  - Create `src/features/vidsrc-streaming/utils/logging.ts`
  - Implement `logURLGeneration(tmdbId: number, domain: DomainProvider, params: object): void` function
    - Log timestamp, TMDB ID, domain, and parameters
    - Send to monitoring service
  - Implement `logDomainFailure(domain: DomainProvider, reason: string, attemptNumber: number): void` function
    - Log timestamp, domain, failure reason, attempt number
    - Send to monitoring service
  - Implement `logSubtitleSelection(tmdbId: number, language: SubtitleLanguage): void` function
    - Log timestamp, TMDB ID, selected language
    - Send to monitoring service
  - _Requirements: 9.1, 9.2, 9.3, 9.4_

## Phase 5: React Hooks for State Management

- [x] 5.1 Implement useVidsrcPlayer hook
  - Create `src/features/vidsrc-streaming/hooks/useVidsrcPlayer.ts`
  - Manage player state: loading, error, embedURL, currentDomain
  - Implement URL generation on mount with TMDB ID
  - Implement error handling with domain fallback logic
  - Implement retry mechanism that resets domain list
  - Return state and retry function
  - _Requirements: 1.1, 2.2, 5.2, 5.4_

- [x] 5.2 Implement useSubtitlePreference hook
  - Create `src/features/vidsrc-streaming/hooks/useSubtitlePreference.ts`
  - Manage subtitle language preference state
  - On mount: retrieve saved preference from session storage or default to 'en'
  - Implement `setLanguage(language: SubtitleLanguage)` function
    - Update state
    - Save to session storage with key: `vidsrc_subtitle_lang_{tmdbId}`
    - Log selection event
  - Return current language and setter function
  - _Requirements: 3.3, 3.4_

- [x] 5.3 Implement useHealthCheck hook
  - Create `src/features/vidsrc-streaming/hooks/useHealthCheck.ts`
  - Schedule periodic health checks every 5 minutes
  - On mount: start health check interval
  - On unmount: clear interval
  - Trigger configuration manager health check
  - Return health status
  - _Requirements: 14.1, 14.2, 14.3_

- [x] 5.4 Write unit tests for custom hooks
  - Create `src/features/vidsrc-streaming/hooks/useVidsrcPlayer.test.ts`
  - Create `src/features/vidsrc-streaming/hooks/useSubtitlePreference.test.ts`
  - Create `src/features/vidsrc-streaming/hooks/useHealthCheck.test.ts`
  - Test hook initialization and state management
  - Test session storage persistence for subtitle preference
  - Test health check scheduling
  - _Requirements: 3.4, 14.1_

## Phase 6: React Components - Core Player

- [x] 6.1 Implement VidsrcStreamingPlayer component
  - Create `src/features/vidsrc-streaming/components/VidsrcStreamingPlayer.tsx`
  - Accept props: tmdbId, contentType, season?, episode?, autoplay?, customSubtitleUrl?, onError?, onSuccess?
  - Use `useVidsrcPlayer` hook for URL generation and error handling
  - Use `useSubtitlePreference` hook for subtitle language management
  - Render subtitle language selector
  - Render iframe with:
    - Generated embed URL
    - Sandbox attributes: allow-scripts, allow-same-origin, allow-popups, allow-presentation
    - referrerPolicy: no-referrer
    - Title: "Vidsrc Streaming Player"
    - 16:9 aspect ratio container
  - Handle loading state with skeleton
  - Handle error state with error boundary
  - _Requirements: 1.1, 3.1, 3.2, 4.1, 6.1, 6.2, 6.3, 6.4, 7.1, 7.2, 7.3_

- [x] 6.2 Implement responsive layout for VidsrcStreamingPlayer
  - Add responsive container with 16:9 aspect ratio
  - Mobile (< 768px): full width with padding
  - Tablet (768px - 1024px): 80% width
  - Desktop (> 1024px): full width
  - Use Tailwind CSS for responsive styling
  - Ensure iframe scales properly on all screen sizes
  - _Requirements: 7.2, 7.3_

- [x] 6.3 Implement accessibility features in VidsrcStreamingPlayer
  - Add ARIA labels to iframe: aria-label="Vidsrc Streaming Player"
  - Add ARIA labels to subtitle selector
  - Ensure keyboard navigation works
  - Add focus indicators
  - Ensure color contrast meets WCAG standards
  - _Requirements: 7.1_

- [x] 6.4 Write component tests for VidsrcStreamingPlayer
  - Create `src/features/vidsrc-streaming/components/VidsrcStreamingPlayer.test.tsx`
  - Test component renders with valid TMDB ID
  - Test subtitle selector appears and functions
  - Test iframe renders with correct URL
  - Test error state displays on failure
  - Test responsive layout on different screen sizes
  - Test accessibility attributes present
  - _Requirements: 1.1, 3.1, 6.1, 7.2, 7.3_

## Phase 7: React Components - Subtitle Selector

- [x] 7.1 Implement SubtitleLanguageSelector component
  - Create `src/features/vidsrc-streaming/components/SubtitleLanguageSelector.tsx`
  - Accept props: selectedLanguage, onLanguageChange, disabled?
  - Render dropdown/select with all supported languages
  - Display language labels and native labels
  - Highlight currently selected language
  - Call onLanguageChange callback when selection changes
  - Support disabled state
  - _Requirements: 3.1, 3.2_

- [x] 7.2 Implement styling for SubtitleLanguageSelector
  - Use Tailwind CSS for styling
  - Match existing Netflix-style design
  - Ensure good contrast and readability
  - Add hover and focus states
  - Responsive sizing on mobile/tablet/desktop
  - _Requirements: 3.1_

- [x] 7.3 Write component tests for SubtitleLanguageSelector
  - Create `src/features/vidsrc-streaming/components/SubtitleLanguageSelector.test.tsx`
  - Test all language options render
  - Test language selection triggers callback
  - Test selected language is highlighted
  - Test disabled state
  - _Requirements: 3.1, 3.2_

## Phase 8: React Components - Error Handling

- [x] 8.1 Implement StreamErrorBoundary component
  - Create `src/features/vidsrc-streaming/components/StreamErrorBoundary.tsx`
  - Implement error boundary lifecycle methods
  - Catch rendering errors from children
  - Display appropriate error message based on error type
  - Provide "Try Again" button for retry
  - Log errors to monitoring service
  - Prevent error from breaking page layout
  - _Requirements: 5.1, 5.3, 11.2_

- [x] 8.2 Implement error message display in StreamErrorBoundary
  - Map error types to user-friendly messages
  - Display error message with icon
  - Show "Try Again" button
  - Show "Report Issue" button (optional)
  - Display last known status if available
  - _Requirements: 5.1, 5.3, 12.1, 12.2_

- [x] 8.3 Write component tests for StreamErrorBoundary
  - Create `src/features/vidsrc-streaming/components/StreamErrorBoundary.test.tsx`
  - Test error boundary catches errors
  - Test appropriate error message displays
  - Test "Try Again" button triggers retry
  - Test error logging occurs
  - _Requirements: 5.1, 5.3_

## Phase 9: Integration with Movie Details Page

- [x] 9.1 Integrate VidsrcStreamingPlayer into movie details page
  - Modify `src/app/movies/[id]/page.tsx`
  - Import VidsrcStreamingPlayer component
  - Add streaming player section below Related Movies section
  - Pass TMDB ID and content type to player
  - Wrap in error boundary for safety
  - Add section heading: "Watch Now"
  - _Requirements: 7.1, 7.2, 7.3_

- [x] 9.2 Test integration with movie details page
  - Verify player renders on movie details page
  - Verify player doesn't interfere with other elements
  - Test responsive behavior on mobile/tablet/desktop
  - Test error handling doesn't break page layout
  - Verify player loads within 2 seconds
  - _Requirements: 7.1, 7.2, 7.3_

## Phase 10: Checkpoint - Core Functionality

- [x] 10.1 Ensure all tests pass for Phases 1-9
  - Run all unit tests for services and utilities
  - Run all component tests
  - Run all property-based tests
  - Verify code coverage is at least 80%
  - Fix any failing tests
  - Ensure all tests pass, ask the user if questions arise.


## Phase 11: Advanced Features - TV Show Support

- [x] 11.1 Implement TV show support in VidsrcStreamingPlayer
  - Update component to handle TV content type
  - Accept season and episode props
  - Display current season/episode above player
  - Update URL generation for TV format
  - Handle autonext parameter for TV
  - _Requirements: 10.1, 10.2, 10.3_

- [x] 11.2 Write tests for TV show support
  - Test TV URL generation with season/episode
  - Test season/episode display
  - Test autonext parameter in URL
  - _Requirements: 10.1, 10.3_

- [ ]* 11.3 Write property test for TV URL format
  - Add property test for TV URL generation
  - **Property 11: TV Episode URL Format**
  - **Validates: Requirements 10.1**
  - Generate random TMDB IDs, seasons, episodes
  - Verify generated URLs match expected format
  - Run minimum 100 iterations
  - _Requirements: 10.1_

## Phase 12: Advanced Features - Custom Subtitles

- [x] 12.1 Implement custom subtitle URL support
  - Update VidsrcStreamingPlayer to accept customSubtitleUrl prop
  - Pass custom subtitle URL to URL generator
  - Ensure URL is properly encoded in embed URL
  - _Requirements: 4.3_

- [x] 12.2 Write tests for custom subtitle support
  - Test custom subtitle URL is included in embed URL
  - Test URL encoding for special characters
  - _Requirements: 4.3_

- [ ]* 12.3 Write property test for custom subtitle URL encoding
  - Add property test for subtitle URL encoding
  - **Property 6: Custom Subtitle URL Encoding**
  - **Validates: Requirements 4.3**
  - Generate random URLs with special characters
  - Verify URLs are properly encoded in embed URL
  - Run minimum 100 iterations
  - _Requirements: 4.3_

## Phase 13: Security and Validation

- [x] 13.1 Implement comprehensive URL validation
  - Validate all generated URLs before rendering
  - Check HTTPS scheme
  - Validate domain against whitelist
  - Check for suspicious patterns
  - Log validation failures
  - _Requirements: 6.4, 13.1_

- [x] 13.2 Implement iframe sandbox security
  - Verify iframe has correct sandbox attributes
  - Verify referrerPolicy is set to no-referrer
  - Verify iframe cannot access parent window
  - Test security configuration
  - _Requirements: 6.1, 6.2, 6.3_

- [x] 13.3 Write security tests
  - Test URL validation rejects invalid domains
  - Test iframe sandbox attributes are correct
  - Test referrer policy is enforced
  - _Requirements: 6.1, 6.2, 6.3, 6.4_

- [ ]* 13.4 Write property test for iframe sandbox attributes
  - Add property test for security configuration
  - **Property 3: Iframe Sandbox Attributes**
  - **Validates: Requirements 6.1, 6.2**
  - Verify iframe has exactly required sandbox attributes
  - Verify allow-top-navigation is NOT present
  - Run minimum 100 iterations
  - _Requirements: 6.1, 6.2_

## Phase 14: Monitoring and Logging

- [x] 14.1 Implement comprehensive event logging
  - Log URL generation events with all parameters
  - Log domain selection and failures
  - Log subtitle language selections
  - Log health check results
  - Send all events to monitoring service
  - _Requirements: 9.1, 9.2, 9.3, 9.4_

- [x] 14.2 Implement error logging and monitoring
  - Log all streaming errors with details
  - Log retry attempts and backoff delays
  - Log domain recovery events
  - Send errors to monitoring service
  - _Requirements: 9.1, 9.2_

- [x] 14.3 Write tests for logging functionality
  - Test logging events are created correctly
  - Test events are sent to monitoring service
  - Test error logging includes all details
  - _Requirements: 9.1, 9.2, 9.3, 9.4_

- [ ]* 14.4 Write property test for logging completeness
  - Add property test for logging
  - **Property 19: Logging Completeness for URL Generation**
  - **Validates: Requirements 9.1**
  - Generate random configurations
  - Verify log events contain all required fields
  - Run minimum 100 iterations
  - _Requirements: 9.1_

- [ ]* 14.5 Write property test for domain failure logging
  - Add property test for domain failure logging
  - **Property 20: Logging Completeness for Domain Failures**
  - **Validates: Requirements 9.2**
  - Simulate domain failures
  - Verify log events contain all required fields
  - Run minimum 100 iterations
  - _Requirements: 9.2_

## Phase 15: Health Checks and Monitoring

- [x] 15.1 Implement periodic health checks
  - Set up health check scheduling in configuration manager
  - Perform health checks every 5 minutes
  - Update domain status based on health check results
  - Log health check results
  - _Requirements: 14.1, 14.2, 14.3_

- [x] 15.2 Implement domain recovery mechanism
  - Mark domains as healthy when health check succeeds
  - Re-add recovered domains to active provider list
  - Log domain recovery events
  - _Requirements: 14.3_

- [x] 15.3 Write tests for health check functionality
  - Test health checks run on schedule
  - Test domain status updates correctly
  - Test domain recovery works
  - _Requirements: 14.1, 14.2, 14.3_

- [ ]* 15.4 Write property test for health check interval
  - Add property test for health check scheduling
  - **Property 17: Health Check Interval Consistency**
  - **Validates: Requirements 14.1**
  - Verify health checks are scheduled exactly 5 minutes apart
  - Run minimum 100 iterations
  - _Requirements: 14.1_

- [ ]* 15.5 Write property test for domain recovery
  - Add property test for domain recovery
  - **Property 18: Domain Recovery After Health Check**
  - **Validates: Requirements 14.3**
  - Simulate unhealthy domain becoming healthy
  - Verify domain is re-added to active list
  - Run minimum 100 iterations
  - _Requirements: 14.3_

## Phase 16: Responsive Design and Mobile Optimization

- [x] 16.1 Optimize mobile layout
  - Ensure player is full width on mobile with padding
  - Test on various mobile screen sizes
  - Verify touch interactions work
  - Optimize subtitle selector for mobile
  - _Requirements: 7.3_

- [x] 16.2 Optimize tablet layout
  - Ensure player is 80% width on tablet
  - Test on various tablet screen sizes
  - Verify layout is balanced
  - _Requirements: 7.2_

- [x] 16.3 Optimize desktop layout
  - Ensure player is full width on desktop
  - Verify layout looks good on large screens
  - Test on various desktop resolutions
  - _Requirements: 7.2_

- [x] 16.4 Write responsive design tests
  - Test layout on mobile, tablet, desktop
  - Test aspect ratio is maintained
  - Test responsive breakpoints work correctly
  - _Requirements: 7.2, 7.3_

- [ ]* 16.5 Write property test for responsive aspect ratio
  - Add property test for responsive design
  - **Property 21: Responsive Layout Aspect Ratio**
  - **Validates: Requirements 7.2**
  - Test aspect ratio on various viewport sizes
  - Verify 16:9 ratio is maintained
  - Run minimum 100 iterations
  - _Requirements: 7.2_

- [ ]* 16.6 Write property test for mobile scaling
  - Add property test for mobile scaling
  - **Property 22: Mobile Responsive Scaling**
  - **Validates: Requirements 7.3**
  - Test scaling on viewports < 768px
  - Verify player fits with appropriate padding
  - Run minimum 100 iterations
  - _Requirements: 7.3_

## Phase 17: Checkpoint - Advanced Features

- [x] 17.1 Ensure all tests pass for Phases 11-16
  - Run all unit tests
  - Run all component tests
  - Run all property-based tests
  - Verify code coverage is at least 85%
  - Fix any failing tests
  - Ensure all tests pass, ask the user if questions arise.

## Phase 18: Documentation and README

- [x] 18.1 Create feature README
  - Create `src/features/vidsrc-streaming/README.md`
  - Document feature overview and purpose
  - Document component API and props
  - Document service interfaces and methods
  - Document configuration options
  - Document environment variables
  - _Requirements: All_

- [x] 18.2 Add inline code documentation
  - Add JSDoc comments to all exported functions and classes
  - Add parameter descriptions
  - Add return type descriptions
  - Add usage examples
  - _Requirements: All_

- [x] 18.3 Document error handling
  - Document all error types and messages
  - Document error recovery strategies
  - Document logging and monitoring
  - _Requirements: 5.1, 5.3, 9.1, 9.2_

## Phase 19: Final Integration and Testing

- [x] 19.1 Perform end-to-end testing
  - Test complete streaming flow from movie details page
  - Test subtitle language selection and persistence
  - Test domain fallback on failure
  - Test error handling and recovery
  - Test on multiple browsers and devices
  - _Requirements: All_

- [x] 19.2 Perform security testing
  - Test iframe sandbox configuration
  - Test URL validation and sanitization
  - Test referrer policy enforcement
  - Test against common security vulnerabilities
  - _Requirements: 6.1, 6.2, 6.3, 6.4_

- [x] 19.3 Perform performance testing
  - Verify player loads within 2 seconds
  - Test on slow network connections
  - Test memory usage and cleanup
  - Verify no memory leaks
  - _Requirements: 1.4_

- [x] 19.4 Final checkpoint - All tests pass
  - Run complete test suite
  - Verify code coverage is at least 85%
  - Verify all requirements are met
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional property-based tests and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Property-based tests validate universal correctness properties
- Unit tests validate specific examples and edge cases
- Component tests validate UI behavior and accessibility
- Integration tests validate end-to-end flows
- All code should follow existing project conventions and style
- All components should be responsive and accessible
- All services should include comprehensive error handling
- All events should be logged for monitoring and debugging
