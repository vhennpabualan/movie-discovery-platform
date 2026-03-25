'use client';

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Hook to enable View Transitions API for smooth page navigation
 * Falls back to standard navigation for browsers without support
 */
export function useViewTransition() {
  const router = useRouter();

  const navigateWithTransition = useCallback(
    (href: string) => {
      // Check if View Transitions API is supported
      if (!('startViewTransition' in document)) {
        // Fallback for browsers without View Transitions support
        router.push(href);
        return;
      }

      // Use View Transitions API for smooth transition
      (document as any).startViewTransition(() => {
        router.push(href);
      });
    },
    [router]
  );

  return { navigateWithTransition };
}
