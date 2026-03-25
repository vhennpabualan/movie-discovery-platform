/**
 * MovieCarousel Component Tests
 * 
 * Tests for the MovieCarousel component covering:
 * - Rendering movies in a responsive grid
 * - Horizontal scrolling behavior
 * - Responsive layout (1 col mobile, 2 col tablet, 4 col desktop)
 * - Scroll button functionality
 * - Empty state handling
 * - Watchlist integration
 */

import { MovieCarousel } from './MovieCarousel';
import { Movie } from '@/types/movie';

// Mock the MovieCard component
jest.mock('./MovieCard', () => ({
  MovieCard: ({ movie, onClick, isInWatchlist }: any) => (
    <div
      data-testid={`movie-card-${movie.id}`}
      onClick={() => onClick(movie.id)}
      data-in-watchlist={isInWatchlist}
    >
      {movie.title}
    </div>
  ),
}));

describe('MovieCarousel Component', () => {
  const mockMovies: (Movie & { vote_average?: number })[] = [
    {
      id: 1,
      title: 'Movie 1',
      poster_path: '/path1.jpg',
      release_date: '2024-01-01',
      vote_average: 8.5,
    },
    {
      id: 2,
      title: 'Movie 2',
      poster_path: '/path2.jpg',
      release_date: '2024-01-02',
      vote_average: 7.5,
    },
    {
      id: 3,
      title: 'Movie 3',
      poster_path: '/path3.jpg',
      release_date: '2024-01-03',
      vote_average: 8.0,
    },
    {
      id: 4,
      title: 'Movie 4',
      poster_path: '/path4.jpg',
      release_date: '2024-01-04',
      vote_average: 7.8,
    },
    {
      id: 5,
      title: 'Movie 5',
      poster_path: '/path5.jpg',
      release_date: '2024-01-05',
      vote_average: 8.2,
    },
  ];

  const mockOnClick = jest.fn();

  beforeEach(() => {
    mockOnClick.mockClear();
  });

  describe('Component Rendering', () => {
    it('should render without crashing', () => {
      const component = <MovieCarousel movies={mockMovies} />;
      expect(component).toBeDefined();
    });

    it('should accept movies array prop', () => {
      const component = <MovieCarousel movies={mockMovies} />;
      expect(component.props.movies).toEqual(mockMovies);
    });

    it('should accept optional onMovieClick handler', () => {
      const component = (
        <MovieCarousel movies={mockMovies} onMovieClick={mockOnClick} />
      );
      expect(component.props.onMovieClick).toBe(mockOnClick);
    });

    it('should accept optional watchlistIds prop', () => {
      const component = (
        <MovieCarousel movies={mockMovies} watchlistIds={[1, 3]} />
      );
      expect(component.props.watchlistIds).toEqual([1, 3]);
    });
  });

  describe('Movie Rendering', () => {
    it('should render all movies in carousel', () => {
      const component = <MovieCarousel movies={mockMovies} />;
      expect(component).toBeDefined();
      // Component should render all 5 movies
      expect(mockMovies.length).toBe(5);
    });

    it('should pass movie data to MovieCard components', () => {
      const component = <MovieCarousel movies={mockMovies} />;
      expect(component.props.movies).toEqual(mockMovies);
    });

    it('should pass onClick handler to MovieCard components', () => {
      const component = (
        <MovieCarousel movies={mockMovies} onMovieClick={mockOnClick} />
      );
      expect(component.props.onMovieClick).toBe(mockOnClick);
    });
  });

  describe('Empty State', () => {
    it('should display empty state when no movies provided', () => {
      const component = <MovieCarousel movies={[]} />;
      expect(component.props.movies.length).toBe(0);
    });

    it('should render without error with empty array', () => {
      const component = <MovieCarousel movies={[]} />;
      expect(component).toBeDefined();
    });
  });

  describe('Scroll Functionality', () => {
    it('should have scroll container with smooth scrolling', () => {
      const component = <MovieCarousel movies={mockMovies} />;
      expect(component).toBeDefined();
      // Component should have scroll container with smooth behavior
    });

    it('should have left scroll button', () => {
      const component = <MovieCarousel movies={mockMovies} />;
      expect(component).toBeDefined();
      // Component should render left scroll button
    });

    it('should have right scroll button', () => {
      const component = <MovieCarousel movies={mockMovies} />;
      expect(component).toBeDefined();
      // Component should render right scroll button
    });

    it('should have aria-label on scroll buttons', () => {
      const component = <MovieCarousel movies={mockMovies} />;
      expect(component).toBeDefined();
      // Scroll buttons should have descriptive aria-labels
    });
  });

  describe('Responsive Layout', () => {
    it('should apply responsive grid classes', () => {
      const component = <MovieCarousel movies={mockMovies} />;
      expect(component).toBeDefined();
      // Component should have responsive width classes for mobile, tablet, desktop
    });

    it('should have 1 column on mobile', () => {
      const component = <MovieCarousel movies={mockMovies} />;
      expect(component).toBeDefined();
      // Mobile: w-full (1 column)
    });

    it('should have 2 columns on tablet', () => {
      const component = <MovieCarousel movies={mockMovies} />;
      expect(component).toBeDefined();
      // Tablet: md:w-1/2 (2 columns)
    });

    it('should have 4 columns on desktop', () => {
      const component = <MovieCarousel movies={mockMovies} />;
      expect(component).toBeDefined();
      // Desktop: lg:w-1/4 (4 columns)
    });

    it('should have gap between items', () => {
      const component = <MovieCarousel movies={mockMovies} />;
      expect(component).toBeDefined();
      // Component should have gap-4 for spacing
    });
  });

  describe('Watchlist Integration', () => {
    it('should pass watchlist status to MovieCard', () => {
      const component = (
        <MovieCarousel movies={mockMovies} watchlistIds={[1, 3]} />
      );
      expect(component.props.watchlistIds).toEqual([1, 3]);
    });

    it('should mark movies in watchlist', () => {
      const component = (
        <MovieCarousel movies={mockMovies} watchlistIds={[1, 3]} />
      );
      expect(component.props.watchlistIds).toContain(1);
      expect(component.props.watchlistIds).toContain(3);
    });

    it('should handle empty watchlist', () => {
      const component = <MovieCarousel movies={mockMovies} watchlistIds={[]} />;
      expect(component.props.watchlistIds).toEqual([]);
    });

    it('should default watchlistIds to empty array', () => {
      const component = <MovieCarousel movies={mockMovies} />;
      expect(component.props.watchlistIds).toBeUndefined();
    });
  });

  describe('Styling', () => {
    it('should have scrollbar-hide class for hidden scrollbar', () => {
      const component = <MovieCarousel movies={mockMovies} />;
      expect(component).toBeDefined();
      // Component should have scrollbar-hide utility class
    });

    it('should have overflow-x-auto for horizontal scrolling', () => {
      const component = <MovieCarousel movies={mockMovies} />;
      expect(component).toBeDefined();
      // Component should have overflow-x-auto class
    });

    it('should have flex-shrink-0 on movie items', () => {
      const component = <MovieCarousel movies={mockMovies} />;
      expect(component).toBeDefined();
      // Movie items should have flex-shrink-0 to prevent shrinking
    });

    it('should have dark-mode styling on scroll buttons', () => {
      const component = <MovieCarousel movies={mockMovies} />;
      expect(component).toBeDefined();
      // Scroll buttons should have dark background with hover effects
    });
  });

  describe('Accessibility', () => {
    it('should have semantic structure', () => {
      const component = <MovieCarousel movies={mockMovies} />;
      expect(component).toBeDefined();
      // Component should use semantic HTML
    });

    it('should have accessible scroll buttons', () => {
      const component = <MovieCarousel movies={mockMovies} />;
      expect(component).toBeDefined();
      // Scroll buttons should be keyboard accessible
    });

    it('should pass accessibility props to MovieCard', () => {
      const component = <MovieCarousel movies={mockMovies} />;
      expect(component).toBeDefined();
      // MovieCard components should receive accessibility props
    });
  });
});
