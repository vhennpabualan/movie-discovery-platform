'use client';

/**
 * Performance Dashboard Component
 * Displays Web Vitals metrics and API performance metrics
 * Client-side component that updates in real-time
 */

import { useEffect, useState } from 'react';
import { getWebVitalsMetrics, WebVitalsData } from '@/lib/monitoring/web-vitals';
import { getAggregatedMetrics } from '@/lib/monitoring/api-logger';

interface AggregatedMetrics {
  totalRequests: number;
  slowRequests: number;
  slowRequestPercentage: string;
  failedRequests: number;
  failurePercentage: string;
  avgDuration: string;
  medianDuration: string;
  minDuration: number;
  maxDuration: number;
  endpointMetrics: Record<
    string,
    {
      count: number;
      avgDuration: number;
      slowCount: number;
      failureCount: number;
    }
  >;
  recentRequests: Array<{
    timestamp: string;
    endpoint: string;
    method: string;
    statusCode: number;
    duration: number;
    isSlow: boolean;
  }>;
}

export function PerformanceDashboard() {
  const [webVitals, setWebVitals] = useState<WebVitalsData | null>(null);
  const [apiMetrics, setApiMetrics] = useState<AggregatedMetrics | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Update metrics every 2 seconds
    const interval = setInterval(() => {
      const vitals = getWebVitalsMetrics();
      const metrics = getAggregatedMetrics();
      setWebVitals(vitals);
      setApiMetrics(metrics);
    }, 2000);

    // Initial update
    const vitals = getWebVitalsMetrics();
    const metrics = getAggregatedMetrics();
    setWebVitals(vitals);
    setApiMetrics(metrics);

    return () => clearInterval(interval);
  }, []);

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-netflix-red hover:bg-red-700 text-white rounded-full w-12 h-12 flex items-center justify-center shadow-lg transition-colors"
        aria-label="Toggle performance dashboard"
        title="Performance Dashboard"
      >
        <span className="text-lg font-bold">⚡</span>
      </button>

      {/* Dashboard Panel */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 bg-netflix-dark-secondary border border-netflix-gray/30 rounded-lg shadow-xl p-4 w-96 max-h-96 overflow-y-auto">
          <div className="space-y-4">
            {/* Web Vitals Section */}
            <div>
              <h3 className="text-netflix-red font-bold text-sm mb-2">
                Web Vitals
              </h3>
              <div className="space-y-1 text-xs text-netflix-gray">
                {webVitals?.lcp && (
                  <div className="flex justify-between">
                    <span>LCP:</span>
                    <span
                      className={
                        webVitals.lcp.rating === 'good'
                          ? 'text-green-400'
                          : webVitals.lcp.rating === 'needs-improvement'
                            ? 'text-yellow-400'
                            : 'text-red-400'
                      }
                    >
                      {webVitals.lcp.value != null ? webVitals.lcp.value.toFixed(0) : '—'}ms ({webVitals.lcp.rating})
                    </span>
                  </div>
                )}
                {webVitals?.fid && (
                  <div className="flex justify-between">
                    <span>FID:</span>
                    <span
                      className={
                        webVitals.fid.rating === 'good'
                          ? 'text-green-400'
                          : webVitals.fid.rating === 'needs-improvement'
                            ? 'text-yellow-400'
                            : 'text-red-400'
                      }
                    >
                      {webVitals.fid.value != null ? webVitals.fid.value.toFixed(0) : '—'}ms ({webVitals.fid.rating})
                    </span>
                  </div>
                )}
                {webVitals?.cls && (
                  <div className="flex justify-between">
                    <span>CLS:</span>
                    <span
                      className={
                        webVitals.cls.rating === 'good'
                          ? 'text-green-400'
                          : webVitals.cls.rating === 'needs-improvement'
                            ? 'text-yellow-400'
                            : 'text-red-400'
                      }
                    >
                      {webVitals.cls.value != null ? webVitals.cls.value.toFixed(4) : '—'} ({webVitals.cls.rating})
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* API Metrics Section */}
            {apiMetrics && (
              <div>
                <h3 className="text-netflix-red font-bold text-sm mb-2">
                  API Performance
                </h3>
                <div className="space-y-1 text-xs text-netflix-gray">
                  <div className="flex justify-between">
                    <span>Total Requests:</span>
                    <span>{apiMetrics.totalRequests}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Slow Requests:</span>
                    <span className="text-yellow-400">
                      {apiMetrics.slowRequests} ({apiMetrics.slowRequestPercentage}%)
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Failed Requests:</span>
                    <span className="text-red-400">
                      {apiMetrics.failedRequests} ({apiMetrics.failurePercentage}%)
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Avg Duration:</span>
                    <span>{apiMetrics.avgDuration}ms</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Median Duration:</span>
                    <span>{apiMetrics.medianDuration}ms</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Min/Max:</span>
                    <span>
                      {apiMetrics.minDuration}ms / {apiMetrics.maxDuration}ms
                    </span>
                  </div>
                </div>

                {/* Recent Requests */}
                {apiMetrics.recentRequests.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-netflix-gray/20">
                    <h4 className="text-netflix-red font-bold text-xs mb-2">
                      Recent Requests
                    </h4>
                    <div className="space-y-1 text-xs text-netflix-gray max-h-32 overflow-y-auto">
                      {apiMetrics.recentRequests.map((req, idx) => (
                        <div
                          key={idx}
                          className={`flex justify-between ${
                            req.isSlow ? 'text-yellow-400' : ''
                          } ${req.statusCode >= 400 ? 'text-red-400' : ''}`}
                        >
                          <span className="truncate flex-1">
                            {req.method} {req.endpoint}
                          </span>
                          <span className="ml-2 shrink-0">
                            {req.duration}ms
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
