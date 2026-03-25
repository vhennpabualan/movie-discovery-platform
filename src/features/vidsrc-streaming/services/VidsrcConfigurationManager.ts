/**
 * VidsrcConfigurationManager Service
 *
 * Manages domain provider selection, health status tracking, and retry logic
 * for the Vidsrc streaming integration. Implements exponential backoff,
 * health checks, and domain fallback strategies.
 */

import type { DomainProvider, DomainProviderStatus } from '../types/index';
import { DOMAIN_PROVIDERS, DOMAIN_CONFIG } from '../config/domains';
import { BACKOFF_CONFIG } from '../config/constants';
import { VidsrcEmbedURLGenerator } from './VidsrcEmbedURLGenerator';

/**
 * VidsrcConfigurationManager
 *
 * Manages domain provider selection, health checks, and retry logic.
 * Tracks domain health status and implements exponential backoff for retries.
 */
export class VidsrcConfigurationManager {
  private domainStatuses: Map<DomainProvider, DomainProviderStatus>;
  private urlGenerator: VidsrcEmbedURLGenerator;
  private healthCheckInterval: NodeJS.Timeout | null = null;
  private activeDomain: DomainProvider | null = null;

  constructor() {
    this.urlGenerator = new VidsrcEmbedURLGenerator();
    this.domainStatuses = new Map();

    // Initialize all domains as healthy
    DOMAIN_PROVIDERS.forEach((domain) => {
      this.domainStatuses.set(domain, {
        domain,
        isHealthy: true,
        lastHealthCheckTime: Date.now(),
        failureCount: 0,
      });
    });

    this.activeDomain = DOMAIN_PROVIDERS[0] || null;
  }

  /**
   * Gets the next available domain provider from the priority list.
   * Returns the first healthy domain, filtering out unhealthy ones.
   * Sorts by failure count and last failure time.
   *
   * @returns The next available domain provider, or null if all are exhausted
   */
  getNextDomain(): DomainProvider | null {
    const healthyDomains = DOMAIN_PROVIDERS.filter((domain) => {
      const status = this.domainStatuses.get(domain);
      return status && status.isHealthy;
    });

    if (healthyDomains.length === 0) {
      return null;
    }

    // Sort by failure count (ascending) and last failure time (most recent first)
    healthyDomains.sort((a, b) => {
      const statusA = this.domainStatuses.get(a)!;
      const statusB = this.domainStatuses.get(b)!;

      // First, sort by failure count
      if (statusA.failureCount !== statusB.failureCount) {
        return statusA.failureCount - statusB.failureCount;
      }

      // If failure counts are equal, sort by last failure time (most recent first)
      const timeA = statusA.lastFailureTime || 0;
      const timeB = statusB.lastFailureTime || 0;
      return timeB - timeA;
    });

    const nextDomain = healthyDomains[0];
    this.activeDomain = nextDomain;
    return nextDomain;
  }

  /**
   * Marks a domain as failed and updates its failure counter.
   * If failure count exceeds threshold, marks domain as unhealthy.
   *
   * @param domain - The domain provider that failed
   */
  markDomainFailed(domain: DomainProvider): void {
    const status = this.domainStatuses.get(domain);
    if (!status) {
      return;
    }

    status.failureCount += 1;
    status.lastFailureTime = Date.now();

    if (status.failureCount > DOMAIN_CONFIG.failureThreshold) {
      status.isHealthy = false;
      console.log(
        `[Vidsrc] Domain marked as unhealthy: ${domain} (failures: ${status.failureCount})`
      );
    } else {
      console.log(
        `[Vidsrc] Domain failure recorded: ${domain} (failures: ${status.failureCount}/${DOMAIN_CONFIG.failureThreshold})`
      );
    }
  }

  /**
   * Resets all domains to healthy state and clears failure counters.
   * Restores domain priority to configured order.
   */
  resetDomains(): void {
    DOMAIN_PROVIDERS.forEach((domain) => {
      const status = this.domainStatuses.get(domain);
      if (status) {
        status.isHealthy = true;
        status.failureCount = 0;
        status.lastFailureTime = undefined;
      }
    });

    this.activeDomain = DOMAIN_PROVIDERS[0] || null;
    console.log('[Vidsrc] All domains reset to healthy state');
  }

  /**
   * Gets the currently active domain provider.
   *
   * @returns The currently active domain, or null if no healthy domains available
   */
  getActiveDomain(): DomainProvider | null {
    if (this.activeDomain) {
      const status = this.domainStatuses.get(this.activeDomain);
      if (status && status.isHealthy) {
        return this.activeDomain;
      }
    }

    return this.getNextDomain();
  }

