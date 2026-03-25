/**
 * API Performance Monitoring
 * Logs API response times, flags slow requests, and sends alerts to monitoring service
 */

export interface APIRequestLog {
  timestamp: string;
  endpoint: string;
  method: string;
  statusCode: number;
  duration: number;
  isSlow: boolean;
  userAgent?: string;
  url?: string;
}

// In-memory storage for aggregated metrics (in production, use a database)
const requestLogs: APIRequestLog[] = [];
const MAX_LOGS = 1000; // Keep last 1000 requests

/**
 * Logs an API request with performance metrics
 */
export function logAPIRequest(
  endpoint: string,
  method: string,
  statusCode: number,
  duration: number
): void {
  const isSlow = duration > 2000;

  const log: APIRequestLog = {
    timestamp: new Date().toISOString(),
    endpoint,
    method,
    statusCode,
    duration,
    isSlow,
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
    url: typeof window !== 'undefined' ? window.location.href : undefined,
  };

  // Store in memory
  requestLogs.push(log);
  if (requestLogs.length > MAX_LOGS) {
    requestLogs.shift();
  }

  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    const statusEmoji = statusCode >= 200 && statusCode < 300 ? '✓' : '✗';
    const slowIndicator = isSlow ? ' [SLOW]' : '';
    console.log(
      `[API] ${statusEmoji} ${method} ${endpoint} - ${duration}ms - Status: ${statusCode}${slowIndicator}`
    );
  }

  // Send slow request alert to monitoring service
  if (isSlow) {
    sendSlowRequestAlert(log);
  }
}

/**
 * Sends a slow request alert to the monitoring service
 */
async function sendSlowRequestAlert(log: APIRequestLog): Promise<void> {
  try {
    const monitoringEndpoint = process.env.NEXT_PUBLIC_MONITORING_ENDPOINT;

    if (!monitoringEndpoint) {
      return;
    }

    await fetch(monitoringEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'slow-api-request',
        ...log,
      }),
    }).catch(() => {
      // Silently fail if monitoring service is unavailable
    });
  } catch {
    // Silently fail monitoring service calls
  }
}

/**
 * Gets aggregated API performance metrics
 */
export function getAggregatedMetrics() {
  if (requestLogs.length === 0) {
    return null;
  }

  const totalRequests = requestLogs.length;
  const slowRequests = requestLogs.filter((log) => log.isSlow).length;
  const failedRequests = requestLogs.filter(
    (log) => log.statusCode >= 400
  ).length;

  const durations = requestLogs.map((log) => log.duration);
  const avgDuration = durations.reduce((a, b) => a + b, 0) / durations.length;
  const minDuration = Math.min(...durations);
  const maxDuration = Math.max(...durations);

  // Calculate median
  const sortedDurations = [...durations].sort((a, b) => a - b);
  const medianDuration =
    sortedDurations.length % 2 === 0
      ? (sortedDurations[sortedDurations.length / 2 - 1] +
          sortedDurations[sortedDurations.length / 2]) /
        2
      : sortedDurations[Math.floor(sortedDurations.length / 2)];

  // Group by endpoint
  const endpointMetrics: Record<
    string,
    {
      count: number;
      avgDuration: number;
      slowCount: number;
      failureCount: number;
    }
  > = {};

  requestLogs.forEach((log) => {
    if (!endpointMetrics[log.endpoint]) {
      endpointMetrics[log.endpoint] = {
        count: 0,
        avgDuration: 0,
        slowCount: 0,
        failureCount: 0,
      };
    }

    const metric = endpointMetrics[log.endpoint];
    metric.count++;
    metric.avgDuration += log.duration;
    if (log.isSlow) metric.slowCount++;
    if (log.statusCode >= 400) metric.failureCount++;
  });

  // Calculate averages for each endpoint
  Object.values(endpointMetrics).forEach((metric) => {
    metric.avgDuration = metric.avgDuration / metric.count;
  });

  return {
    totalRequests,
    slowRequests,
    slowRequestPercentage: ((slowRequests / totalRequests) * 100).toFixed(2),
    failedRequests,
    failurePercentage: ((failedRequests / totalRequests) * 100).toFixed(2),
    avgDuration: avgDuration.toFixed(2),
    medianDuration: medianDuration.toFixed(2),
    minDuration,
    maxDuration,
    endpointMetrics,
    recentRequests: requestLogs.slice(-10),
  };
}

/**
 * Clears all stored request logs
 */
export function clearRequestLogs(): void {
  requestLogs.length = 0;
}

/**
 * Gets all stored request logs
 */
export function getRequestLogs(): APIRequestLog[] {
  return [...requestLogs];
}
