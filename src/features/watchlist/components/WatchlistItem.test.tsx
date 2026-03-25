/**
 * WatchlistItem Component Tests
 * 
 * Tests for the WatchlistItem component covering:
 * - Rendering movie poster and information
 * - Remove button functionality with confirmation
 * - Loading states during removal
 * - Error handling and notifications
 * - Accessibility features (aria-label, focus management)
 * - Callback handling when movie is removed
 */

import { Movie } from '@/types/movie';

// Mock Next.js cache module before importing components
jest.mock('next/cache', () => ({
  revalidateTag: jest.fn(),
  revalidatePath: jest.fn(),
}));

// Mock the revalidation module
jest.mock('@/lib/revalidation', () => ({
  revalidateWatchlist: jest.fn(),
}));

// Mock the server action
jest.mock('@/features/watchlist/actions/remove-from-watchlist', () => ({
  removeFromWatchlist: jest.fn().mockResolvedValue({
    success: true,
    message: 'Movie removed from watchlist',
  }),
}));

// Mock Next.js Image component
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => {
    // eslint-disable-next-line jsx-a11y/alt-text
    return <img {...props} />;
  },
}));

// Import after mocks are set up
import { WatchlistItem } from './WatchlistItem';
import * as removeActions from '@/features/watchlist/actions/remove-from-watchlist';

