# Vidsrc Streaming Integration Requirements

## Introduction

This document specifies the requirements for integrating the Vidsrc streaming API into the existing Next.js movie application. The integration enables users to stream movies directly from the movie details page using Vidsrc's embed URLs, complementing the existing TMDB data with streaming functionality. The system will support multiple domain options for embed URLs and provide optional features like subtitle selection, language preferences, and autoplay configuration.

## Glossary

- **Vidsrc_API**: The Vidsrc streaming service that provides embed URLs for movies and TV shows
- **Embed_URL**: A URL that can be embedded in an iframe to display streaming content
- **TMDB_ID**: The unique identifier for a movie or TV show in The Movie Database
- **Streaming_Player**: The iframe component that displays the embedded video stream
- **Subtitle_Language**: The language code for subtitle display (e.g., 'en', 'es', 'fr')
- **Domain_Provider**: One of the available Vidsrc domains (vidsrc-embed.ru, vidsrc-embed.su, vidsrcme.su, vsrc.su)
- **Fallback_Domain**: An alternative domain used when the primary domain is unavailable
- **Stream_Availability**: The state indicating whether a stream is available for a given movie
- **Embed_Component**: The React component responsible for rendering the streaming player
- **Configuration_Manager**: The system component that manages domain selection and player options

## Requirements

### Requirement 1: Generate Embed URLs for Movies

**User Story:** As a user, I want to stream movies from the movie details page, so that I can watch content without leaving the application.

#### Acceptance Criteria

1. WHEN a movie details page is loaded with a valid TMDB ID, THE Vidsrc_API SHALL generate an embed URL using the format `https://{domain}/embed/movie?tmdb={tmdb_id}`
2. WHEN the primary domain is unavailable, THE Configuration_Manager SHALL automatically select an alternative Domain_Provider from the configured fallback list
3. THE Embed_Component SHALL render the generated embed URL in an iframe with appropriate sandbox attributes for security
4. WHEN a user navigates to a movie details page, THE Streaming_Player SHALL be visible and ready for interaction within 2 seconds of page load

### Requirement 2: Support Multiple Domain Providers

**User Story:** As a system administrator, I want to configure multiple domain providers, so that streaming remains available if one domain becomes unavailable.

#### Acceptance Criteria

1. THE Configuration_Manager SHALL support the following Domain_Providers: vidsrc-embed.ru, vidsrc-embed.su, vidsrcme.su, vsrc.su
2. WHEN a Domain_Provider fails to load, THE Configuration_Manager SHALL attempt the next Domain_Provider in the configured priority order
3. THE Configuration_Manager SHALL log each Domain_Provider attempt with timestamp and result status
4. IF all configured Domain_Providers fail, THEN THE Streaming_Player SHALL display a user-friendly error message indicating stream unavailability

### Requirement 3: Implement Subtitle Language Selection

**User Story:** As a user, I want to select subtitle languages, so that I can watch content in my preferred language.

#### Acceptance Criteria

1. WHEN the Streaming_Player is rendered, THE Embed_Component SHALL provide a subtitle language selector with common language options (English, Spanish, French, German, Portuguese, Italian, Russian, Japanese, Chinese)
2. WHEN a user selects a subtitle language, THE Embed_Component SHALL append the `ds_lang` parameter to the embed URL with the selected language code
3. WHEN no subtitle language is selected, THE Streaming_Player SHALL use the default subtitle language from Vidsrc
4. THE selected subtitle language preference SHALL persist in the user's session for subsequent movie plays

### Requirement 4: Configure Optional Player Features

**User Story:** As a user, I want to configure player behavior, so that I can customize my viewing experience.

#### Acceptance Criteria

1. WHERE autoplay is enabled, THE Embed_Component SHALL append the `autoplay=1` parameter to the embed URL
2. WHERE autoplay is disabled, THE Embed_Component SHALL not include the autoplay parameter
3. WHERE custom subtitles are provided, THE Embed_Component SHALL append the `sub_url` parameter with the custom subtitle URL
4. THE Configuration_Manager SHALL allow toggling of autoplay and custom subtitle features through environment variables or configuration file

### Requirement 5: Handle Stream Availability Gracefully

**User Story:** As a user, I want clear feedback when a stream is unavailable, so that I understand why I cannot watch content.

#### Acceptance Criteria

1. WHEN a stream is unavailable for a movie, THE Streaming_Player SHALL display a message indicating "Stream not available"
2. WHEN a Domain_Provider fails to respond within 5 seconds, THE Configuration_Manager SHALL mark it as unavailable and attempt the next provider
3. IF all Domain_Providers fail after exhausting the retry list, THEN THE Streaming_Player SHALL display an error message with a "Try Again" button
4. WHEN a user clicks "Try Again", THE Configuration_Manager SHALL reset the domain priority list and retry from the first provider

### Requirement 6: Secure Iframe Embedding

**User Story:** As a developer, I want the streaming player to be secure, so that the application is protected from malicious content.

#### Acceptance Criteria

1. THE Embed_Component SHALL render the iframe with the following sandbox attributes: `allow-scripts`, `allow-same-origin`, `allow-popups`, `allow-presentation`
2. THE Embed_Component SHALL NOT allow the iframe to access the parent window's localStorage or sessionStorage
3. THE Embed_Component SHALL set the iframe's `referrerPolicy` to `no-referrer` to prevent referrer leakage
4. THE Embed_Component SHALL validate that the embed URL domain matches one of the configured Domain_Providers before rendering

