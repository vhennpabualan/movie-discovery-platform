/**
 * Vidsrc Streaming Integration - Type Definitions
 *
 * This module exports all TypeScript interfaces and types used throughout
 * the Vidsrc streaming feature, including configuration, player props,
 * error handling, and data models.
 */

/**
 * Supported domain providers for Vidsrc embed URLs.
 * Listed in priority order for fallback logic.
 */
export type DomainProvider =
  | 'vidsrc-embed.ru'
  | 'vidsrc-embed.su'
  | 'vidsrcme.su'
  | 'vsrc.su'
  | 'vidsrc.me'
  | 'embed.su';

/**
 * Health status information for a domain provider.
 * Tracks availability, failure history, and last check time.
 */
export interface DomainProviderStatus {
  /** The domain provider being tracked */
  domain: DomainProvider;
  /** Whether the domain is currently healthy and available */
  isHealthy: boolean;
  /** Timestamp of the last health check (milliseconds since epoch) */
  lastHealthCheckTime: number;
  /** Number of consecutive failures for this domain */
  failureCount: number;
  /** Timestamp of the last failure, if any (milliseconds since epoch) */
  lastFailureTime?: number;
}

/**
 * Supported subtitle languages for streaming content.
 * Language codes follow ISO 639-1 standard.
 */
export type SubtitleLanguage =
  | 'en' // English
  | 'es' // Spanish
  | 'fr' // French
  | 'de' // German
  | 'pt' // Portuguese
  | 'it' // Italian
  | 'ru' // Russian
  | 'ja' // Japanese
  | 'zh'; // Chinese

/**
 * Display information for a subtitle language option.
 * Includes both English and native language labels.
 */
export interface SubtitleLanguageOption {
  /** ISO 639-1 language code */
  code: SubtitleLanguage;
  /** English label for the language (e.g., "English", "Spanish") */
  label: string;
  /** Native language label (e.g., "Español", "Français") */
  nativeLabel: string;
}

/**
 * Configuration for generating an embed URL.
 * Contains all parameters needed to construct a valid Vidsrc embed URL.
 */
export interface EmbedURLConfig {
  /** TMDB ID for the movie or TV show (must be positive integer) */
  tmdbId: number;
  /** Content type: 'movie' or 'tv' */
  contentType: 'movie' | 'tv';
  /** Domain provider to use for the embed URL */
  domain: DomainProvider;
  /** Season number (required for TV content) */
  season?: number;
  /** Episode number (required for TV content) */
  episode?: number;
  /** Subtitle language code (optional, defaults to Vidsrc default) */
  subtitleLanguage?: SubtitleLanguage;
  /** Whether to autoplay the video (optional, defaults to false) */
  autoplay?: boolean;
  /** Custom subtitle URL to use instead of default (optional) */
  customSubtitleUrl?: string;
  /** Whether to automatically play next episode (TV only, optional) */
  autonext?: boolean;
}

/**
 * Parsed embed URL with extracted parameters.
 * Result of parsing a generated embed URL back into its components.
 */
export interface ParsedEmbedURL {
  /** The domain provider extracted from the URL */
  domain: DomainProvider;
  /** Content type extracted from the URL */
  contentType: 'movie' | 'tv';
  /** TMDB ID extracted from the URL */
  tmdbId: number;
  /** Season number if present in URL */
  season?: number;
  /** Episode number if present in URL */
  episode?: number;
  /** Subtitle language if present in URL */
  subtitleLanguage?: SubtitleLanguage;
  /** Autoplay flag if present in URL */
  autoplay?: boolean;
  /** Custom subtitle URL if present in URL */
  customSubtitleUrl?: string;
  /** Autonext flag if present in URL */
  autonext?: boolean;
}

/**
 * Error types that can occur during streaming operations.
 * Used to categorize errors for appropriate user messaging and logging.
 */
export type StreamingErrorType =
  | 'INVALID_TMDB_ID' // TMDB ID failed validation
  | 'ALL_DOMAINS_FAILED' // All domain providers exhausted
  | 'NETWORK_TIMEOUT' // Request timeout waiting for response
  | 'INVALID_URL' // Generated URL failed validation
  | 'IFRAME_LOAD_FAILED' // Iframe failed to load content
  | 'UNKNOWN'; // Unknown or unexpected error

/**
 * Streaming error information.
 * Contains details about errors that occur during streaming operations.
 */
export interface StreamingError {
  /** Type of error that occurred */
  type: StreamingErrorType;
  /** Human-readable error message */
  message: string;
  /** Timestamp when error occurred (milliseconds since epoch) */
  timestamp: number;
  /** TMDB ID associated with the error, if applicable */
  tmdbId?: number;
  /** List of domains that failed, if applicable */
  failedDomains?: DomainProvider[];
}

/**
 * Props for the VidsrcStreamingPlayer component.
 * Defines the interface for the main streaming player component.
 */
export interface StreamingPlayerProps {
  /** TMDB ID for the movie or TV show to stream */
  tmdbId: number;
  /** Content type: 'movie' or 'tv' */
  contentType: 'movie' | 'tv';
  /** Season number (required for TV content) */
  season?: number;
  /** Episode number (required for TV content) */
  episode?: number;
  /** Whether to autoplay the video (optional, defaults to false) */
  autoplay?: boolean;
  /** Custom subtitle URL to use (optional) */
  customSubtitleUrl?: string;
  /** Callback fired when an error occurs */
  onError?: (error: StreamingError) => void;
  /** Callback fired when streaming loads successfully */
  onSuccess?: () => void;
}
