import { render, screen, fireEvent } from '@testing-library/react';
import { StreamErrorBoundary } from './StreamErrorBoundary';
import type { StreamingError } from '../types/index';

describe('StreamErrorBoundary', () => {
  describe('Rendering', () => {
    it('renders children when no error', () => {
      render(
        <StreamErrorBoundary error={null} onRetry={jest.fn()}>
          <div>Test Content</div>
        </StreamErrorBoundary>
      );

      expect(screen.getByText('Test Content')).toBeInTheDocument();
    });

    it('renders error UI when error is present', () => {
      const error: StreamingError = {
        type: 'ALL_DOMAINS_FAILED',
        message: 'Stream not available - please try again later',
        timestamp: Date.now(),
        tmdbId: 550,
      };

      render(
        <StreamErrorBoundary error={error} onRetry={jest.fn()}>
          <div>Test Content</div>
        </StreamErrorBoundary>
      );

      expect(screen.getByText('Stream not available - please try again later')).toBeInTheDocument();
      expect(screen.queryByText('Test Content')).not.toBeInTheDocument();
    });
  });

  describe('Error Display', () => {
    it('displays error message', () => {
      const error: StreamingError = {
        type: 'INVALID_TMDB_ID',
        message: 'Invalid movie ID - streaming unavailable',
        timestamp: Date.now(),
        tmdbId: 550,
      };

      render(
        <StreamErrorBoundary error={error} onRetry={jest.fn()}>
          <div>Test Content</div>
        </StreamErrorBoundary>
      );

      expect(screen.getByText('Invalid movie ID - streaming unavailable')).toBeInTheDocument();
    });

    it('displays error icon', () => {
      const error: StreamingError = {
        type: 'NETWORK_TIMEOUT',
        message: 'Connection timeout - please check your internet connection',
        timestamp: Date.now(),
        tmdbId: 550,
      };

      const { container } = render(
        <StreamErrorBoundary error={error} onRetry={jest.fn()}>
          <div>Test Content</div>
        </StreamErrorBoundary>
      );

      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
      expect(svg).toHaveAttribute('aria-hidden', 'true');
    });

    it('displays error container with proper styling', () => {
      const error: StreamingError = {
        type: 'IFRAME_LOAD_FAILED',
        message: 'Unable to load streaming player',
        timestamp: Date.now(),
        tmdbId: 550,
      };

      const { container } = render(
        <StreamErrorBoundary error={error} onRetry={jest.fn()}>
          <div>Test Content</div>
        </StreamErrorBoundary>
      );

      const errorContainer = container.querySelector('.bg-gray-900');
      expect(errorContainer).toHaveClass('w-full', 'rounded-lg', 'p-6', 'text-center');
    });
  });

  describe('Retry Button', () => {
    it('displays Try Again button', () => {
      const error: StreamingError = {
        type: 'ALL_DOMAINS_FAILED',
        message: 'Stream not available - please try again later',
        timestamp: Date.now(),
        tmdbId: 550,
      };

      render(
        <StreamErrorBoundary error={error} onRetry={jest.fn()}>
          <div>Test Content</div>
        </StreamErrorBoundary>
      );

      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });

    it('calls onRetry when Try Again button is clicked', () => {
      const mockOnRetry = jest.fn();
      const error: StreamingError = {
        type: 'ALL_DOMAINS_FAILED',
        message: 'Stream not available - please try again later',
        timestamp: Date.now(),
        tmdbId: 550,
      };

      render(
        <StreamErrorBoundary error={error} onRetry={mockOnRetry}>
          <div>Test Content</div>
        </StreamErrorBoundary>
      );

      const button = screen.getByRole('button');
      fireEvent.click(button);

      expect(mockOnRetry).toHaveBeenCalled();
    });

    it('has proper button styling', () => {
      const error: StreamingError = {
        type: 'ALL_DOMAINS_FAILED',
        message: 'Stream not available - please try again later',
        timestamp: Date.now(),
        tmdbId: 550,
      };

      render(
        <StreamErrorBoundary error={error} onRetry={jest.fn()}>
          <div>Test Content</div>
        </StreamErrorBoundary>
      );

      const button = screen.getByRole('button');
      expect(button).toHaveClass(
        'bg-netflix-red',
        'hover:bg-netflix-red/90',
        'text-white',
        'font-semibold'
      );
    });

    it('has focus indicators on button', () => {
      const error: StreamingError = {
        type: 'ALL_DOMAINS_FAILED',
        message: 'Stream not available - please try again later',
        timestamp: Date.now(),
        tmdbId: 550,
      };

      render(
        <StreamErrorBoundary error={error} onRetry={jest.fn()}>
          <div>Test Content</div>
        </StreamErrorBoundary>
      );

      const button = screen.getByRole('button');
      expect(button).toHaveClass('focus:outline-none', 'focus:ring-2');
    });
  });

  describe('Accessibility', () => {
    it('has ARIA label on retry button', () => {
      const error: StreamingError = {
        type: 'ALL_DOMAINS_FAILED',
        message: 'Stream not available - please try again later',
        timestamp: Date.now(),
        tmdbId: 550,
      };

      render(
        <StreamErrorBoundary error={error} onRetry={jest.fn()}>
          <div>Test Content</div>
        </StreamErrorBoundary>
      );

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute(
        'aria-label',
        'Retry loading streaming player'
      );
    });

    it('has aria-hidden on error icon', () => {
      const error: StreamingError = {
        type: 'ALL_DOMAINS_FAILED',
        message: 'Stream not available - please try again later',
        timestamp: Date.now(),
        tmdbId: 550,
      };

      const { container } = render(
        <StreamErrorBoundary error={error} onRetry={jest.fn()}>
          <div>Test Content</div>
        </StreamErrorBoundary>
      );

      const svg = container.querySelector('svg');
      expect(svg).toHaveAttribute('aria-hidden', 'true');
    });

    it('button is keyboard accessible', () => {
      const mockOnRetry = jest.fn();
      const error: StreamingError = {
        type: 'ALL_DOMAINS_FAILED',
        message: 'Stream not available - please try again later',
        timestamp: Date.now(),
        tmdbId: 550,
      };

      render(
        <StreamErrorBoundary error={error} onRetry={mockOnRetry}>
          <div>Test Content</div>
        </StreamErrorBoundary>
      );

      const button = screen.getByRole('button');
      button.focus();
      expect(button).toHaveFocus();

      fireEvent.keyDown(button, { key: 'Enter', code: 'Enter' });
      fireEvent.click(button);

      expect(mockOnRetry).toHaveBeenCalled();
    });
  });

  describe('Error Types', () => {
    const errorTypes = [
      {
        type: 'INVALID_TMDB_ID' as const,
        message: 'Invalid movie ID - streaming unavailable',
      },
      {
        type: 'ALL_DOMAINS_FAILED' as const,
        message: 'Stream not available - please try again later',
      },
      {
        type: 'NETWORK_TIMEOUT' as const,
        message: 'Connection timeout - please check your internet connection',
      },
      {
        type: 'INVALID_URL' as const,
        message: 'Invalid streaming URL',
      },
      {
        type: 'IFRAME_LOAD_FAILED' as const,
        message: 'Unable to load streaming player',
      },
      {
        type: 'UNKNOWN' as const,
        message: 'An unexpected error occurred',
      },
    ];

    errorTypes.forEach(({ type, message }) => {
      it(`displays error for ${type}`, () => {
        const error: StreamingError = {
          type,
          message,
          timestamp: Date.now(),
          tmdbId: 550,
        };

        render(
          <StreamErrorBoundary error={error} onRetry={jest.fn()}>
            <div>Test Content</div>
          </StreamErrorBoundary>
        );

        expect(screen.getByText(message)).toBeInTheDocument();
      });
    });
  });

  describe('State Transitions', () => {
    it('transitions from error to success', () => {
      const { rerender } = render(
        <StreamErrorBoundary
          error={{
            type: 'ALL_DOMAINS_FAILED',
            message: 'Stream not available - please try again later',
            timestamp: Date.now(),
            tmdbId: 550,
          }}
          onRetry={jest.fn()}
        >
          <div>Test Content</div>
        </StreamErrorBoundary>
      );

      expect(screen.queryByText('Test Content')).not.toBeInTheDocument();

      rerender(
        <StreamErrorBoundary error={null} onRetry={jest.fn()}>
          <div>Test Content</div>
        </StreamErrorBoundary>
      );

      expect(screen.getByText('Test Content')).toBeInTheDocument();
    });

    it('transitions from success to error', () => {
      const { rerender } = render(
        <StreamErrorBoundary error={null} onRetry={jest.fn()}>
          <div>Test Content</div>
        </StreamErrorBoundary>
      );

      expect(screen.getByText('Test Content')).toBeInTheDocument();

      rerender(
        <StreamErrorBoundary
          error={{
            type: 'ALL_DOMAINS_FAILED',
            message: 'Stream not available - please try again later',
            timestamp: Date.now(),
            tmdbId: 550,
          }}
          onRetry={jest.fn()}
        >
          <div>Test Content</div>
        </StreamErrorBoundary>
      );

      expect(screen.queryByText('Test Content')).not.toBeInTheDocument();
      expect(
        screen.getByText('Stream not available - please try again later')
      ).toBeInTheDocument();
    });
  });
});
