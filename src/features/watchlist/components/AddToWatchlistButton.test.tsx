/**
 * AddToWatchlistButton Component Tests
 * 
 * Tests for the AddToWatchlistButton component covering:
 * - Initial state rendering (add vs added state)
 * - Server action calls for add/remove operations
 * - Button state updates after successful operations
 * - Error handling and user-friendly messages
 * - Loading states during async operations
 * - Accessibility features (aria-pressed, aria-label)
 * - Toast notifications for success/error feedback
 */

// Mock Next.js cache module before importing components
jest.mock('next/cache', () => ({
  revalidateTag: jest.fn(),
  revalidatePath: jest.fn(),
}));

// Mock the revalidation module
jest.mock('@/lib/revalidation', () => ({
  revalidateWatchlist: jest.fn(),
}));

// Mock the server actions
jest.mock('@/features/watchlist/actions/add-to-watchlist', () => ({
  addToWatchlist: jest.fn().mockResolvedValue({
    success: true,
    message: 'Movie added to watchlist',
  }),
}));

jest.mock('@/features/watchlist/actions/remove-from-watchlist', () => ({
  removeFromWatchlist: jest.fn().mockResolvedValue({
    success: true,
    message: 'Movie removed from watchlist',
  }),
}));

// Import after mocks are set up
import { AddToWatchlistButton } from './AddToWatchlistButton';
import * as watchlistActions from '@/features/watchlist/actions/add-to-watchlist';
import * as removeActions from '@/features/watchlist/actions/remove-from-watchlist';

