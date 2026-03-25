/**
 * Error logging and monitoring service
 * Sends error events to monitoring service for tracking and alerting
 */

import { APIError } from '@/lib/api/errors';

export interface ErrorLogEntry {
  timestamp: string;
  errorType: string;
  statusCode: number;
  message: string;
  endpoint?: string;
  retryAttempt?: number;
  userAgent?: string;
  url?: string;
}

/**
 * Logs an error to the monitoring service
 * In production, this would send to services like Sentry, DataDog, etc.
 */
export function logErrorToMonitoring(
  error: APIError | Error,
  context?: {
    endpoint?: string;
    retryAttempt?: number;
  }
): void {
  const entry: ErrorLogEntry = {
    timestamp: new Date().toISOString(),
    errorType: error.name,
    statusCode: error instanceof APIError ? error.statusCode : 500,
    message: error.message,
    endpoint: context?.endpoint,
    retryAttempt: context?.retryAttempt,
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
    url: typeof window !== 'undefined' ? window.location.href : undefined,
  };

  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.error('[Error Logger]', entry);
  }

  // Send to monitoring service in production
  if (process.env.NODE_ENV === 'production') {
    sendToMonitoringService(entry);
  }
}

/**
 * Sends error log to external monitoring service
 * This is a placeholder that can be configured with actual service endpoints
 */
async function sendToMonitoringService(entry: ErrorLogEntry): Promise<void> {
  try {
    // Placeholder for actual monitoring service integration
    // Example: Sentry, DataDog, LogRocket, etc.
    const monitoringEndpoint = process.env.NEXT_PUBLIC_MONITORING_ENDPOINT;

    if (!monitoringEndpoint) {
      return;
    }

    await fetch(monitoringEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(entry),
    }).catch(() => {
      // Silently fail if monitoring service is unavailable
      // Don't let monitoring failures break the app
    });
  } catch {
    // Silently fail monitoring service calls
  }
}

/**
 * Logs API performance metrics
 */
export function logAPIMetrics(
  endpoint: string,
  duration: number,
  statusCode: number
): void {
  if (process.env.NODE_ENV === 'development') {
    console.log(`[API Metrics] ${endpoint} - ${duration}ms - Status: ${statusCode}`);
  }

  // Flag slow requests (> 2 seconds)
  if (duration > 2000) {
    logErrorToMonitoring(
      new Error(`Slow API request: ${endpoint} took ${duration}ms`),
      { endpoint }
    );
  }
}
