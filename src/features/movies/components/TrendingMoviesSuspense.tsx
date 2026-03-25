import { Suspense } from 'react';
import { TrendingMovies } from './TrendingMovies';
import { LoadingSkeleton } from '@/features/ui/components/LoadingSkeleton';

/**
 * TrendingMoviesSuspense Component
 *
 * Wraps the TrendingMovies server component in a Suspense boundary with a LoadingSkeleton fallback.
 * This component handles the loading state while trending movies data is being fetched.
 *
 * Features:
 * - Suspense boundary for streaming server components
 * - LoadingSkeleton fallback matching carousel layout (1-2-4 columns)
 * - Prevents layout shift by matching skeleton dimensions to actual content
 * - Smooth transition from skeleton to loaded content
 *
 * @example
 * // Usage in a page or layout
 * <TrendingMoviesSuspense />
 */
export function TrendingMoviesSuspense() {
  return (
    <Suspense fallback={<LoadingSkeleton itemCount={4} />}>
      <TrendingMovies />
    </Suspense>
  );
}