  /**
   * Calculates exponential backoff delay with jitter.
   * Formula: baseDelay * (2 ^ attemptNumber) + jitter, capped at maxDelay
   *
   * @param attemptNumber - The current attempt number (0-indexed)
   * @returns Delay in milliseconds
   */
  calculateBackoffDelay(attemptNumber: number): number {
    const baseDelay = BACKOFF_CONFIG.baseDelay;
    const maxDelay = BACKOFF_CONFIG.maxDelay;

    // Calculate exponential delay: baseDelay * (2 ^ attemptNumber)
    const exponentialDelay = baseDelay * Math.pow(2, attemptNumber);

    // Add jitter if enabled
    let delay = exponentialDelay;
    if (BACKOFF_CONFIG.useJitter) {
      const jitterAmount = Math.random() * (exponentialDelay * BACKOFF_CONFIG.jitterFactor);
      delay = exponentialDelay + jitterAmount;
    }

    // Cap at maximum delay
    return Math.min(delay, maxDelay);
  }

  /**
   * Performs health checks on all domain providers.
   * Attempts HEAD request to each domain with timeout.
   * Updates domain status based on response.
   * Schedules next health check in 5 minutes.
   *
   * @returns Promise that resolves when health check completes
   */
  async performHealthCheck(): Promise<void> {
    console.log('[Vidsrc] Starting health check for all domains');

    const healthCheckPromises = DOMAIN_PROVIDERS.map(async (domain) => {
      try {
        // Create test embed URL with dummy TMDB ID
        const testUrl = `https://${domain}/embed/movie?tmdb=1`;

        // Attempt HEAD request with timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(
          () => controller.abort(),
          DOMAIN_CONFIG.healthCheckTimeout
        );

        try {
          const response = await fetch(testUrl, {
            method: 'HEAD',
            signal: controller.signal,
          });

          clearTimeout(timeoutId);

          const status = this.domainStatuses.get(domain);
          if (!status) return;

          // Check if response is successful (200-299)
          if (response.status >= 200 && response.status < 300) {
            status.isHealthy = true;
            status.failureCount = 0;
            status.lastHealthCheckTime = Date.now();
            console.log(`[Vidsrc] Health check passed: ${domain}`);
          } else {
            status.failureCount += 1;
            status.lastFailureTime = Date.now();
            status.lastHealthCheckTime = Date.now();

            if (status.failureCount > DOMAIN_CONFIG.failureThreshold) {
              status.isHealthy = false;
            }

            console.log(
              `[Vidsrc] Health check failed: ${domain} (status: ${response.status})`
            );
          }
        } catch (error) {
          clearTimeout(timeoutId);

          const status = this.domainStatuses.get(domain);
          if (!status) return;

          status.failureCount += 1;
          status.lastFailureTime = Date.now();
          status.lastHealthCheckTime = Date.now();

          if (status.failureCount > DOMAIN_CONFIG.failureThreshold) {
            status.isHealthy = false;
          }

          const errorMsg = error instanceof Error ? error.message : 'Unknown error';
          console.log(`[Vidsrc] Health check error: ${domain} (${errorMsg})`);
        }
      } catch (error) {
        console.error(`[Vidsrc] Unexpected error during health check for ${domain}:`, error);
      }
    });

    await Promise.all(healthCheckPromises);

    // Schedule next health check in 5 minutes
    this.scheduleNextHealthCheck();
  }

  /**
   * Schedules the next health check to run in 5 minutes.
   * Clears any existing scheduled health check first.
   *
   * @private
   */
  private scheduleNextHealthCheck(): void {
    if (this.healthCheckInterval) {
      clearTimeout(this.healthCheckInterval);
    }

    this.healthCheckInterval = setTimeout(() => {
      this.performHealthCheck().catch((error) => {
        console.error('[Vidsrc] Health check failed:', error);
      });
    }, DOMAIN_CONFIG.healthCheckInterval);
  }

  /**
   * Starts periodic health checks.
   * Should be called once during application initialization.
   */
  startHealthChecks(): void {
    this.performHealthCheck().catch((error) => {
      console.error('[Vidsrc] Initial health check failed:', error);
    });
  }

  /**
   * Stops periodic health checks.
   * Should be called during application cleanup.
   */
  stopHealthChecks(): void {
    if (this.healthCheckInterval) {
      clearTimeout(this.healthCheckInterval);
      this.healthCheckInterval = null;
    }
  }

  /**
   * Gets the current status of all domain providers.
   *
   * @returns Array of domain provider statuses
   */
  getDomainStatuses(): DomainProviderStatus[] {
    return Array.from(this.domainStatuses.values());
  }

  /**
   * Gets the status of a specific domain provider.
   *
   * @param domain - The domain provider to get status for
   * @returns The domain provider status, or undefined if not found
   */
  getDomainStatus(domain: DomainProvider): DomainProviderStatus | undefined {
    return this.domainStatuses.get(domain);
  }
}
