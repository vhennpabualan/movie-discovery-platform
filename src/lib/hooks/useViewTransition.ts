'use client';

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Hook to enable View Transitions API for smooth page navigation
 * Falls back to standard navigation for browsers without support
 * Includes error handling to ensure navigation always completes
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

      try {
        // Use View Transitions API for smooth transition
        const transition = (document as any).startViewTransition(() => {
          router.push(href);
        });

        // Handle transition errors gracefully
        if (transition && transition.ready) {
          transition.ready.catch((error: Error) => {
            console.warn('[ViewTransition] Transition failed, using fallback:', error);
            router.push(href);
          });
        }
      } catch (error) {
        // If startViewTransition throws, fall back to standard navigation
        console.warn('[ViewTransition] API error, using fallback:', error);
        router.push(href);
      }
    },
    [router]
  );

  return { navigateWithTransition };
}