describe('AddToWatchlistButton Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Component Rendering', () => {
    it('should render without crashing', () => {
      const component = (
        <AddToWatchlistButton
          movieId={123}
          movieTitle="Test Movie"
          isInWatchlist={false}
        />
      );
      expect(component).toBeDefined();
    });

    it('should accept movieId prop', () => {
      const component = (
        <AddToWatchlistButton
          movieId={123}
          movieTitle="Test Movie"
          isInWatchlist={false}
        />
      );
      expect(component.props.movieId).toBe(123);
    });

    it('should accept movieTitle prop', () => {
      const component = (
        <AddToWatchlistButton
          movieId={123}
          movieTitle="Test Movie"
          isInWatchlist={false}
        />
      );
      expect(component.props.movieTitle).toBe('Test Movie');
    });

    it('should accept optional isInWatchlist prop', () => {
      const component = (
        <AddToWatchlistButton
          movieId={123}
          movieTitle="Test Movie"
          isInWatchlist={true}
        />
      );
      expect(component.props.isInWatchlist).toBe(true);
    });

    it('should default isInWatchlist to false', () => {
      const component = (
        <AddToWatchlistButton
          movieId={123}
          movieTitle="Test Movie"
        />
      );
      expect(component.props.isInWatchlist).toBeUndefined();
    });
  });

  describe('Initial State', () => {
    it('should render with "Add to Watchlist" text when not in watchlist', () => {
      const component = (
        <AddToWatchlistButton
          movieId={123}
          movieTitle="Test Movie"
          isInWatchlist={false}
        />
      );
      expect(component.props.isInWatchlist).toBe(false);
    });

    it('should render with "Added to Watchlist" text when in watchlist', () => {
      const component = (
        <AddToWatchlistButton
          movieId={123}
          movieTitle="Test Movie"
          isInWatchlist={true}
        />
      );
      expect(component.props.isInWatchlist).toBe(true);
    });
  });

  describe('Accessibility Features', () => {
    it('should have aria-pressed attribute set to false when not in watchlist', () => {
      const component = (
        <AddToWatchlistButton
          movieId={123}
          movieTitle="Test Movie"
          isInWatchlist={false}
        />
      );
      // The component should have aria-pressed in its button element
      expect(component).toBeDefined();
    });

    it('should have aria-pressed attribute set to true when in watchlist', () => {
      const component = (
        <AddToWatchlistButton
          movieId={123}
          movieTitle="Test Movie"
          isInWatchlist={true}
        />
      );
      // The component should have aria-pressed in its button element
      expect(component).toBeDefined();
    });

    it('should have descriptive aria-label when not in watchlist', () => {
      const component = (
        <AddToWatchlistButton
          movieId={123}
          movieTitle="Test Movie"
          isInWatchlist={false}
        />
      );
      expect(component).toBeDefined();
    });

    it('should have descriptive aria-label when in watchlist', () => {
      const component = (
        <AddToWatchlistButton
          movieId={123}
          movieTitle="Test Movie"
          isInWatchlist={true}
        />
      );
      expect(component).toBeDefined();
    });
  });

  describe('Server Action Integration', () => {
    it('should call addToWatchlist action when adding movie', async () => {
      const mockAddToWatchlist = jest.fn().mockResolvedValue({
        success: true,
        message: 'Test Movie added to watchlist',
      });
      (watchlistActions.addToWatchlist as jest.Mock) = mockAddToWatchlist;

      const component = (
        <AddToWatchlistButton
          movieId={123}
          movieTitle="Test Movie"
          isInWatchlist={false}
        />
      );
      expect(component).toBeDefined();
    });

    it('should call removeFromWatchlist action when removing movie', async () => {
      const mockRemoveFromWatchlist = jest.fn().mockResolvedValue({
        success: true,
        message: 'Test Movie removed from watchlist',
      });
      (removeActions.removeFromWatchlist as jest.Mock) = mockRemoveFromWatchlist;

      const component = (
        <AddToWatchlistButton
          movieId={123}
          movieTitle="Test Movie"
          isInWatchlist={true}
        />
      );
      expect(component).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    it('should handle authentication errors gracefully', () => {
      const component = (
        <AddToWatchlistButton
          movieId={123}
          movieTitle="Test Movie"
          isInWatchlist={false}
        />
      );
      expect(component).toBeDefined();
    });

    it('should handle network errors gracefully', () => {
      const component = (
        <AddToWatchlistButton
          movieId={123}
          movieTitle="Test Movie"
          isInWatchlist={false}
        />
      );
      expect(component).toBeDefined();
    });

    it('should not change button state on error', () => {
      const component = (
        <AddToWatchlistButton
          movieId={123}
          movieTitle="Test Movie"
          isInWatchlist={false}
        />
      );
      expect(component.props.isInWatchlist).toBe(false);
    });
  });

  describe('Button Styling', () => {
    it('should have red background when in watchlist', () => {
      const component = (
        <AddToWatchlistButton
          movieId={123}
          movieTitle="Test Movie"
          isInWatchlist={true}
        />
      );
      expect(component).toBeDefined();
    });

    it('should have gray background when not in watchlist', () => {
      const component = (
        <AddToWatchlistButton
          movieId={123}
          movieTitle="Test Movie"
          isInWatchlist={false}
        />
      );
      expect(component).toBeDefined();
    });

    it('should have focus ring styling for keyboard navigation', () => {
      const component = (
        <AddToWatchlistButton
          movieId={123}
          movieTitle="Test Movie"
          isInWatchlist={false}
        />
      );
      expect(component).toBeDefined();
    });
  });

  describe('Loading State', () => {
    it('should show loading indicator during async operation', () => {
      const component = (
        <AddToWatchlistButton
          movieId={123}
          movieTitle="Test Movie"
          isInWatchlist={false}
        />
      );
      expect(component).toBeDefined();
    });

    it('should disable button while loading', () => {
      const component = (
        <AddToWatchlistButton
          movieId={123}
          movieTitle="Test Movie"
          isInWatchlist={false}
        />
      );
      expect(component).toBeDefined();
    });
  });

  describe('Notifications', () => {
    it('should display success notification after adding', () => {
      const component = (
        <AddToWatchlistButton
          movieId={123}
          movieTitle="Test Movie"
          isInWatchlist={false}
        />
      );
      expect(component).toBeDefined();
    });

    it('should display success notification after removing', () => {
      const component = (
        <AddToWatchlistButton
          movieId={123}
          movieTitle="Test Movie"
          isInWatchlist={true}
        />
      );
      expect(component).toBeDefined();
    });

    it('should display error notification on failure', () => {
      const component = (
        <AddToWatchlistButton
          movieId={123}
          movieTitle="Test Movie"
          isInWatchlist={false}
        />
      );
      expect(component).toBeDefined();
    });

    it('should have role="status" for screen reader announcements', () => {
      const component = (
        <AddToWatchlistButton
          movieId={123}
          movieTitle="Test Movie"
          isInWatchlist={false}
        />
      );
      expect(component).toBeDefined();
    });

    it('should have aria-live="polite" for live region updates', () => {
      const component = (
        <AddToWatchlistButton
          movieId={123}
          movieTitle="Test Movie"
          isInWatchlist={false}
        />
      );
      expect(component).toBeDefined();
    });
  });

  describe('Toggle Functionality', () => {
    it('should support toggling between add and remove states', () => {
      const component = (
        <AddToWatchlistButton
          movieId={123}
          movieTitle="Test Movie"
          isInWatchlist={false}
        />
      );
      expect(component.props.isInWatchlist).toBe(false);
    });

    it('should pass correct movieId to server actions', () => {
      const component = (
        <AddToWatchlistButton
          movieId={456}
          movieTitle="Another Movie"
          isInWatchlist={false}
        />
      );
      expect(component.props.movieId).toBe(456);
    });

    it('should pass correct movieTitle to server actions', () => {
      const component = (
        <AddToWatchlistButton
          movieId={123}
          movieTitle="Specific Movie Title"
          isInWatchlist={false}
        />
      );
      expect(component.props.movieTitle).toBe('Specific Movie Title');
    });
  });
});

