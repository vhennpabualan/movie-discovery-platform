/**
 * Vidsrc Streaming Hooks
 *
 * This module exports all custom React hooks for the Vidsrc streaming feature.
 * These hooks manage player state, subtitle preferences, and health checks.
 */

export { useVidsrcPlayer } from './useVidsrcPlayer';
export type { UseVidsrcPlayerReturn } from './useVidsrcPlayer';

export { useSubtitlePreference } from './useSubtitlePreference';
export type { UseSubtitlePreferenceReturn } from './useSubtitlePreference';

export { useHealthCheck } from './useHealthCheck';
export type { UseHealthCheckReturn } from './useHealthCheck';
