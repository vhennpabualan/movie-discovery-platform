/**
 * Vidsrc Domain Configuration
 *
 * This module defines the domain providers for Vidsrc embed URLs and their
 * health check configuration. Domains are listed in priority order for fallback logic.
 */

import type { DomainProvider } from '../types';

/**
 * Array of domain providers in priority order.
 * When one domain fails, the system will attempt the next domain in this list.
 *
 * @constant
 * @type {DomainProvider[]}
 */
export const DOMAIN_PROVIDERS: DomainProvider[] = [
  'vidsrc.in',
  'vidsrc.to',
  'vidsrc.xyz',
  'vidsrc.net',
  'vidsrc.pm',
  'vidsrc.icu',
  'vidsrc.me',
];

/**
 * Configuration for domain provider health checks and failure handling.
 * These settings control how the system monitors and manages domain availability.
 *
 * @constant
 * @type {Object}
 */
export const DOMAIN_CONFIG = {
  /**
   * Interval between health checks in milliseconds.
   * Default: 5 minutes (300,000 ms)
   */
  healthCheckInterval: 5 * 60 * 1000,

  /**
   * Number of consecutive failures before marking a domain as unhealthy.
   * Default: 3 failures
   */
  failureThreshold: 3,

  /**
   * Timeout for health check requests in milliseconds.
   * Default: 5 seconds (5,000 ms)
   */
  healthCheckTimeout: 5 * 1000,
} as const;
