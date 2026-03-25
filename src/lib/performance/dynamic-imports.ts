/**
 * Dynamic Imports Utility
 * Provides helpers for code splitting and lazy loading components
 */

import React, { ComponentType, ReactNode } from 'react';
import dynamic from 'next/dynamic';

/**
 * Creates a dynamically imported component with a loading fallback
 * Useful for route-based code splitting
 */
export function createDynamicComponent<P extends object>(
  importFn: () => Promise<{ default: ComponentType<P> }>,
  options?: {
    loading?: () => ReactNode;
    ssr?: boolean;
  }
): ComponentType<P> {
  return dynamic(importFn, {
    loading: options?.loading || (() => React.createElement('div', null, 'Loading...')),
    ssr: options?.ssr !== false,
  });
}

/**
 * Lazy loads a component when it becomes visible in the viewport
 * Uses Intersection Observer API
 */
export function useLazyLoad(
  ref: React.RefObject<HTMLElement>,
  callback: () => void,
  options?: IntersectionObserverInit
): void {
  if (typeof window === 'undefined') {
    return;
  }

  const observer = new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting) {
      callback();
      observer.unobserve(entry.target);
    }
  }, options);

  if (ref.current) {
    observer.observe(ref.current);
  }
}

/**
 * Preloads an image for lazy loading
 */
export function preloadImage(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = src;
  });
}

/**
 * Prefetches a route for faster navigation
 */
export function prefetchRoute(href: string): void {
  if (typeof window === 'undefined') {
    return;
  }

  const link = document.createElement('link');
  link.rel = 'prefetch';
  link.href = href;
  document.head.appendChild(link);
}
