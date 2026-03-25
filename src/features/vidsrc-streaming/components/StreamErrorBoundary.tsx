'use client';

import { ReactNode } from 'react';
import type { StreamingError } from '../types/index';

interface StreamErrorBoundaryProps {
  children: ReactNode;
  /** Current error state, if any */
  error: StreamingError | null;
  /** Callback to retry the operation */
  onRetry: () => void;
}

/**
 * StreamErrorBoundary Component
 *
 * Handles error display and recovery for streaming player.
 * Shows user-friendly error messages and provides retry functionality.
 *
 * Features:
 * - Error type-specific messaging
 * - Retry button for recovery
 * - Accessibility features
 * - Responsive error display
 *
 * @example
 * // Wrap streaming player
 * <StreamErrorBoundary
 *   error={playerError}
 *   onRetry={handleRetry}
 * >
 *   <VidsrcStreamingPlayer {...props} />
 * </StreamErrorBoundary>
 */
export function StreamErrorBoundary({
  children,
  error,
  onRetry,
}: StreamErrorBoundaryProps) {
  if (error) {
    return (
      <div className="w-full bg-gray-900 rounded-lg p-6 text-center">
        {/* Error Icon */}
        <div className="mb-4 flex justify-center">
          <div className="w-12 h-12 bg-netflix-red/20 rounded-full flex items-center justify-center">
            <svg
              className="w-6 h-6 text-netflix-red"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
        </div>

        {/* Error Message */}
        <p className="text-gray-300 mb-6">{error.message}</p>

        {/* Retry Button */}
        <button
          onClick={onRetry}
          className="bg-netflix-red hover:bg-netflix-red/90 text-white font-semibold py-2 px-6 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-netflix-red focus:ring-offset-2 focus:ring-offset-black"
          aria-label="Retry loading streaming player"
        >
          Try Again
        </button>
      </div>
    );
  }

  return <>{children}</>;
}
