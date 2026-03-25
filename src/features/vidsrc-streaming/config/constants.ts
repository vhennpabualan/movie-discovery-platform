/**
 * Vidsrc Streaming Integration Constants
 *
 * This module defines all constants used throughout the Vidsrc streaming feature,
 * including timeouts, retry settings, backoff parameters, and environment variable names.
 */

/**
 * Timeout constants for various operations (in milliseconds).
 *
 * @constant
 * @type {Object}
 */
export const TIMEOUTS = {
  /**
   * Timeout for embed URL generation and iframe loading.
   * Default: 5 seconds (5,000 ms)
   */
  embedLoad: 5000,

  /**
   * Timeout for health check requests.
   * Default: 5 seconds (5,000 ms)
   */
  healthCheck: 5000,

  /**
   * Timeout for domain fallback attempts.
   * Default: 5 seconds (5,000 ms)
   */
  domainFallback: 5000,
} as const;

/**
 * Retry configuration for failed operations.
 *
 * @constant
 * @type {Object}
 */
export const RETRY_CONFIG = {
  /**
   * Maximum number of retry attempts before giving up.
   * Default: 3 attempts
   */
  maxAttempts: 3,

  /**
   * Whether to retry on timeout errors.
   * Default: true
   */
  retryOnTimeout: true,

  /**
   * Whether to retry on network errors.
   * Default: true
   */
  retryOnNetworkError: true,
} as const;

/**
 * Exponential backoff configuration for retry delays.
 *
 * @constant
 * @type {Object}
 */
export const BACKOFF_CONFIG = {
  /**
   * Base delay for exponential backoff in milliseconds.
   * Actual delay = baseDelay * (2 ^ attemptNumber)
   * Default: 100 ms
   */
  baseDelay: 100,

  /**
   * Maximum delay between retry attempts in milliseconds.
   * Default: 3 seconds (3,000 ms)
   */
  maxDelay: 3000,

  /**
   * Whether to add random jitter to backoff delays.
   * Helps prevent thundering herd problem.
   * Default: true
   */
  useJitter: true,

  /**
   * Maximum jitter as a percentage of the calculated delay.
   * Default: 0.1 (10%)
   */
  jitterFactor: 0.1,
} as const;

/**
 * Environment variable names and their default values.
 * These can be overridden via .env file or environment.
 *
 * @constant
 * @type {Object}
 */
export const ENV_VARS = {
  /**
   * Enable or disable Vidsrc streaming feature.
   * Default: 'true'
   */
  VIDSRC_ENABLED: {
    name: 'NEXT_PUBLIC_VIDSRC_ENABLED',
    default: 'true',
  },

  /**
   * Enable or disable autoplay by default.
   * Default: 'false'
   */
  VIDSRC_AUTOPLAY: {
    name: 'NEXT_PUBLIC_VIDSRC_AUTOPLAY',
    default: 'false',
  },

  /**
   * Default subtitle language code.
   * Default: 'en'
   */
  VIDSRC_DEFAULT_LANGUAGE: {
    name: 'NEXT_PUBLIC_VIDSRC_DEFAULT_LANGUAGE',
    default: 'en',
  },

  /**
   * Enable or disable health checks.
   * Default: 'true'
   */
  VIDSRC_HEALTH_CHECKS_ENABLED: {
    name: 'NEXT_PUBLIC_VIDSRC_HEALTH_CHECKS_ENABLED',
    default: 'true',
  },

  /**
   * Enable or disable event logging.
   * Default: 'true'
   */
  VIDSRC_LOGGING_ENABLED: {
    name: 'NEXT_PUBLIC_VIDSRC_LOGGING_ENABLED',
    default: 'true',
  },
} as const;

/**
 * Session storage key prefix for Vidsrc-related data.
 * Actual keys will be: {prefix}_{feature}_{identifier}
 *
 * @constant
 * @type {string}
 */
export const SESSION_STORAGE_PREFIX = 'vidsrc';

/**
 * Session storage key for subtitle language preference.
 * Format: vidsrc_subtitle_lang_{tmdbId}
 *
 * @constant
 * @type {string}
 */
export const SUBTITLE_PREFERENCE_KEY = `${SESSION_STORAGE_PREFIX}_subtitle_lang`;

/**
 * Session storage key for last successful domain.
 * Format: vidsrc_last_domain_{tmdbId}
 *
 * @constant
 * @type {string}
 */
export const LAST_DOMAIN_KEY = `${SESSION_STORAGE_PREFIX}_last_domain`;

/**
 * Session storage key for domain failure history.
 * Format: vidsrc_domain_failures
 *
 * @constant
 * @type {string}
 */
export const DOMAIN_FAILURES_KEY = `${SESSION_STORAGE_PREFIX}_domain_failures`;
