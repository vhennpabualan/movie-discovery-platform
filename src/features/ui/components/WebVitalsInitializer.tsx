'use client';

/**
 * Web Vitals Initializer Component
 * Initializes Web Vitals tracking on page load
 * This is a client component that runs on mount
 */

import { useEffect } from 'react';
import { initializeWebVitalsTracking } from '@/lib/monitoring/web-vitals';

export function WebVitalsInitializer() {
  useEffect(() => {
    // Initialize Web Vitals tracking
    initializeWebVitalsTracking();
  }, []);

  return null;
}
