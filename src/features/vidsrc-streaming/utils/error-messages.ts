/**
 * Error Message Utilities for Vidsrc Streaming
 *
 * This module provides user-friendly error messages for all streaming error types.
 * Messages are designed to be clear, helpful, and actionable for end users.
 *
 * Validates: Requirements 5.1, 5.3, 8.3, 11.2
 */

import type { StreamingErrorType } from '../types/index';

/**
 * Error message constants for all streaming error types.
 * These messages are displayed to users when streaming errors occur.
 */
const ERROR_MESSAGES: Record<StreamingErrorType, string> = {
  INVALID_TMDB_ID: 'Invalid movie ID - streaming unavailable',
  ALL_DOMAINS_FAILED: 'Stream not available - please try again later',
  NETWORK_TIMEOUT: 'Connection timeout - please check your internet connection',
  INVALID_URL: 'Invalid streaming URL',
  IFRAME_LOAD_FAILED: 'Unable to load streaming player',
  UNKNOWN: 'An unexpected error occurred',
};

/**
 * Gets the user-friendly error message for a given error type.
 *
 * Maps streaming error types to appropriate user-facing messages that explain
 * what went wrong and suggest potential actions.
 *
 * @param errorType - The type of streaming error that occurred
 * @returns A user-friendly error message string
 *
 * @example
 * ```typescript
 * getErrorMessage('INVALID_TMDB_ID');
 * // Returns: 'Invalid movie ID - streaming unavailable'
 *
 * getErrorMessage('NETWORK_TIMEOUT');
 * // Returns: 'Connection timeout - please check your internet connection'
 *
 * getErrorMessage('ALL_DOMAINS_FAILED');
 * // Returns: 'Stream not available - please try again later'
 * ```
 */
export function getErrorMessage(errorType: StreamingErrorType): string {
  return ERROR_MESSAGES[errorType];
}

/**
 * Gets all available error messages.
 *
 * Useful for testing or displaying all possible error states.
 *
 * @returns An object mapping error types to their messages
 *
 * @example
 * ```typescript
 * const allMessages = getAllErrorMessages();
 * Object.entries(allMessages).forEach(([type, message]) => {
 *   console.log(`${type}: ${message}`);
 * });
 * ```
 */
export function getAllErrorMessages(): Record<StreamingErrorType, string> {
  return { ...ERROR_MESSAGES };
}
