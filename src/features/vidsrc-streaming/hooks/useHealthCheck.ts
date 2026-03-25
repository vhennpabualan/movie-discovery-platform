'use client';

import { useEffect, useRef, useState } from 'react';
import { VidsrcConfigurationManager } from '../services/VidsrcConfigurationManager';
import { DOMAIN_CONFIG } from '../config/domains';

export interface UseHealthCheckReturn {
  isHealthy: boolean;
  lastCheckTime: number | null;
}

/**
 * useHealthCheck Hook
 *
 * Manages periodic health checks for domain providers.
 * Schedules health checks every 5 minutes and triggers configuration manager checks.
 *
 * @returns Object containing health status and last check time
 */
export function useHealthCheck(): UseHealthCheckReturn {
  const [isHealthy, setIsHealthy] = useState(true);
  const [lastCheckTime, setLastCheckTime] = useState<number | null>(null);
  const managerRef = useRef<VidsrcConfigurationManager | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Initialize configuration manager
    managerRef.current = new VidsrcConfigurationManager();
    let isMounted = true;

    // Perform initial health check
    const performCheck = async () => {
      try {
        if (managerRef.current && isMounted) {
          await managerRef.current.performHealthCheck();

          if (isMounted) {
            setLastCheckTime(Date.now());

            // Check if any domains are healthy
            const statuses = managerRef.current.getDomainStatuses();
            const anyHealthy = statuses.some((status) => status.isHealthy);
            setIsHealthy(anyHealthy);
          }
        }
      } catch (error) {
        console.error('[Vidsrc] Health check failed:', error);
        if (isMounted) {
          setIsHealthy(false);
        }
      }
    };

    // Run initial check
    performCheck();

    // Schedule periodic health checks every 5 minutes
    intervalRef.current = setInterval(() => {
      performCheck();
    }, DOMAIN_CONFIG.healthCheckInterval);

    // Cleanup on unmount
    return () => {
      isMounted = false;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (managerRef.current) {
        managerRef.current.stopHealthChecks();
      }
    };
  }, []);

  return {
    isHealthy,
    lastCheckTime,
  };
}
