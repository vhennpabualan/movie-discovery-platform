/**
 * Logging Utilities for Vidsrc Streaming
 *
 * This module provides functions for logging streaming-related events to the
 * monitoring service. All events include timestamps and relevant context for
 * debugging and performance analysis.
 *
 * Validates: Requirements 9.1, 9.2, 9.3, 9.4
 */

import type { DomainProvider, SubtitleLanguage } from '../types/index';

/**
 * Logs a URL generation event to the monitoring service.
 *
 * Called whenever an embed URL is successfully generated. Logs include:
 * - Timestamp of generation
 * - TMDB ID for the content
 * - Selected domain provider
 * - All parameters used in URL generation
 *
 * @param tmdbId - The TMDB ID for the movie or TV show
 * @param domain - The domain provider selected for this URL
 * @param params - Object containing all URL generation parameters
 *
 * @example
 * ```typescript
 * logURLGeneration(550, 'vidsrc-embed.ru', {
 *   contentType: 'movie',
 *   subtitleLanguage: 'en',
 *   autoplay: false
 * });
 * ```
 */
export function logURLGeneration(
  tmdbId: number,
  domain: DomainProvider,
  params: Record<string, unknown>
): void {
  const event = {
    type: 'vidsrc_url_generation',
    timestamp: new Date().toISOString(),
    tmdbId,
    domain,
    parameters: params,
  };

  // Send to monitoring service
  sendToMonitoringService(event);
}

/**
 * Logs a domain provider failure event to the monitoring service.
 *
 * Called when a domain provider fails to respond or returns an error.
 * Logs include:
 * - Timestamp of failure
 * - Domain provider that failed
 * - Reason for the failure
 * - Retry attempt number
 *
 * @param domain - The domain provider that failed
 * @param reason - Description of why the domain failed (e.g., 'timeout', 'http_error')
 * @param attemptNumber - The retry attempt number (0-indexed)
 *
 * @example
 * ```typescript
 * logDomainFailure('vidsrc-embed.ru', 'timeout', 0);
 * logDomainFailure('vidsrc-embed.su', 'http_error_500', 1);
 * ```
 */
export function logDomainFailure(
  domain: DomainProvider,
  reason: string,
  attemptNumber: number
): void {
  const event = {
    type: 'vidsrc_domain_failure',
    timestamp: new Date().toISOString(),
    domain,
    reason,
    attemptNumber,
  };

  // Send to monitoring service
  sendToMonitoringService(event);
}

/**
 * Logs a subtitle language selection event to the monitoring service.
 *
 * Called when a user selects a subtitle language. Logs include:
 * - Timestamp of selection
 * - TMDB ID for the content
 * - Selected subtitle language code
 *
 * @param tmdbId - The TMDB ID for the movie or TV show
 * @param language - The subtitle language code selected by the user
 *
 * @example
 * ```typescript
 * logSubtitleSelection(550, 'es');
 * logSubtitleSelection(1399, 'fr');
 * ```
 */
export function logSubtitleSelection(
  tmdbId: number,
  language: SubtitleLanguage
): void {
  const event = {
    type: 'vidsrc_subtitle_selection',
    timestamp: new Date().toISOString(),
    tmdbId,
    language,
  };

  // Send to monitoring service
  sendToMonitoringService(event);
}

/**
 * Sends an event to the monitoring service.
 *
 * This is an internal helper function that handles the actual transmission
 * of events to the monitoring backend. In production, this would send events
 * to a service like Datadog, New Relic, or similar.
 *
 * @param event - The event object to send
 *
 * @internal
 */
function sendToMonitoringService(event: Record<string, unknown>): void {
  // In a real implementation, this would send to a monitoring service
  // For now, we log to console in development
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
    console.debug('[Vidsrc Monitoring]', event);
  }

  // TODO: Implement actual monitoring service integration
  // Example: sendToDatadog(event), sendToNewRelic(event), etc.
}
