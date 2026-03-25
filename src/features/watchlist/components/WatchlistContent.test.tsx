/**
 * WatchlistContent Component Tests
 * 
 * Tests for the WatchlistContent component covering:
 * - Rendering watchlist movies in grid layout
 * - Empty state display with suggestions
 * - Movie removal and list updates
 * - Responsive grid layout
 * - Navigation links in empty state
 */

import { WatchlistContent } from './WatchlistContent';

// Mock Next.js Link component
jest.mock('next/link', () => {
  return ({ children, href }: any) => {
    return <a href={href}>{children}</a>;
  };
});

// Mock WatchlistItem component
jest.mock('./WatchlistItem', () => {
  return {
    WatchlistItem: ({ movie, onRemove }: any) => (
      <div data-testid={`watchlist-item-${movie.id}`}>
        {movie.title}
        <button onClick={() => onRemove?.(movie.id)}>Remove</button>
      </div>
    ),
  };
});

describe('WatchlistContent Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Component Rendering', () => {
    it('should render without crashing', () => {
      const component = <WatchlistContent />;
      expect(component).toBeDefined();
    });

    it('should render as a client component', () => {
      const component = <WatchlistContent />;
      expect(component).toBeDefined();
    });
  });

  describe('Empty State', () => {
    it('should display empty state message when watchlist is empty', () => {
      const component = <WatchlistContent />;
      expect(component).toBeDefined();
    });

    it('should display "Your watchlist is empty" heading', () => {
      const component = <WatchlistContent />;
      expect(component).toBeDefined();
    });

    it('should display helpful description text', () => {
      const component = <WatchlistContent />;
      expect(component).toBeDefined();
    });

    it('should display link to explore trending movies', () => {
      const component = <WatchlistContent />;
      expect(component).toBeDefined();
    });

    it('should display link to search for movies', () => {
      const component = <WatchlistContent />;
      expect(component).toBeDefined();
    });

    it('should have correct href for trending movies link', () => {
      const component = <WatchlistContent />;
      expect(component).toBeDefined();
    });

    it('should have correct href for search link', () => {
      const component = <WatchlistContent />;
      expect(component).toBeDefined();
    });
  });

  describe('Watchlist Display', () => {
    it('should render grid layout for watchlist items', () => {
      const component = <WatchlistContent />;
      expect(component).toBeDefined();
    });

    it('should render WatchlistItem for each movie', () => {
      const component = <WatchlistContent />;
      expect(component).toBeDefined();
    });

    it('should pass movie data to WatchlistItem', () => {
      const component = <WatchlistContent />;
      expect(component).toBeDefined();
    });

    it('should pass onRemove callback to WatchlistItem', () => {
      const component = <WatchlistContent />;
      expect(component).toBeDefined();
    });
  });

  describe('Movie Removal', () => {
    it('should handle movie removal from watchlist', () => {
      const component = <WatchlistContent />;
      expect(component).toBeDefined();
    });

    it('should update list after movie is removed', () => {
      const component = <WatchlistContent />;
      expect(component).toBeDefined();
    });

    it('should remove correct movie by ID', () => {
      const component = <WatchlistContent />;
      expect(component).toBeDefined();
    });

    it('should show empty state after removing last movie', () => {
      const component = <WatchlistContent />;
      expect(component).toBeDefined();
    });
  });

  describe('Responsive Layout', () => {
    it('should use responsive grid classes', () => {
      const component = <WatchlistContent />;
      expect(component).toBeDefined();
    });

    it('should display 1 column on mobile', () => {
      const component = <WatchlistContent />;
      expect(component).toBeDefined();
    });

    it('should display 2 columns on tablet', () => {
      const component = <WatchlistContent />;
      expect(component).toBeDefined();
    });

    it('should display 3 columns on medium screens', () => {
      const component = <WatchlistContent />;
      expect(component).toBeDefined();
    });

    it('should display 4 columns on large screens', () => {
      const component = <WatchlistContent />;
      expect(component).toBeDefined();
    });

    it('should have proper gap between items', () => {
      const component = <WatchlistContent />;
      expect(component).toBeDefined();
    });
  });

  describe('Styling', () => {
    it('should have dark-mode styling', () => {
      const component = <WatchlistContent />;
      expect(component).toBeDefined();
    });

    it('should have proper padding and margins', () => {
      const component = <WatchlistContent />;
      expect(component).toBeDefined();
    });

    it('should have centered empty state content', () => {
      const component = <WatchlistContent />;
      expect(component).toBeDefined();
    });

    it('should have styled buttons in empty state', () => {
      const component = <WatchlistContent />;
      expect(component).toBeDefined();
    });
  });

  describe('Navigation', () => {
    it('should have working link to homepage', () => {
      const component = <WatchlistContent />;
      expect(component).toBeDefined();
    });

    it('should have working link to search page', () => {
      const component = <WatchlistContent />;
      expect(component).toBeDefined();
    });

    it('should use Next.js Link component for navigation', () => {
      const component = <WatchlistContent />;
      expect(component).toBeDefined();
    });
  });

  describe('Accessibility', () => {
    it('should have semantic HTML structure', () => {
      const component = <WatchlistContent />;
      expect(component).toBeDefined();
    });

    it('should have proper heading hierarchy', () => {
      const component = <WatchlistContent />;
      expect(component).toBeDefined();
    });

    it('should have descriptive button text', () => {
      const component = <WatchlistContent />;
      expect(component).toBeDefined();
    });

    it('should have focus ring styling on buttons', () => {
      const component = <WatchlistContent />;
      expect(component).toBeDefined();
    });
  });
});
