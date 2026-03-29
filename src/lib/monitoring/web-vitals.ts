/**
 * Core Web Vitals Monitoring
 * Tracks LCP (Largest Contentful Paint), FID (First Input Delay), and CLS (Cumulative Layout Shift)
 * Sends metrics to monitoring service and logs to console in development
 */

export interface WebVitalsMetric {
  name: 'LCP' | 'INP' | 'CLS';
  value: number;
  timestamp: number;
  rating: 'good' | 'needs-improvement' | 'poor';
}

export interface WebVitalsData {
  lcp?: WebVitalsMetric;
  inp?: WebVitalsMetric;
  cls?: WebVitalsMetric;
  timestamp: string;
  url: string;
  userAgent?: string;
}

/**
 * Determines the rating for a metric based on Web Vitals thresholds
 */
function getRating(
  metricName: 'LCP' | 'INP' | 'CLS',
  value: number
): 'good' | 'needs-improvement' | 'poor' {
  switch (metricName) {
    case 'LCP':
      // LCP: Good < 2.5s, Needs Improvement < 4s, Poor >= 4s
      if (value < 2500) return 'good';
      if (value < 4000) return 'needs-improvement';
      return 'poor';
    case 'INP':
      // INP: Good < 100ms, Needs Improvement < 300ms, Poor >= 300ms
      if (value < 100) return 'good';
      if (value < 300) return 'needs-improvement';
      return 'poor';
    case 'CLS':
      // CLS: Good < 0.1, Needs Improvement < 0.25, Poor >= 0.25
      if (value < 0.1) return 'good';
      if (value < 0.25) return 'needs-improvement';
      return 'poor';
  }
}

/**
 * Sends Web Vitals metrics to monitoring service
 */
async function sendMetricsToMonitoring(data: WebVitalsData): Promise<void> {
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
        type: 'web-vitals',
        ...data,
      }),
    }).catch(() => {
      // Silently fail if monitoring service is unavailable
    });
  } catch {
    // Silently fail monitoring service calls
  }
}

/**
 * Logs Web Vitals metrics to console in development mode
 */
function logMetricsToConsole(data: WebVitalsData): void {
  if (process.env.NODE_ENV === 'development') {
    console.group('[Web Vitals]');
    if (data.lcp && typeof data.lcp.value === 'number') {
      console.log(
        `LCP: ${data.lcp.value.toFixed(2)}ms (${data.lcp.rating})`
      );
    }
    if (data.inp && typeof data.inp.value === 'number') {
      console.log(
        `INP: ${data.inp.value.toFixed(2)}ms (${data.inp.rating})`
      );
    }
    if (data.cls && typeof data.cls.value === 'number') {
      console.log(
        `CLS: ${data.cls.value.toFixed(4)} (${data.cls.rating})`
      );
    }
    console.groupEnd();
  }
}

/**
 * Initializes Web Vitals tracking
 * Must be called on page load to start monitoring
 */
export function initializeWebVitalsTracking(): void {
  if (typeof window === 'undefined') {
    return;
  }

  const metrics: Partial<WebVitalsData> = {
    timestamp: new Date().toISOString(),
    url: window.location.href,
    userAgent: navigator.userAgent,
  };

  // Track LCP (Largest Contentful Paint)
  if ('PerformanceObserver' in window) {
    try {
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1] as any;
        const lcpValue = lastEntry.renderTime || lastEntry.loadTime;

        const lcpMetric: WebVitalsMetric = {
          name: 'LCP',
          value: lcpValue,
          timestamp: Date.now(),
          rating: getRating('LCP', lcpValue),
        };

        metrics.lcp = lcpMetric;
      });

      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
    } catch (e) {
      // LCP not supported
    }

    // Track INP (First Input Delay)
    try {
      const inpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          const fidValue = (entry as any).processingDuration;

          const inpMetric: WebVitalsMetric = {
            name: 'INP',
            value: fidValue,
            timestamp: Date.now(),
            rating: getRating('INP', fidValue),
          };

          metrics.inp = inpMetric;
        });
      });

      inpObserver.observe({ entryTypes: ['first-input'] });
    } catch (e) {
      // INP not supported
    }

    // Track CLS (Cumulative Layout Shift)
    try {
      let clsValue = 0;
      const clsObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (!(entry as any).hadRecentInput) {
            clsValue += (entry as any).value;

            const clsMetric: WebVitalsMetric = {
              name: 'CLS',
              value: clsValue,
              timestamp: Date.now(),
              rating: getRating('CLS', clsValue),
            };

            metrics.cls = clsMetric;
          }
        });
      });

      clsObserver.observe({ entryTypes: ['layout-shift'] });
    } catch (e) {
      // CLS not supported
    }

    // Send metrics when page is about to unload
    window.addEventListener('beforeunload', () => {
      if (metrics.lcp || metrics.inp || metrics.cls) {
        const data = metrics as WebVitalsData;
        logMetricsToConsole(data);
        sendMetricsToMonitoring(data);
      }
    });

    // Also send metrics after a delay to capture metrics even if user doesn't navigate away
    setTimeout(() => {
      if (metrics.lcp || metrics.inp || metrics.cls) {
        const data = metrics as WebVitalsData;
        logMetricsToConsole(data);
        sendMetricsToMonitoring(data);
      }
    }, 5000);
  }
}

/**
 * Gets current Web Vitals metrics
 * Useful for displaying metrics in a performance dashboard
 * Uses PerformanceObserver with buffered: true to avoid deprecated API warnings
 */
export function getWebVitalsMetrics(): WebVitalsData | null {
  if (typeof window === 'undefined') {
    return null;
  }

  const metrics: Partial<WebVitalsData> = {
    timestamp: new Date().toISOString(),
    url: window.location.href,
    userAgent: navigator.userAgent,
  };

  if ('PerformanceObserver' in window) {
    try {
      // Get LCP using PerformanceObserver
      try {
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          if (entries.length > 0) {
            const lastEntry = entries[entries.length - 1] as any;
            const lcpValue = lastEntry.renderTime || lastEntry.loadTime;
            metrics.lcp = {
              name: 'LCP',
              value: lcpValue,
              timestamp: Date.now(),
              rating: getRating('LCP', lcpValue),
            };
          }
        });
        lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
      } catch (e) {
        // LCP not supported
      }

      // Get FID using PerformanceObserver
      try {
        const inpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          if (entries.length > 0) {
            const fidValue = (entries[0] as any).processingDuration;
            metrics.inp = {
              name: 'INP',
              value: fidValue,
              timestamp: Date.now(),
              rating: getRating('INP', fidValue),
            };
          }
        });
        inpObserver.observe({ type: 'first-input', buffered: true });
      } catch (e) {
        // INP not supported
      }

      // Get CLS using PerformanceObserver
      try {
        let clsValue = 0;
        const clsObserver = new PerformanceObserver((list) => {
          list.getEntries().forEach((entry) => {
            if (!(entry as any).hadRecentInput) {
              clsValue += (entry as any).value;
            }
          });
          if (clsValue > 0) {
            metrics.cls = {
              name: 'CLS',
              value: clsValue,
              timestamp: Date.now(),
              rating: getRating('CLS', clsValue),
            };
          }
        });
        clsObserver.observe({ type: 'layout-shift', buffered: true });
      } catch (e) {
        // CLS not supported
      }
    } catch (e) {
      // Performance API not available
    }
  }

  return metrics as WebVitalsData;
}
