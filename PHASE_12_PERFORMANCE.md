# Phase 12: Performance & Monitoring

This document outlines the performance monitoring and optimization implementation for the Movie Discovery Platform.

## Overview

Phase 12 implements three key areas:
1. **Core Web Vitals Tracking** - Monitor LCP, FID, and CLS metrics
2. **API Performance Monitoring** - Track API response times and flag slow requests
3. **Performance Optimization** - Implement code splitting, lazy loading, and bundle optimization

## 12.1 Core Web Vitals Tracking

### Implementation

The Web Vitals tracking system is implemented in `lib/monitoring/web-vitals.ts` and provides:

- **LCP (Largest Contentful Paint)**: Tracks when the largest content element is painted
  - Good: < 2.5s
  - Needs Improvement: 2.5s - 4s
  - Poor: > 4s

- **FID (First Input Delay)**: Tracks the delay between user input and browser response
  - Good: < 100ms
  - Needs Improvement: 100ms - 300ms
  - Poor: > 300ms

- **CLS (Cumulative Layout Shift)**: Tracks unexpected layout shifts
  - Good: < 0.1
  - Needs Improvement: 0.1 - 0.25
  - Poor: > 0.25

### Usage

Web Vitals tracking is automatically initialized on page load via the `WebVitalsInitializer` component in the root layout.

Metrics are:
- Logged to console in development mode
- Sent to the monitoring service (if configured via `NEXT_PUBLIC_MONITORING_ENDPOINT`)
- Captured when the page unloads or after 5 seconds

### Accessing Metrics

```typescript
import { getWebVitalsMetrics } from '@/lib/monitoring/web-vitals';

const metrics = getWebVitalsMetrics();
console.log(metrics.lcp?.value); // LCP value in milliseconds
```

## 12.2 API Performance Monitoring

### Implementation

API performance monitoring is implemented in `lib/monitoring/api-logger.ts` and provides:

- **Request Logging**: Logs all API requests with method, endpoint, status code, and duration
- **Slow Request Detection**: Flags requests taking longer than 2 seconds
- **Aggregated Metrics**: Provides statistics on API performance
- **Endpoint Metrics**: Tracks performance per endpoint

### Features

- Automatic logging of all API requests via `logAPIRequest()`
- Slow request alerts sent to monitoring service
- In-memory storage of last 1000 requests
- Aggregated metrics including:
  - Total requests
  - Slow request count and percentage
  - Failed request count and percentage
  - Average, median, min, and max duration
  - Per-endpoint metrics

### Usage

```typescript
import { getAggregatedMetrics, getRequestLogs } from '@/lib/monitoring/api-logger';

// Get aggregated metrics
const metrics = getAggregatedMetrics();
console.log(metrics.avgDuration); // Average API response time

// Get all request logs
const logs = getRequestLogs();
```

## 12.3 Performance Optimization

### Code Splitting

The application uses Next.js built-in code splitting:

- **Route-based splitting**: Each route is automatically split into a separate bundle
- **Dynamic imports**: Heavy components can be dynamically imported using `next/dynamic`

Example:
```typescript
import dynamic from 'next/dynamic';

const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <LoadingSkeleton />,
});
```

### Lazy Loading

Below-the-fold content is lazy loaded using the `useLazyLoad` hook:

```typescript
import { useLazyLoad } from '@/lib/hooks/useLazyLoad';

export function MyComponent() {
  const { ref, isVisible } = useLazyLoad();

  return (
    <div ref={ref}>
      {isVisible && <ExpensiveComponent />}
    </div>
  );
}
```

### Bundle Optimization

The following optimizations are configured in `next.config.ts`:

- **React Compiler**: Enabled for automatic optimization
- **SWC Minification**: Smaller bundle size
- **Tree-shaking**: Unused code is removed
- **Package Import Optimization**: Optimizes imports from common packages

### Image Optimization

Images are optimized using Next.js Image component:

- **Automatic format selection**: Serves WebP to supported browsers
- **Responsive sizing**: Serves appropriately sized images for each device
- **Lazy loading**: Images below the fold are lazy loaded by default
- **Priority loading**: Above-the-fold images use `priority={true}`

## Performance Dashboard

A development-only performance dashboard is available in the bottom-right corner when running in development mode.

The dashboard displays:
- **Web Vitals**: Current LCP, FID, and CLS metrics with ratings
- **API Performance**: Request counts, slow request percentage, failure rate, and duration statistics
- **Recent Requests**: Last 10 API requests with duration and status

Click the ⚡ button to toggle the dashboard.

## Testing Performance

### Using Lighthouse

1. Open Chrome DevTools (F12)
2. Go to the Lighthouse tab
3. Click "Analyze page load"
4. Review the performance score and recommendations

### Using Web Vitals

1. Open the browser console
2. Look for `[Web Vitals]` logs showing LCP, FID, and CLS metrics
3. Check the performance dashboard in the bottom-right corner

### Using API Metrics

1. Open the browser console
2. Look for `[API]` logs showing API request details
3. Check the performance dashboard for aggregated metrics

## Monitoring Service Integration

To integrate with a monitoring service (e.g., Sentry, DataDog):

1. Set the `NEXT_PUBLIC_MONITORING_ENDPOINT` environment variable
2. The application will automatically send:
   - Web Vitals metrics
   - Slow API request alerts
   - Error logs

Example:
```bash
NEXT_PUBLIC_MONITORING_ENDPOINT=https://monitoring.example.com/api/metrics
```

## Performance Best Practices

1. **Use Server Components**: Fetch data on the server when possible
2. **Lazy Load Below-the-Fold Content**: Use `useLazyLoad` hook
3. **Optimize Images**: Use Next.js Image component with appropriate sizing
4. **Code Split Heavy Components**: Use `next/dynamic` for large components
5. **Monitor Performance**: Check the performance dashboard regularly
6. **Profile Bundle Size**: Use `npm run build` and check `.next/static` directory

## Files Created

- `lib/monitoring/web-vitals.ts` - Web Vitals tracking
- `lib/monitoring/api-logger.ts` - API performance logging
- `lib/performance/dynamic-imports.ts` - Dynamic import utilities
- `lib/hooks/useLazyLoad.ts` - Lazy loading hook
- `features/ui/components/PerformanceDashboard.tsx` - Performance dashboard component
- `features/ui/components/WebVitalsInitializer.tsx` - Web Vitals initialization component

## Configuration Changes

- `next.config.ts` - Added performance optimizations
- `src/app/layout.tsx` - Added Web Vitals initializer and performance dashboard
- `src/lib/api/tmdb-client.ts` - Integrated API performance logging
