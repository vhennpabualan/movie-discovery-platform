import { Suspense } from 'react';
import { RelatedMovies } from './RelatedMovies';
import { LoadingSkeleton } from '@/features/ui/components/LoadingSkeleton';

interface RelatedMoviesSuspenseProps {
  movieId: number;
}

/**
 * RelatedMoviesSuspense Component
 *
 * Wraps the RelatedMovies server component in a Suspense boundary with a LoadingSkeleton fallback.
 * This component handles the loading state while related movies data is being fetched.
 *
 * Features:
 * - Suspense boundary for streaming server components
 * - LoadingSkeleton fallback matching carousel layout (1-2-4 columns)
 * - Prevents layout shift by matching skeleton dimensions to actual content
 * - Smooth transition from skeleton to loaded content
 *
 * @example
 * // Usage in a movie details page
 * <RelatedMoviesSuspense movieId={123} />
 */
export function RelatedMoviesSuspense({ movieId }: RelatedMoviesSuspenseProps) {
  return (
    <Suspense fallback={<LoadingSkeleton itemCount={4} />}>
      <RelatedMovies movieId={movieId} />
    </Suspense>
  );
}