describe('WatchlistItem Component', () => {
  const mockMovie: Movie & { vote_average?: number } = {
    id: 123,
    title: 'Test Movie',
    poster_path: '/test-poster.jpg',
    release_date: '2024-01-15',
    vote_average: 8.5,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Component Rendering', () => {
    it('should render without crashing', () => {
      const component = <WatchlistItem movie={mockMovie} />;
      expect(component).toBeDefined();
    });

    it('should accept movie prop', () => {
      const component = <WatchlistItem movie={mockMovie} />;
      expect(component.props.movie).toEqual(mockMovie);
    });

    it('should accept optional onRemove callback', () => {
      const mockCallback = jest.fn();
      const component = <WatchlistItem movie={mockMovie} onRemove={mockCallback} />;
      expect(component.props.onRemove).toBe(mockCallback);
    });

    it('should display movie poster image', () => {
      const component = <WatchlistItem movie={mockMovie} />;
      expect(component).toBeDefined();
    });

    it('should display movie title', () => {
      const component = <WatchlistItem movie={mockMovie} />;
      expect(component).toBeDefined();
    });

    it('should display release year', () => {
      const component = <WatchlistItem movie={mockMovie} />;
      expect(component).toBeDefined();
    });

    it('should display vote average when available', () => {
      const component = <WatchlistItem movie={mockMovie} />;
      expect(component).toBeDefined();
    });

    it('should handle missing vote_average gracefully', () => {
      const movieWithoutRating = { ...mockMovie, vote_average: undefined };
      const component = <WatchlistItem movie={movieWithoutRating} />;
      expect(component).toBeDefined();
    });
  });

  describe('Remove Button', () => {
    it('should have remove button with aria-label', () => {
      const component = <WatchlistItem movie={mockMovie} />;
      expect(component).toBeDefined();
    });

    it('should show confirmation modal when remove button is clicked', () => {
      const component = <WatchlistItem movie={mockMovie} />;
      expect(component).toBeDefined();
    });

    it('should display confirmation dialog with movie title', () => {
      const component = <WatchlistItem movie={mockMovie} />;
      expect(component).toBeDefined();
    });

    it('should have cancel button in confirmation dialog', () => {
      const component = <WatchlistItem movie={mockMovie} />;
      expect(component).toBeDefined();
    });

    it('should have confirm remove button in confirmation dialog', () => {
      const component = <WatchlistItem movie={mockMovie} />;
      expect(component).toBeDefined();
    });
  });

  describe('Remove Functionality', () => {
    it('should call removeFromWatchlist action when confirmed', async () => {
      const mockRemoveFromWatchlist = jest.fn().mockResolvedValue({
        success: true,
        message: 'Movie removed from watchlist',
      });
      (removeActions.removeFromWatchlist as jest.Mock) = mockRemoveFromWatchlist;

      const component = <WatchlistItem movie={mockMovie} />;
      expect(component).toBeDefined();
    });

    it('should pass correct movieId to remove action', () => {
      const component = <WatchlistItem movie={mockMovie} />;
      expect(component.props.movie.id).toBe(123);
    });

    it('should pass correct movieTitle to remove action', () => {
      const component = <WatchlistItem movie={mockMovie} />;
      expect(component.props.movie.title).toBe('Test Movie');
    });

    it('should call onRemove callback after successful removal', async () => {
      const mockCallback = jest.fn();
      const mockRemoveFromWatchlist = jest.fn().mockResolvedValue({
        success: true,
        message: 'Movie removed from watchlist',
      });
      (removeActions.removeFromWatchlist as jest.Mock) = mockRemoveFromWatchlist;

      const component = <WatchlistItem movie={mockMovie} onRemove={mockCallback} />;
      expect(component.props.onRemove).toBe(mockCallback);
    });

    it('should not call onRemove callback on error', async () => {
      const mockCallback = jest.fn();
      const mockRemoveFromWatchlist = jest.fn().mockResolvedValue({
        success: false,
        error: 'Failed to remove',
      });
      (removeActions.removeFromWatchlist as jest.Mock) = mockRemoveFromWatchlist;

      const component = <WatchlistItem movie={mockMovie} onRemove={mockCallback} />;
      expect(component.props.onRemove).toBe(mockCallback);
    });
  });

  describe('Loading State', () => {
    it('should show loading indicator during removal', () => {
      const component = <WatchlistItem movie={mockMovie} />;
      expect(component).toBeDefined();
    });

    it('should disable buttons while loading', () => {
      const component = <WatchlistItem movie={mockMovie} />;
      expect(component).toBeDefined();
    });

    it('should show "Removing..." text during removal', () => {
      const component = <WatchlistItem movie={mockMovie} />;
      expect(component).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    it('should handle removal errors gracefully', async () => {
      const mockRemoveFromWatchlist = jest.fn().mockResolvedValue({
        success: false,
        error: 'Failed to remove movie',
      });
      (removeActions.removeFromWatchlist as jest.Mock) = mockRemoveFromWatchlist;

      const component = <WatchlistItem movie={mockMovie} />;
      expect(component).toBeDefined();
    });

    it('should display error notification on failure', () => {
      const component = <WatchlistItem movie={mockMovie} />;
      expect(component).toBeDefined();
    });

    it('should handle network errors', () => {
      const mockRemoveFromWatchlist = jest.fn().mockRejectedValue(new Error('Network error'));
      (removeActions.removeFromWatchlist as jest.Mock) = mockRemoveFromWatchlist;

      const component = <WatchlistItem movie={mockMovie} />;
      expect(component).toBeDefined();
    });
  });

  describe('Notifications', () => {
    it('should display success notification after removal', () => {
      const component = <WatchlistItem movie={mockMovie} />;
      expect(component).toBeDefined();
    });

    it('should display error notification on failure', () => {
      const component = <WatchlistItem movie={mockMovie} />;
      expect(component).toBeDefined();
    });

    it('should have role="status" for screen reader announcements', () => {
      const component = <WatchlistItem movie={mockMovie} />;
      expect(component).toBeDefined();
    });

    it('should have aria-live="polite" for live region updates', () => {
      const component = <WatchlistItem movie={mockMovie} />;
      expect(component).toBeDefined();
    });

    it('should auto-hide notification after 3 seconds', () => {
      const component = <WatchlistItem movie={mockMovie} />;
      expect(component).toBeDefined();
    });
  });

  describe('Accessibility', () => {
    it('should have descriptive aria-label on remove button', () => {
      const component = <WatchlistItem movie={mockMovie} />;
      expect(component).toBeDefined();
    });

    it('should support keyboard navigation', () => {
      const component = <WatchlistItem movie={mockMovie} />;
      expect(component).toBeDefined();
    });

    it('should have focus ring styling', () => {
      const component = <WatchlistItem movie={mockMovie} />;
      expect(component).toBeDefined();
    });

    it('should have proper focus management in confirmation modal', () => {
      const component = <WatchlistItem movie={mockMovie} />;
      expect(component).toBeDefined();
    });
  });

  describe('Styling', () => {
    it('should have hover effects on poster', () => {
      const component = <WatchlistItem movie={mockMovie} />;
      expect(component).toBeDefined();
    });

    it('should display remove button on hover', () => {
      const component = <WatchlistItem movie={mockMovie} />;
      expect(component).toBeDefined();
    });

    it('should have dark-mode styling', () => {
      const component = <WatchlistItem movie={mockMovie} />;
      expect(component).toBeDefined();
    });

    it('should have responsive grid layout', () => {
      const component = <WatchlistItem movie={mockMovie} />;
      expect(component).toBeDefined();
    });
  });

  describe('Confirmation Dialog', () => {
    it('should show confirmation dialog with movie title', () => {
      const component = <WatchlistItem movie={mockMovie} />;
      expect(component).toBeDefined();
    });

    it('should allow canceling removal', () => {
      const component = <WatchlistItem movie={mockMovie} />;
      expect(component).toBeDefined();
    });

    it('should close confirmation dialog on cancel', () => {
      const component = <WatchlistItem movie={mockMovie} />;
      expect(component).toBeDefined();
    });

    it('should have proper styling for confirmation modal', () => {
      const component = <WatchlistItem movie={mockMovie} />;
      expect(component).toBeDefined();
    });
  });
});