### Requirement 7: Integrate with Existing Movie Details Page

**User Story:** As a user, I want streaming to be seamlessly integrated into the movie details page, so that I can watch without navigating away.

#### Acceptance Criteria

1. WHEN the movie details page loads, THE Streaming_Player SHALL be positioned below the movie overview section
2. THE Streaming_Player SHALL maintain a 16:9 aspect ratio and be responsive on mobile, tablet, and desktop viewports
3. WHEN the viewport width is less than 768px, THE Streaming_Player SHALL scale to fit the mobile screen with appropriate padding
4. THE Streaming_Player SHALL not interfere with existing page elements (title, genres, rating, watchlist button)

### Requirement 8: Handle Network Errors and Timeouts

**User Story:** As a user, I want the application to handle network issues gracefully, so that I receive helpful feedback.

#### Acceptance Criteria

1. WHEN a network timeout occurs while loading the embed URL, THE Configuration_Manager SHALL retry with the next Domain_Provider
2. WHEN all Domain_Providers timeout, THE Streaming_Player SHALL display a message indicating "Connection timeout - please check your internet connection"
3. WHEN a user's internet connection is restored, THE Streaming_Player SHALL provide a "Retry" option to attempt loading again
4. THE Configuration_Manager SHALL implement exponential backoff with a maximum delay of 3 seconds between retry attempts

### Requirement 9: Log Streaming Events for Monitoring

**User Story:** As a developer, I want to monitor streaming integration performance, so that I can identify and resolve issues.

#### Acceptance Criteria

1. WHEN an embed URL is generated, THE Configuration_Manager SHALL log the event with: timestamp, TMDB ID, selected Domain_Provider, and parameters used
2. WHEN a Domain_Provider fails, THE Configuration_Manager SHALL log: timestamp, Domain_Provider name, failure reason, and retry attempt number
3. WHEN a user selects a subtitle language, THE Configuration_Manager SHALL log: timestamp, TMDB ID, and selected language code
4. ALL logged events SHALL be sent to the application's monitoring service for analysis and alerting

### Requirement 10: Support TV Show Episodes

**User Story:** As a user, I want to stream TV show episodes, so that I can watch series content.

#### Acceptance Criteria

1. WHEN a TV show episode is accessed, THE Vidsrc_API SHALL generate an embed URL using the format `https://{domain}/embed/tv?tmdb={tmdb_id}&season={season}&episode={episode}`
2. WHEN a user navigates to a different episode, THE Streaming_Player SHALL update the embed URL with the new season and episode parameters
3. WHERE autonext is enabled, THE Embed_Component SHALL append the `autonext=1` parameter to automatically play the next episode
4. THE Streaming_Player SHALL display the current season and episode number above the player

### Requirement 11: Validate TMDB IDs Before Generating URLs

**User Story:** As a developer, I want invalid TMDB IDs to be caught early, so that the system doesn't attempt to generate invalid embed URLs.

#### Acceptance Criteria

1. WHEN a movie details page is loaded, THE Vidsrc_API SHALL validate that the TMDB ID is a positive integer
2. IF the TMDB ID is invalid or missing, THEN THE Streaming_Player SHALL display an error message: "Invalid movie ID - streaming unavailable"
3. THE Vidsrc_API SHALL not attempt to generate an embed URL if the TMDB ID fails validation
4. WHEN an invalid TMDB ID is detected, THE Configuration_Manager SHALL log the validation failure with the invalid ID value

### Requirement 12: Provide Fallback UI When Streaming is Unavailable

**User Story:** As a user, I want alternative options when streaming is unavailable, so that I'm not left without information.

#### Acceptance Criteria

1. WHEN streaming is unavailable, THE Streaming_Player SHALL display a message with information about why the stream is unavailable
2. THE Streaming_Player SHALL provide a link to external streaming services or purchase options if available
3. THE Streaming_Player SHALL include a "Report Issue" button that allows users to report streaming problems
4. THE Streaming_Player SHALL display the last known availability status and timestamp of the last successful stream attempt

### Requirement 13: Round-Trip Property for Embed URL Generation

**User Story:** As a developer, I want to verify that embed URLs are generated correctly, so that I can ensure data integrity.

#### Acceptance Criteria

1. FOR ALL valid TMDB IDs, parsing the embed URL parameters SHALL extract the same TMDB ID, season, and episode values that were used to generate the URL
2. WHEN an embed URL is generated with specific parameters (ds_lang, autoplay, sub_url), parsing the URL SHALL recover all provided parameters
3. THE Vidsrc_API SHALL implement a URL parser that can extract TMDB ID, season, episode, and optional parameters from any generated embed URL
4. FOR ALL generated embed URLs, the round-trip property (generate → parse → generate) SHALL produce an equivalent URL

### Requirement 14: Implement Domain Provider Health Checks

**User Story:** As a system administrator, I want to monitor domain provider health, so that I can proactively address availability issues.

#### Acceptance Criteria

1. THE Configuration_Manager SHALL perform periodic health checks on all configured Domain_Providers every 5 minutes
2. WHEN a health check fails, THE Configuration_Manager SHALL mark the Domain_Provider as unhealthy and remove it from the active provider list
3. WHEN a Domain_Provider recovers, THE Configuration_Manager SHALL re-add it to the active provider list
4. THE Configuration_Manager SHALL log all health check results with timestamp and provider status

