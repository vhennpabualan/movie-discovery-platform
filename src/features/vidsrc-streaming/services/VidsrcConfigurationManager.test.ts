/**
 * Unit tests for VidsrcConfigurationManager
 *
 * Tests domain selection, failure marking, exponential backoff,
 * health checks, and reset functionality.
 */

import { VidsrcConfigurationManager } from './VidsrcConfigurationManager';
import { DOMAIN_PROVIDERS, DOMAIN_CONFIG } from '../config/domains';
import { BACKOFF_CONFIG } from '../config/constants';

describe('VidsrcConfigurationManager', () => {
  let manager: VidsrcConfigurationManager;

  beforeEach(() => {
    manager = new VidsrcConfigurationManager();
    // Stop any health checks to avoid interference with tests
    manager.stopHealthChecks();
  });

  afterEach(() => {
    manager.stopHealthChecks();
  });

  describe('getNextDomain', () => {
    it('should return first domain when all are healthy', () => {
      const domain = manager.getNextDomain();
      expect(domain).toBe(DOMAIN_PROVIDERS[0]);
    });

    it('should return null when all domains are unhealthy', () => {
      // Mark all domains as unhealthy
      DOMAIN_PROVIDERS.forEach((domain) => {
        for (let i = 0; i <= DOMAIN_CONFIG.failureThreshold; i++) {
          manager.markDomainFailed(domain);
        }
      });

      const domain = manager.getNextDomain();
      expect(domain).toBeNull();
    });

    it('should skip unhealthy domains and return next healthy one', () => {
      const firstDomain = DOMAIN_PROVIDERS[0];
      const secondDomain = DOMAIN_PROVIDERS[1];

      // Mark first domain as unhealthy
      for (let i = 0; i <= DOMAIN_CONFIG.failureThreshold; i++) {
        manager.markDomainFailed(firstDomain);
      }

      const domain = manager.getNextDomain();
      expect(domain).toBe(secondDomain);
    });

    it('should sort by failure count (ascending)', () => {
      const firstDomain = DOMAIN_PROVIDERS[0];
      const secondDomain = DOMAIN_PROVIDERS[1];
      const thirdDomain = DOMAIN_PROVIDERS[2];

      // Mark first domain with 2 failures
      manager.markDomainFailed(firstDomain);
      manager.markDomainFailed(firstDomain);

      // Mark second domain with 1 failure
      manager.markDomainFailed(secondDomain);

      // Third domain has 0 failures, should be returned first
      const domain = manager.getNextDomain();
      expect(domain).toBe(thirdDomain);
    });
  });

  describe('markDomainFailed', () => {
    it('should increment failure counter', () => {
      const domain = DOMAIN_PROVIDERS[0];
      const initialStatus = manager.getDomainStatus(domain);
      expect(initialStatus?.failureCount).toBe(0);

      manager.markDomainFailed(domain);
      const updatedStatus = manager.getDomainStatus(domain);
      expect(updatedStatus?.failureCount).toBe(1);
    });

    it('should record failure timestamp', () => {
      const domain = DOMAIN_PROVIDERS[0];
      const beforeTime = Date.now();

      manager.markDomainFailed(domain);

      const status = manager.getDomainStatus(domain);
      expect(status?.lastFailureTime).toBeDefined();
      expect(status!.lastFailureTime! >= beforeTime).toBe(true);
    });

    it('should mark domain as unhealthy when threshold exceeded', () => {
      const domain = DOMAIN_PROVIDERS[0];
      const status = manager.getDomainStatus(domain);
      expect(status?.isHealthy).toBe(true);

      // Mark as failed threshold + 1 times
      for (let i = 0; i <= DOMAIN_CONFIG.failureThreshold; i++) {
        manager.markDomainFailed(domain);
      }

      const updatedStatus = manager.getDomainStatus(domain);
      expect(updatedStatus?.isHealthy).toBe(false);
    });

    it('should not mark as unhealthy until threshold exceeded', () => {
      const domain = DOMAIN_PROVIDERS[0];

      // Mark as failed threshold times (but not threshold + 1)
      for (let i = 0; i < DOMAIN_CONFIG.failureThreshold; i++) {
        manager.markDomainFailed(domain);
      }

      const status = manager.getDomainStatus(domain);
      expect(status?.isHealthy).toBe(true);
    });
  });

  describe('resetDomains', () => {
    it('should reset all domains to healthy state', () => {
      const domain = DOMAIN_PROVIDERS[0];

      // Mark domain as failed
      for (let i = 0; i <= DOMAIN_CONFIG.failureThreshold; i++) {
        manager.markDomainFailed(domain);
      }

      expect(manager.getDomainStatus(domain)?.isHealthy).toBe(false);

      manager.resetDomains();

      expect(manager.getDomainStatus(domain)?.isHealthy).toBe(true);
    });

    it('should clear failure counters', () => {
      const domain = DOMAIN_PROVIDERS[0];

      manager.markDomainFailed(domain);
      manager.markDomainFailed(domain);

      expect(manager.getDomainStatus(domain)?.failureCount).toBe(2);

      manager.resetDomains();

      expect(manager.getDomainStatus(domain)?.failureCount).toBe(0);
    });

    it('should reset domain priority to configured order', () => {
      // Mark first domain as unhealthy
      const firstDomain = DOMAIN_PROVIDERS[0];
      for (let i = 0; i <= DOMAIN_CONFIG.failureThreshold; i++) {
        manager.markDomainFailed(firstDomain);
      }

      expect(manager.getNextDomain()).toBe(DOMAIN_PROVIDERS[1]);

      manager.resetDomains();

      expect(manager.getNextDomain()).toBe(DOMAIN_PROVIDERS[0]);
    });

    it('should clear last failure times', () => {
      const domain = DOMAIN_PROVIDERS[0];

      manager.markDomainFailed(domain);
      expect(manager.getDomainStatus(domain)?.lastFailureTime).toBeDefined();

      manager.resetDomains();

      expect(manager.getDomainStatus(domain)?.lastFailureTime).toBeUndefined();
    });
  });

  describe('getActiveDomain', () => {
    it('should return currently active domain when healthy', () => {
      const domain = manager.getActiveDomain();
      expect(domain).toBe(DOMAIN_PROVIDERS[0]);
    });

    it('should return null when no healthy domains available', () => {
      // Mark all domains as unhealthy
      DOMAIN_PROVIDERS.forEach((domain) => {
        for (let i = 0; i <= DOMAIN_CONFIG.failureThreshold; i++) {
          manager.markDomainFailed(domain);
        }
      });

      const domain = manager.getActiveDomain();
      expect(domain).toBeNull();
    });

    it('should return next healthy domain when active is unhealthy', () => {
      const firstDomain = DOMAIN_PROVIDERS[0];
      const secondDomain = DOMAIN_PROVIDERS[1];

      // Mark first domain as unhealthy
      for (let i = 0; i <= DOMAIN_CONFIG.failureThreshold; i++) {
        manager.markDomainFailed(firstDomain);
      }

      const domain = manager.getActiveDomain();
      expect(domain).toBe(secondDomain);
    });
  });

  describe('calculateBackoffDelay', () => {
    it('should calculate exponential backoff correctly', () => {
      const baseDelay = BACKOFF_CONFIG.baseDelay;

      // Attempt 0: baseDelay * 2^0 = 100
      const delay0 = manager.calculateBackoffDelay(0);
      expect(delay0).toBeGreaterThanOrEqual(baseDelay);
      expect(delay0).toBeLessThanOrEqual(baseDelay * (1 + BACKOFF_CONFIG.jitterFactor));

      // Attempt 1: baseDelay * 2^1 = 200
      const delay1 = manager.calculateBackoffDelay(1);
      expect(delay1).toBeGreaterThanOrEqual(baseDelay * 2);
      expect(delay1).toBeLessThanOrEqual(baseDelay * 2 * (1 + BACKOFF_CONFIG.jitterFactor));

      // Attempt 2: baseDelay * 2^2 = 400
      const delay2 = manager.calculateBackoffDelay(2);
      expect(delay2).toBeGreaterThanOrEqual(baseDelay * 4);
      expect(delay2).toBeLessThanOrEqual(baseDelay * 4 * (1 + BACKOFF_CONFIG.jitterFactor));
    });

    it('should respect maximum delay cap', () => {
      const maxDelay = BACKOFF_CONFIG.maxDelay;

      // High attempt number should be capped
      const delay = manager.calculateBackoffDelay(10);
      expect(delay).toBeLessThanOrEqual(maxDelay);
    });

    it('should add jitter to delays', () => {
      // Run multiple times to check for variation
      const delays = Array.from({ length: 10 }, (_, i) =>
        manager.calculateBackoffDelay(1)
      );

      // Check that not all delays are identical (jitter is working)
      const uniqueDelays = new Set(delays);
      expect(uniqueDelays.size).toBeGreaterThan(1);
    });

    it('should increase delay with attempt number', () => {
      const delay0 = manager.calculateBackoffDelay(0);
      const delay1 = manager.calculateBackoffDelay(1);
      const delay2 = manager.calculateBackoffDelay(2);

      expect(delay1).toBeGreaterThan(delay0);
      expect(delay2).toBeGreaterThan(delay1);
    });

    it('should return delay between 0 and maxDelay', () => {
      const maxDelay = BACKOFF_CONFIG.maxDelay;

      for (let i = 0; i < 10; i++) {
        const delay = manager.calculateBackoffDelay(i);
        expect(delay).toBeGreaterThanOrEqual(0);
        expect(delay).toBeLessThanOrEqual(maxDelay);
      }
    });
  });

  describe('performHealthCheck', () => {
    it('should mark domain as healthy on successful response', async () => {
      const domain = DOMAIN_PROVIDERS[0];

      // Mark domain as unhealthy first
      for (let i = 0; i <= DOMAIN_CONFIG.failureThreshold; i++) {
        manager.markDomainFailed(domain);
      }

      expect(manager.getDomainStatus(domain)?.isHealthy).toBe(false);

      // Mock successful fetch
      global.fetch = jest.fn().mockResolvedValueOnce({
        status: 200,
      });

      await manager.performHealthCheck();

      expect(manager.getDomainStatus(domain)?.isHealthy).toBe(true);
    });

    it('should reset failure count on successful health check', async () => {
      const domain = DOMAIN_PROVIDERS[0];

      manager.markDomainFailed(domain);
      expect(manager.getDomainStatus(domain)?.failureCount).toBe(1);

      global.fetch = jest.fn().mockResolvedValueOnce({
        status: 200,
      });

      await manager.performHealthCheck();

      expect(manager.getDomainStatus(domain)?.failureCount).toBe(0);
    });

    it('should increment failure count on failed response', async () => {
      const domain = DOMAIN_PROVIDERS[0];
      const initialFailures = manager.getDomainStatus(domain)?.failureCount || 0;

      global.fetch = jest.fn().mockResolvedValueOnce({
        status: 500,
      });

      await manager.performHealthCheck();

      expect(manager.getDomainStatus(domain)?.failureCount).toBe(initialFailures + 1);
    });

    it('should mark domain as unhealthy on repeated failures', async () => {
      const domain = DOMAIN_PROVIDERS[0];

      // Simulate multiple failed health checks
      global.fetch = jest.fn().mockResolvedValue({
        status: 500,
      });

      for (let i = 0; i <= DOMAIN_CONFIG.failureThreshold; i++) {
        await manager.performHealthCheck();
      }

      expect(manager.getDomainStatus(domain)?.isHealthy).toBe(false);
    });

    it('should handle timeout errors', async () => {
      const domain = DOMAIN_PROVIDERS[0];
      const initialFailures = manager.getDomainStatus(domain)?.failureCount || 0;

      global.fetch = jest.fn().mockImplementationOnce(() => {
        const error = new Error('Timeout');
        error.name = 'AbortError';
        throw error;
      });

      await manager.performHealthCheck();

      expect(manager.getDomainStatus(domain)?.failureCount).toBe(initialFailures + 1);
    });

    it('should update lastHealthCheckTime', async () => {
      const domain = DOMAIN_PROVIDERS[0];
      const beforeTime = Date.now();

      global.fetch = jest.fn().mockResolvedValueOnce({
        status: 200,
      });

      await manager.performHealthCheck();

      const status = manager.getDomainStatus(domain);
      expect(status?.lastHealthCheckTime).toBeGreaterThanOrEqual(beforeTime);
    });
  });

  describe('getDomainStatuses', () => {
    it('should return all domain statuses', () => {
      const statuses = manager.getDomainStatuses();
      expect(statuses).toHaveLength(DOMAIN_PROVIDERS.length);
    });

    it('should return correct status for each domain', () => {
      const statuses = manager.getDomainStatuses();
      const statusMap = new Map(statuses.map((s) => [s.domain, s]));

      DOMAIN_PROVIDERS.forEach((domain) => {
        expect(statusMap.has(domain)).toBe(true);
      });
    });
  });

  describe('getDomainStatus', () => {
    it('should return status for specific domain', () => {
      const domain = DOMAIN_PROVIDERS[0];
      const status = manager.getDomainStatus(domain);

      expect(status).toBeDefined();
      expect(status?.domain).toBe(domain);
    });

    it('should return undefined for non-existent domain', () => {
      const status = manager.getDomainStatus('invalid-domain' as any);
      expect(status).toBeUndefined();
    });
  });

  describe('startHealthChecks and stopHealthChecks', () => {
    it('should start health checks', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        status: 200,
      });

      manager.startHealthChecks();

      // Wait a bit for the health check to start
      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(global.fetch).toHaveBeenCalled();

      manager.stopHealthChecks();
    });

    it('should stop health checks', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        status: 200,
      });

      manager.startHealthChecks();
      manager.stopHealthChecks();

      // Wait a bit to ensure no more calls
      await new Promise((resolve) => setTimeout(resolve, 100));

      const callCount = (global.fetch as jest.Mock).mock.calls.length;

      // Wait longer to ensure no additional calls
      await new Promise((resolve) => setTimeout(resolve, 200));

      expect((global.fetch as jest.Mock).mock.calls.length).toBe(callCount);
    });
  });

  describe('integration scenarios', () => {
    it('should handle domain failure and recovery flow', () => {
      const domain = DOMAIN_PROVIDERS[0];

      // Initial state: domain is healthy
      expect(manager.getNextDomain()).toBe(domain);

      // Mark domain as failed multiple times
      for (let i = 0; i <= DOMAIN_CONFIG.failureThreshold; i++) {
        manager.markDomainFailed(domain);
      }

      // Domain should now be unhealthy
      expect(manager.getDomainStatus(domain)?.isHealthy).toBe(false);
      expect(manager.getNextDomain()).toBe(DOMAIN_PROVIDERS[1]);

      // Reset domains
      manager.resetDomains();

      // Domain should be healthy again
      expect(manager.getDomainStatus(domain)?.isHealthy).toBe(true);
      expect(manager.getNextDomain()).toBe(domain);
    });

    it('should handle retry with exponential backoff', () => {
      const delays: number[] = [];

      for (let i = 0; i < 5; i++) {
        delays.push(manager.calculateBackoffDelay(i));
      }

      // Verify delays increase
      for (let i = 1; i < delays.length; i++) {
        expect(delays[i]).toBeGreaterThanOrEqual(delays[i - 1]);
      }

      // Verify all delays are within bounds
      delays.forEach((delay) => {
        expect(delay).toBeGreaterThanOrEqual(0);
        expect(delay).toBeLessThanOrEqual(BACKOFF_CONFIG.maxDelay);
      });
    });

    it('should handle multiple domain failures and fallback', () => {
      const firstDomain = DOMAIN_PROVIDERS[0];
      const secondDomain = DOMAIN_PROVIDERS[1];
      const thirdDomain = DOMAIN_PROVIDERS[2];

      // Mark first domain as unhealthy
      for (let i = 0; i <= DOMAIN_CONFIG.failureThreshold; i++) {
        manager.markDomainFailed(firstDomain);
      }

      expect(manager.getNextDomain()).toBe(secondDomain);

      // Mark second domain as unhealthy
      for (let i = 0; i <= DOMAIN_CONFIG.failureThreshold; i++) {
        manager.markDomainFailed(secondDomain);
      }

      expect(manager.getNextDomain()).toBe(thirdDomain);
    });
  });
});