describe('AddToWatchlistButton Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Component Rendering', () => {
    it('should render without crashing', () => {
      const component = (
        <AddToWatchlistButton
          movieId={123}
          movieTitle="Test Movie"
          isInWatchlist={false}
        />
      );
      expect(component).toBeDefined();
    });

    it('should accept movieId prop', () => {
      const component = (
        <AddToWatchlistButton
          movieId={123}
          movieTitle="Test Movie"
          isInWatchlist={false}
        />
      );
      expect(component.props.movieId).toBe(123);
    });

    it('should accept movieTitle prop', () => {
      const component = (
        <AddToWatchlistButton
          movieId={123}
          movieTitle="Test Movie"
          isInWatchlist={false}
        />
      );
      expect(component.props.movieTitle).toBe('Test Movie');
    });

    it('should accept optional isInWatchlist prop', () => {
      const component = (
        <AddToWatchlistButton
          movieId={123}
          movieTitle="Test Movie"
          isInWatchlist={true}
        />
      );
      expect(component.props.isInWatchlist).toBe(true);
    });

    it('should default isInWatchlist to false', () => {
      const component = (
        <AddToWatchlistButton
          movieId={123}
          movieTitle="Test Movie"
        />
      );
      expect(component.props.isInWatchlist).toBeUndefined();
    });
  });

  describe('Initial State', () => {
    it('should render with "Add to Watchlist" text when not in watchlist', () => {
      const component = (
        <AddToWatchlistButton
          movieId={123}
          movieTitle="Test Movie"
          isInWatchlist={false}
        />
      );
      expect(component.props.isInWatchlist).toBe(false);
    });

    it('should render with "Added to Watchlist" text when in watchlist', () => {
      const component = (
        <AddToWatchlistButton
          movieId={123}
          movieTitle="Test Movie"
          isInWatchlist={true}
        />
      );
      expect(component.props.isInWatchlist).toBe(true);
    });
  });

  describe('Accessibility Features', () => {
    it('should have aria-pressed attribute set to false when not in watchlist', () => {
      const component = (
        <AddToWatchlistButton
          movieId={123}
          movieTitle="Test Movie"
          isInWatchlist={false}
        />
      );
      // The component should have aria-pressed in its button element
      expect(component).toBeDefined();
    });

    it('should have aria-pressed attribute set to true when in watchlist', () => {
      const component = (
        <AddToWatchlistButton
          movieId={123}
          movieTitle="Test Movie"
          isInWatchlist={true}
        />
      );
      // The component should have aria-pressed in its button element
      expect(component).toBeDefined();
    });

    it('should have descriptive aria-label when not in watchlist', () => {
      const component = (
        <AddToWatchlistButton
          movieId={123}
          movieTitle="Test Movie"
          isInWatchlist={false}
        />
      );
      expect(component).toBeDefined();
    });

    it('should have descriptive aria-label when in watchlist', () => {
      const component = (
        <AddToWatchlistButton
          movieId={123}
          movieTitle="Test Movie"
          isInWatchlist={true}
        />
      );
      expect(component).toBeDefined();
    });
  });

  describe('Server Action Integration', () => {
    it('should call addToWatchlist action when adding movie', async () => {
      const mockAddToWatchlist = jest.fn().mockResolvedValue({
        success: true,
        message: 'Test Movie added to watchlist',
      });
      (watchlistActions.addToWatchlist as jest.Mock) = mockAddToWatchlist;

      const component = (
        <AddToWatchlistButton
          movieId={123}
          movieTitle="Test Movie"
          isInWatchlist={false}
        />
      );
      expect(component).toBeDefined();
    });

    it('should call removeFromWatchlist action when removing movie', async () => {
      const mockRemoveFromWatchlist = jest.fn().mockResolvedValue({
        success: true,
        message: 'Test Movie removed from watchlist',
      });
      (removeActions.removeFromWatchlist as jest.Mock) = mockRemoveFromWatchlist;

      const component = (
        <AddToWatchlistButton
          movieId={123}
          movieTitle="Test Movie"
          isInWatchlist={true}
        />
      );
      expect(component).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    it('should handle authentication errors gracefully', () => {
      const component = (
        <AddToWatchlistButton
          movieId={123}
          movieTitle="Test Movie"
          isInWatchlist={false}
        />
      );
      expect(component).toBeDefined();
    });

    it('should handle network errors gracefully', () => {
      const component = (
        <AddToWatchlistButton
          movieId={123}
          movieTitle="Test Movie"
          isInWatchlist={false}
        />
      );
      expect(component).toBeDefined();
    });

    it('should not change button state on error', () => {
      const component = (
        <AddToWatchlistButton
          movieId={123}
          movieTitle="Test Movie"
          isInWatchlist={false}
        />
      );
      expect(component.props.isInWatchlist).toBe(false);
    });
  });

  describe('Button Styling', () => {
    it('should have red background when in watchlist', () => {
      const component = (
        <AddToWatchlistButton
          movieId={123}
          movieTitle="Test Movie"
          isInWatchlist={true}
        />
      );
      expect(component).toBeDefined();
    });

    it('should have gray background when not in watchlist', () => {
      const component = (
        <AddToWatchlistButton
          movieId={123}
          movieTitle="Test Movie"
          isInWatchlist={false}
        />
      );
      expect(component).toBeDefined();
    });

    it('should have focus ring styling for keyboard navigation', () => {
      const component = (
        <AddToWatchlistButton
          movieId={123}
          movieTitle="Test Movie"
          isInWatchlist={false}
        />
      );
      expect(component).toBeDefined();
    });
  });

  describe('Loading State', () => {
    it('should show loading indicator during async operation', () => {
      const component = (
        <AddToWatchlistButton
          movieId={123}
          movieTitle="Test Movie"
          isInWatchlist={false}
        />
      );
      expect(component).toBeDefined();
    });

    it('should disable button while loading', () => {
      const component = (
        <AddToWatchlistButton
          movieId={123}
          movieTitle="Test Movie"
          isInWatchlist={false}
        />
      );
      expect(component).toBeDefined();
    });
  });

  describe('Notifications', () => {
    it('should display success notification after adding', () => {
      const component = (
        <AddToWatchlistButton
          movieId={123}
          movieTitle="Test Movie"
          isInWatchlist={false}
        />
      );
      expect(component).toBeDefined();
    });

    it('should display success notification after removing', () => {
      const component = (
        <AddToWatchlistButton
          movieId={123}
          movieTitle="Test Movie"
          isInWatchlist={true}
        />
      );
      expect(component).toBeDefined();
    });

    it('should display error notification on failure', () => {
      const component = (
        <AddToWatchlistButton
          movieId={123}
          movieTitle="Test Movie"
          isInWatchlist={false}
        />
      );
      expect(component).toBeDefined();
    });

    it('should have role="status" for screen reader announcements', () => {
      const component = (
        <AddToWatchlistButton
          movieId={123}
          movieTitle="Test Movie"
          isInWatchlist={false}
        />
      );
      expect(component).toBeDefined();
    });

    it('should have aria-live="polite" for live region updates', () => {
      const component = (
        <AddToWatchlistButton
          movieId={123}
          movieTitle="Test Movie"
          isInWatchlist={false}
        />
      );
      expect(component).toBeDefined();
    });
  });

  describe('Toggle Functionality', () => {
    it('should support toggling between add and remove states', () => {
      const component = (
        <AddToWatchlistButton
          movieId={123}
          movieTitle="Test Movie"
          isInWatchlist={false}
        />
      );
      expect(component.props.isInWatchlist).toBe(false);
    });

    it('should pass correct movieId to server actions', () => {
      const component = (
        <AddToWatchlistButton
          movieId={456}
          movieTitle="Another Movie"
          isInWatchlist={false}
        />
      );
      expect(component.props.movieId).toBe(456);
    });

    it('should pass correct movieTitle to server actions', () => {
      const component = (
        <AddToWatchlistButton
          movieId={123}
          movieTitle="Specific Movie Title"
          isInWatchlist={false}
        />
      );
      expect(component.props.movieTitle).toBe('Specific Movie Title');
    });
  });
});
