'use client';

interface LoadingSkeletonProps {
  /**
   * Number of skeleton cards to display
   * @default 4
   */
  itemCount?: number;
  /**
   * Width of each skeleton card (Tailwind class)
   * @default "w-full"
   */
  width?: string;
  /**
   * Height of each skeleton card (Tailwind class)
   * @default "aspect-2/3"
   */
  height?: string;
}

/**
 * LoadingSkeleton component displays placeholder cards while content is loading.
 * Matches the dimensions of actual components to prevent layout shift.
 * Uses CSS animations to indicate loading state.
 *
 * @example
 * // Display 4 skeleton cards matching MovieCard dimensions
 * <LoadingSkeleton itemCount={4} />
 *
 * @example
 * // Display 8 skeleton cards with custom dimensions
 * <LoadingSkeleton itemCount={8} width="w-full" height="aspect-2/3" />
 */
export function LoadingSkeleton({
  itemCount = 4,
  width = 'w-full',
  height = 'aspect-2/3',
}: LoadingSkeletonProps) {
  return (
    <div className="relative w-full">
      {/* Scroll Container - matches MovieCarousel layout */}
      <div
        className="flex gap-2 sm:gap-4 overflow-x-auto pb-4 px-2 sm:px-4 md:px-6 lg:px-8 scrollbar-hide"
        style={{
          scrollBehavior: 'smooth',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        {/* Grid Layout: 2 col mobile, 3 col tablet, 5 col desktop */}
        <div className="flex gap-2 sm:gap-4 min-w-full md:min-w-auto">
          {Array.from({ length: itemCount }).map((_, index) => (
            <div
              key={index}
              className="shrink-0 w-[45%] sm:w-[32%] md:w-[30%] lg:w-[18%]"
            >
              {/* Skeleton Card */}
              <div
                className={`${width} ${height} rounded-lg overflow-hidden bg-gray-800 relative`}
              >
                {/* Shimmer Animation */}
                <div
                  className="absolute inset-0 bg-linear-to-r from-gray-800 via-gray-700 to-gray-800 animate-pulse"
                  style={{
                    backgroundSize: '200% 100%',
                    animation: 'shimmer 2s infinite',
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CSS Animation for shimmer effect */}
      <style jsx>{`
        @keyframes shimmer {
          0% {
            background-position: 200% 0;
          }
          100% {
            background-position: -200% 0;
          }
        }
      `}</style>
    </div>
  );
}
