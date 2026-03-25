/**
 * useLazyLoad Hook
 * Lazy loads content when it becomes visible in the viewport
 * Useful for below-the-fold content and performance optimization
 */

import { useEffect, useRef, useState } from 'react';

interface UseLazyLoadOptions extends IntersectionObserverInit {
  onVisible?: () => void;
}

/**
 * Hook to lazy load content when it becomes visible
 * Returns a ref to attach to the element and a boolean indicating if it's visible
 */
export function useLazyLoad(options?: UseLazyLoadOptions) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !ref.current) {
      return;
    }

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsVisible(true);
        options?.onVisible?.();
        observer.unobserve(entry.target);
      }
    }, {
      threshold: 0.1,
      ...options,
    });

    observer.observe(ref.current);

    return () => {
      observer.disconnect();
    };
  }, [options]);

  return { ref, isVisible };
}
