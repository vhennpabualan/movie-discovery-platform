'use client';

import { ReactNode, Component, ErrorInfo } from 'react';
import { logErrorToMonitoring } from '@/lib/monitoring/error-logger';

interface ErrorBoundaryProps {
  children: ReactNode;
  /**
   * Optional fallback component to display instead of default error UI
   */
  fallback?: (error: Error, retry: () => void) => ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * ErrorBoundary component catches errors from child components and displays
 * a user-friendly error message with a retry button.
 *
 * Logs errors to the monitoring service for debugging and alerting.
 *
 * @example
 * // Wrap components to catch errors
 * <ErrorBoundary>
 *   <MovieCarousel movies={movies} />
 * </ErrorBoundary>
 *
 * @example
 * // Use custom fallback UI
 * <ErrorBoundary
 *   fallback={(error, retry) => (
 *     <div>
 *       <p>Custom error: {error.message}</p>
 *       <button onClick={retry}>Try again</button>
 *     </div>
 *   )}
 * >
 *   <MovieCarousel movies={movies} />
 * </ErrorBoundary>
 */
export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log error to monitoring service
    logErrorToMonitoring(error, {
      endpoint: 'ErrorBoundary',
    });

    // Log error details to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('ErrorBoundary caught an error:', error);
      console.error('Error Info:', errorInfo);
    }
  }

  handleRetry = (): void => {
    this.setState({
      hasError: false,
      error: null,
    });
  };

  render(): ReactNode {
    if (this.state.hasError && this.state.error) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.handleRetry);
      }

      // Default error UI
      return (
        <div className="flex items-center justify-center min-h-screen bg-black">
          <div className="max-w-md w-full mx-auto px-4 py-8 text-center">
            {/* Error Icon */}
            <div className="mb-6 flex justify-center">
              <div className="w-16 h-16 bg-netflix-red/20 rounded-full flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-netflix-red"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
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
            <h2 className="text-2xl font-bold text-white mb-2">
              Oops! Something went wrong
            </h2>
            <p className="text-gray-400 mb-6">
              We encountered an unexpected error. Please try again or contact
              support if the problem persists.
            </p>

            {/* Error Details (Development Only) */}
            {process.env.NODE_ENV === 'development' && (
              <div className="mb-6 p-4 bg-gray-900 rounded-lg text-left">
                <p className="text-xs text-gray-500 font-mono wrap-break-word">
                  {this.state.error.message}
                </p>
              </div>
            )}

            {/* Retry Button */}
            <button
              onClick={this.handleRetry}
              className="w-full bg-netflix-red hover:bg-netflix-red/90 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-netflix-red focus:ring-offset-2 focus:ring-offset-black"
              aria-label="Retry loading content"
            >
              Try Again
            </button>

            {/* Support Link */}
            <p className="text-gray-500 text-sm mt-6">
              Need help?{' '}
              <a
                href="mailto:support@example.com"
                className="text-netflix-red hover:underline"
              >
                Contact support
              </a>
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
