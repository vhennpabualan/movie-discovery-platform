/**
 * MovieCard Component Tests
 * 
 * Tests for the MovieCard component covering:
 * - Rendering with movie data
 * - Accessibility features (aria-label, keyboard navigation)
 * - Click and keyboard event handling
 * - Hover state display
 * - Watchlist status display
 * - Dark-mode styling
 * - Bug condition: Navigation on click and Enter key press
 * - Preservation: Non-navigation interactions remain unchanged
 */

import { render, screen, fireEvent } from '@testing-library/react';
import { MovieCard } from './MovieCard';
import { Movie } from '@/types/movie';

// Mock Next.js Image component
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => {
    // eslint-disable-next-line jsx-a11y/alt-text
    return <img {...props} />;
  },
}));

// Mock useViewTransition hook
jest.mock('@/lib/hooks/useViewTransition', () => ({
  useViewTransition: () => ({
    navigateWithTransition: jest.fn(),
  }),
}));

describe('MovieCard Component', () => {
  const mockMovie: Movie & { vote_average?: number } = {
    id: 1,
    title: 'Inception',
    poster_path: '/path/to/poster.jpg',
    release_date: '2010-07-16',
    vote_average: 8.8,
  };

  const mockOnClick = jest.fn();

  beforeEach(() => {
    mockOnClick.mockClear();
  });

  describe('Component Rendering', () => {
    it('should render without crashing', () => {
      render(<MovieCard movie={mockMovie} onClick={mockOnClick} />);
      expect(screen.getByRole('article')).toBeInTheDocument();
    });

    it('should render movie poster image', () => {
      render(<MovieCard movie={mockMovie} onClick={mockOnClick} />);
      const image = screen.getByAltText('Inception');
      expect(image).toBeInTheDocument();
    });

    it('should construct correct TMDb image URL', () => {
      render(<MovieCard movie={mockMovie} onClick={mockOnClick} />);
      const image = screen.getByAltText('Inception') as HTMLImageElement;
      expect(image.src).toContain('image.tmdb.org');
      expect(image.src).toContain('/path/to/poster.jpg');
    });
  });

  describe('Accessibility Features', () => {
    it('should have role="article" for semantic HTML', () => {
      render(<MovieCard movie={mockMovie} onClick={mockOnClick} />);
      expect(screen.getByRole('article')).toBeInTheDocument();
    });

    it('should have tabindex=0 for keyboard navigation', () => {
      render(<MovieCard movie={mockMovie} onClick={mockOnClick} />);
      const card = screen.getByRole('article');
      expect(card).toHaveAttribute('tabindex', '0');
    });

    it('should have aria-label with movie title and release year', () => {
      render(<MovieCard movie={mockMovie} onClick={mockOnClick} />);
      const card = screen.getByRole('article');
      expect(card).toHaveAttribute('aria-label', 'Inception, released 2010');
    });

    it('should include watchlist status in aria-label when in watchlist', () => {
      render(
        <MovieCard
          movie={mockMovie}
          onClick={mockOnClick}
          isInWatchlist={true}
        />
      );
      const card = screen.getByRole('article');
      expect(card).toHaveAttribute(
        'aria-label',
        'Inception, released 2010, in watchlist'
      );
    });

    it('should handle movie with unknown release date in aria-label', () => {
      const movieWithoutDate: Movie & { vote_average?: number } = {
        id: 3,
        title: 'Unknown Movie',
        poster_path: '/path/to/unknown.jpg',
        release_date: '',
        vote_average: 7.5,
      };

      render(<MovieCard movie={movieWithoutDate} onClick={mockOnClick} />);
      const card = screen.getByRole('article');
      expect(card).toHaveAttribute(
        'aria-label',
        'Unknown Movie, released Unknown'
      );
    });
  });

  describe('Event Handlers', () => {
    it('should call onClick when card is clicked', () => {
      render(<MovieCard movie={mockMovie} onClick={mockOnClick} />);
      const card = screen.getByRole('article');
      fireEvent.click(card);
      expect(mockOnClick).toHaveBeenCalledWith(mockMovie.id);
    });

    it('should call onClick when Enter key is pressed', () => {
      render(<MovieCard movie={mockMovie} onClick={mockOnClick} />);
      const card = screen.getByRole('article');
      fireEvent.keyDown(card, { key: 'Enter' });
      expect(mockOnClick).toHaveBeenCalledWith(mockMovie.id);
    });

    it('should not call onClick for other keys', () => {
      render(<MovieCard movie={mockMovie} onClick={mockOnClick} />);
      const card = screen.getByRole('article');
      fireEvent.keyDown(card, { key: 'Space' });
      expect(mockOnClick).not.toHaveBeenCalled();
    });

    it('should display hover content on mouse enter', () => {
      render(<MovieCard movie={mockMovie} onClick={mockOnClick} />);
      const card = screen.getByRole('article');
      fireEvent.mouseEnter(card);
      expect(screen.getByText('Inception')).toBeInTheDocument();
    });

    it('should display rating on hover', () => {
      render(<MovieCard movie={mockMovie} onClick={mockOnClick} />);
      const card = screen.getByRole('article');
      fireEvent.mouseEnter(card);
      expect(screen.getByText('8.8/10')).toBeInTheDocument();
    });
  });

  describe('Styling', () => {
    it('should have dark-mode Netflix aesthetic classes', () => {
      render(<MovieCard movie={mockMovie} onClick={mockOnClick} />);
      const card = screen.getByRole('article');
      const className = card.className;

      expect(className).toContain('rounded-lg');
      expect(className).toContain('overflow-hidden');
      expect(className).toContain('cursor-pointer');
    });

    it('should have hover effects', () => {
      render(<MovieCard movie={mockMovie} onClick={mockOnClick} />);
      const card = screen.getByRole('article');
      const className = card.className;

      expect(className).toContain('hover:scale-105');
      expect(className).toContain('hover:shadow-2xl');
    });

    it('should have focus ring for keyboard navigation', () => {
      render(<MovieCard movie={mockMovie} onClick={mockOnClick} />);
      const card = screen.getByRole('article');
      const className = card.className;

      expect(className).toContain('focus:ring-2');
      expect(className).toContain('focus:ring-netflix-red');
    });

    it('should have aspect ratio for poster display', () => {
      render(<MovieCard movie={mockMovie} onClick={mockOnClick} />);
      const card = screen.getByRole('article');
      const className = card.className;

      expect(className).toContain('aspect-2/3');
    });
  });

  describe('Watchlist Status', () => {
    it('should render watchlist badge when isInWatchlist is true', () => {
      render(
        <MovieCard
          movie={mockMovie}
          onClick={mockOnClick}
          isInWatchlist={true}
        />
      );
      expect(screen.getByText('✓')).toBeInTheDocument();
    });

    it('should not render watchlist badge when isInWatchlist is false', () => {
      render(
        <MovieCard
          movie={mockMovie}
          onClick={mockOnClick}
          isInWatchlist={false}
        />
      );
      expect(screen.queryByText('✓')).not.toBeInTheDocument();
    });

    it('should default isInWatchlist to false', () => {
      render(<MovieCard movie={mockMovie} onClick={mockOnClick} />);
      expect(screen.queryByText('✓')).not.toBeInTheDocument();
    });
  });

  describe('Vote Average Handling', () => {
    it('should display rating on hover when vote_average exists', () => {
      const movieWithRating: Movie & { vote_average?: number } = {
        ...mockMovie,
        vote_average: 8.8,
      };

      render(<MovieCard movie={movieWithRating} onClick={mockOnClick} />);
      const card = screen.getByRole('article');
      fireEvent.mouseEnter(card);
      expect(screen.getByText('8.8/10')).toBeInTheDocument();
    });

    it('should not display rating on hover when vote_average is undefined', () => {
      const movieWithoutRating: Movie = {
        id: 2,
        title: 'The Matrix',
        poster_path: '/path/to/matrix.jpg',
        release_date: '1999-03-31',
      };

      render(<MovieCard movie={movieWithoutRating} onClick={mockOnClick} />);
      const card = screen.getByRole('article');
      fireEvent.mouseEnter(card);
      expect(screen.queryByText(/\/10/)).not.toBeInTheDocument();
    });
  });

  describe('View Transition Name Uniqueness', () => {
    /**
     * **Validates: Requirements 2.1, 2.2, 2.3**
     * 
     * Property: Unique View Transition Names
     * 
     * For any movie card rendered in a list context where multiple cards are present,
     * the MovieCard component SHALL assign a unique `viewTransitionName` derived from
     * the movie ID (format: `poster-image-${movie.id}`), enabling the View Transitions
     * API to execute smooth transitions without aborting.
     */

    it('should render with unique viewTransitionName based on movie ID', () => {
      render(<MovieCard movie={mockMovie} onClick={mockOnClick} />);
      const card = screen.getByRole('article');
      
      // Check that viewTransitionName is set to poster-image-${id}
      expect(card.style.viewTransitionName).toBe(`poster-image-${mockMovie.id}`);
    });

    it('should generate unique viewTransitionName for different movies', () => {
      // Generate multiple test cases with different movie IDs
      const testMovies = [
        { id: 1, title: 'Movie 1', poster_path: '/path1.jpg', release_date: '2020-01-01' },
        { id: 2, title: 'Movie 2', poster_path: '/path2.jpg', release_date: '2020-01-02' },
        { id: 3, title: 'Movie 3', poster_path: '/path3.jpg', release_date: '2020-01-03' },
        { id: 4, title: 'Movie 4', poster_path: '/path4.jpg', release_date: '2020-01-04' },
        { id: 5, title: 'Movie 5', poster_path: '/path5.jpg', release_date: '2020-01-05' },
      ];

      const transitionNames = new Set<string>();

      testMovies.forEach((movie) => {
        const onClickHandler = jest.fn();
        const { unmount } = render(
          <MovieCard movie={movie} onClick={onClickHandler} />
        );

        const card = screen.getByRole('article');
        const transitionName = card.style.viewTransitionName;

        // Each movie should have a unique transition name
        expect(transitionName).toBe(`poster-image-${movie.id}`);
        
        // Collect transition names to verify uniqueness
        transitionNames.add(transitionName);

        unmount();
      });

      // All transition names should be unique
      expect(transitionNames.size).toBe(testMovies.length);
    });

    it('should use correct format for viewTransitionName: poster-image-${id}', () => {
      // Test with various movie IDs to ensure format consistency
      const testMovies = [
        { id: 1, title: 'Movie', poster_path: '/path.jpg', release_date: '2020-01-01' },
        { id: 42, title: 'Movie', poster_path: '/path.jpg', release_date: '2020-01-01' },
        { id: 999, title: 'Movie', poster_path: '/path.jpg', release_date: '2020-01-01' },
        { id: 12345, title: 'Movie', poster_path: '/path.jpg', release_date: '2020-01-01' },
      ];

      testMovies.forEach((movie) => {
        const onClickHandler = jest.fn();
        const { unmount } = render(
          <MovieCard movie={movie} onClick={onClickHandler} />
        );

        const card = screen.getByRole('article');
        const transitionName = card.style.viewTransitionName;

        // Verify format: poster-image-{id}
        expect(transitionName).toMatch(/^poster-image-\d+$/);
        expect(transitionName).toBe(`poster-image-${movie.id}`);

        unmount();
      });
    });

    it('should maintain unique viewTransitionName across multiple renders', () => {
      const movie1 = { id: 100, title: 'Movie 1', poster_path: '/path1.jpg', release_date: '2020-01-01' };
      const movie2 = { id: 200, title: 'Movie 2', poster_path: '/path2.jpg', release_date: '2020-01-02' };

      const onClickHandler = jest.fn();

      // Render first movie
      const { unmount: unmount1 } = render(
        <MovieCard movie={movie1} onClick={onClickHandler} />
      );
      const card1 = screen.getByRole('article');
      const transitionName1 = card1.style.viewTransitionName;

      unmount1();

      // Render second movie
      const { unmount: unmount2 } = render(
        <MovieCard movie={movie2} onClick={onClickHandler} />
      );
      const card2 = screen.getByRole('article');
      const transitionName2 = card2.style.viewTransitionName;

      // Both should have unique names based on their IDs
      expect(transitionName1).toBe(`poster-image-${movie1.id}`);
      expect(transitionName2).toBe(`poster-image-${movie2.id}`);
      expect(transitionName1).not.toBe(transitionName2);

      unmount2();
    });
  });

  describe('Bug Condition Exploration: onClick Callback Invocation', () => {
    /**
     * **Validates: Requirements 1.2, 1.3**
     * 
     * Property 1: Bug Condition - MovieCard Component Doesn't Invoke onClick Callback
     * 
     * CRITICAL: This test MUST FAIL on unfixed code - failure confirms the bug exists.
     * DO NOT attempt to fix the test or the code when it fails.
     * 
     * GOAL: Surface counterexamples that demonstrate MovieCard doesn't invoke onClick callback
     * 
     * Scoped PBT Approach: For deterministic bugs, scope the property to concrete failing cases:
     * - Click event on MovieCard with onClick callback
     * - Enter key press on MovieCard with onClick callback
     * 
     * Expected behavior (from design):
     * - When MovieCard is clicked, the onClick callback MUST be invoked with the movie ID
     * - When Enter key is pressed on MovieCard, the onClick callback MUST be invoked with the movie ID
     * - When other keys are pressed, the onClick callback MUST NOT be invoked
     * 
     * EXPECTED OUTCOME on UNFIXED code: Test FAILS (this is correct - it proves the bug exists)
     * 
     * Counterexamples that will be found:
     * - "MovieCard click handler doesn't invoke onClick callback"
     * - "MovieCard Enter key handler doesn't invoke onClick callback"
     */

    describe('Property: MovieCard Click Handler Invokes onClick Callback', () => {
      /**
       * Property: For all click events on MovieCard, the onClick callback MUST be invoked with the movie ID
       * 
       * This test encodes the expected behavior from Requirements 1.2, 2.2
       * When this test passes, it confirms the bug is fixed.
       * When this test fails on unfixed code, it confirms the bug exists.
       */
      it('should invoke onClick callback with movie ID when card is clicked', () => {
        render(<MovieCard movie={mockMovie} onClick={mockOnClick} />);
        const card = screen.getByRole('article');
        
        fireEvent.click(card);
        
        // EXPECTED: onClick callback is invoked with movie ID
        expect(mockOnClick).toHaveBeenCalledWith(mockMovie.id);
        expect(mockOnClick).toHaveBeenCalledTimes(1);
      });

      it('should invoke onClick callback for all movies on click', () => {
        // Generate multiple test cases for stronger guarantees
        const testMovies = [
          { id: 1, title: 'Inception', poster_path: '/path1.jpg', release_date: '2010-07-16' },
          { id: 2, title: 'The Dark Knight', poster_path: '/path2.jpg', release_date: '2008-07-18' },
          { id: 3, title: 'Interstellar', poster_path: '/path3.jpg', release_date: '2014-11-07' },
          { id: 4, title: 'Pulp Fiction', poster_path: '/path4.jpg', release_date: '1994-10-14' },
          { id: 5, title: 'Forrest Gump', poster_path: '/path5.jpg', release_date: '1994-07-06' },
        ];

        testMovies.forEach((movie) => {
          const onClickHandler = jest.fn();
          const { unmount } = render(
            <MovieCard movie={movie} onClick={onClickHandler} />
          );

          const card = screen.getByRole('article');
          fireEvent.click(card);

          // EXPECTED: onClick callback is invoked with movie ID
          expect(onClickHandler).toHaveBeenCalledWith(movie.id);
          expect(onClickHandler).toHaveBeenCalledTimes(1);

          unmount();
        });
      });

      it('should invoke onClick callback with correct movie ID for multiple clicks', () => {
        render(<MovieCard movie={mockMovie} onClick={mockOnClick} />);
        const card = screen.getByRole('article');

        // First click
        fireEvent.click(card);
        expect(mockOnClick).toHaveBeenCalledWith(mockMovie.id);
        expect(mockOnClick).toHaveBeenCalledTimes(1);

        // Second click
        fireEvent.click(card);
        expect(mockOnClick).toHaveBeenCalledWith(mockMovie.id);
        expect(mockOnClick).toHaveBeenCalledTimes(2);

        // Third click
        fireEvent.click(card);
        expect(mockOnClick).toHaveBeenCalledWith(mockMovie.id);
        expect(mockOnClick).toHaveBeenCalledTimes(3);
      });
    });

    describe('Property: MovieCard Enter Key Handler Invokes onClick Callback', () => {
      /**
       * Property: For all Enter key press events on MovieCard, the onClick callback MUST be invoked with the movie ID
       * 
       * This test encodes the expected behavior from Requirements 1.3, 2.3
       * When this test passes, it confirms the bug is fixed.
       * When this test fails on unfixed code, it confirms the bug exists.
       */
      it('should invoke onClick callback with movie ID when Enter key is pressed', () => {
        render(<MovieCard movie={mockMovie} onClick={mockOnClick} />);
        const card = screen.getByRole('article');

        fireEvent.keyDown(card, { key: 'Enter' });

        // EXPECTED: onClick callback is invoked with movie ID
        expect(mockOnClick).toHaveBeenCalledWith(mockMovie.id);
        expect(mockOnClick).toHaveBeenCalledTimes(1);
      });

      it('should invoke onClick callback for all movies on Enter key press', () => {
        // Generate multiple test cases for stronger guarantees
        const testMovies = [
          { id: 1, title: 'Inception', poster_path: '/path1.jpg', release_date: '2010-07-16' },
          { id: 2, title: 'The Dark Knight', poster_path: '/path2.jpg', release_date: '2008-07-18' },
          { id: 3, title: 'Interstellar', poster_path: '/path3.jpg', release_date: '2014-11-07' },
          { id: 4, title: 'Pulp Fiction', poster_path: '/path4.jpg', release_date: '1994-10-14' },
          { id: 5, title: 'Forrest Gump', poster_path: '/path5.jpg', release_date: '1994-07-06' },
        ];

        testMovies.forEach((movie) => {
          const onClickHandler = jest.fn();
          const { unmount } = render(
            <MovieCard movie={movie} onClick={onClickHandler} />
          );

          const card = screen.getByRole('article');
          fireEvent.keyDown(card, { key: 'Enter' });

          // EXPECTED: onClick callback is invoked with movie ID
          expect(onClickHandler).toHaveBeenCalledWith(movie.id);
          expect(onClickHandler).toHaveBeenCalledTimes(1);

          unmount();
        });
      });

      it('should invoke onClick callback with correct movie ID for multiple Enter key presses', () => {
        render(<MovieCard movie={mockMovie} onClick={mockOnClick} />);
        const card = screen.getByRole('article');

        // First Enter key press
        fireEvent.keyDown(card, { key: 'Enter' });
        expect(mockOnClick).toHaveBeenCalledWith(mockMovie.id);
        expect(mockOnClick).toHaveBeenCalledTimes(1);

        // Second Enter key press
        fireEvent.keyDown(card, { key: 'Enter' });
        expect(mockOnClick).toHaveBeenCalledWith(mockMovie.id);
        expect(mockOnClick).toHaveBeenCalledTimes(2);

        // Third Enter key press
        fireEvent.keyDown(card, { key: 'Enter' });
        expect(mockOnClick).toHaveBeenCalledWith(mockMovie.id);
        expect(mockOnClick).toHaveBeenCalledTimes(3);
      });
    });

    describe('Property: MovieCard Other Keys Do NOT Invoke onClick Callback', () => {
      /**
       * Property: For all keyboard inputs except Enter, the onClick callback MUST NOT be invoked
       * 
       * This test encodes the expected behavior from Requirements 3.4
       * This is a preservation test - verifies that non-Enter keys don't trigger callbacks
       */
      it('should not invoke onClick callback for non-Enter keys', () => {
        // Generate multiple test cases with different keyboard inputs
        const nonNavigationKeys = [
          'Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight',
          'Tab', 'Escape', 'Backspace', 'Delete', 'Shift', 'Control', 'Alt',
          'a', 'b', 'c', '1', '2', '3', '@', '#', '$',
        ];

        nonNavigationKeys.forEach((key) => {
          const onClickHandler = jest.fn();
          const { unmount } = render(
            <MovieCard movie={mockMovie} onClick={onClickHandler} />
          );

          const card = screen.getByRole('article');
          fireEvent.keyDown(card, { key });

          // EXPECTED: onClick callback is NOT invoked for non-Enter keys
          expect(onClickHandler).not.toHaveBeenCalled();

          unmount();
        });
      });

      it('should not invoke onClick callback for any non-Enter key on all movies', () => {
        // Generate multiple test cases with different movies and keys
        const testMovies = [
          { id: 1, title: 'Movie 1', poster_path: '/path1.jpg', release_date: '2020-01-01' },
          { id: 2, title: 'Movie 2', poster_path: '/path2.jpg', release_date: '2020-01-02' },
          { id: 3, title: 'Movie 3', poster_path: '/path3.jpg', release_date: '2020-01-03' },
        ];

        const nonNavigationKeys = ['Space', 'ArrowUp', 'ArrowDown', 'Tab'];

        testMovies.forEach((movie) => {
          nonNavigationKeys.forEach((key) => {
            const onClickHandler = jest.fn();
            const { unmount } = render(
              <MovieCard movie={movie} onClick={onClickHandler} />
            );

            const card = screen.getByRole('article');
            fireEvent.keyDown(card, { key });

            // EXPECTED: onClick callback is NOT invoked
            expect(onClickHandler).not.toHaveBeenCalled();

            unmount();
          });
        });
      });
    });
  });

  describe('Preservation Property Tests: Non-Navigation Interactions', () => {
    /**
     * **Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5**
     * 
     * Property 2: Preservation - Non-Navigation Interactions Remain Unchanged
     * 
     * These tests verify that for all inputs where the bug condition does NOT hold,
     * the fixed function produces the same result as the original function.
     * 
     * Observation-first methodology: Observe behavior on UNFIXED code for non-buggy inputs
     * and capture those patterns in property-based tests.
     * 
     * Expected behavior on UNFIXED code (baseline to preserve):
     * - Hover state displays movie title and rating overlay
     * - Watchlist badges (✓) display correctly in top-right corner
     * - Focus ring (Netflix red) displays when card is keyboard-focused
     * - Scale and shadow hover effects work correctly
     * - Poster images display correctly with TMDb URLs
     * - For all keyboard inputs except Enter, no navigation occurs
     * - For all non-click interactions, component state remains unchanged
     */

    describe('Property: Hover State Preservation', () => {
      /**
       * Property: For all hover interactions on non-focused cards,
       * overlay displays with title and rating
       */
      it('should display hover overlay with title for all movies', () => {
        // Generate multiple test cases for stronger guarantees
        const testMovies = [
          { id: 1, title: 'Inception', poster_path: '/path1.jpg', release_date: '2010-07-16', vote_average: 8.8 },
          { id: 2, title: 'The Dark Knight', poster_path: '/path2.jpg', release_date: '2008-07-18', vote_average: 9.0 },
          { id: 3, title: 'Interstellar', poster_path: '/path3.jpg', release_date: '2014-11-07', vote_average: 8.6 },
          { id: 4, title: 'Pulp Fiction', poster_path: '/path4.jpg', release_date: '1994-10-14', vote_average: 8.9 },
          { id: 5, title: 'Forrest Gump', poster_path: '/path5.jpg', release_date: '1994-07-06', vote_average: 8.8 },
        ];

        testMovies.forEach((movie) => {
          const onClickHandler = jest.fn();
          const { unmount } = render(
            <MovieCard movie={movie} onClick={onClickHandler} />
          );

          const card = screen.getByRole('article');
          
          // Before hover: title should not be visible
          expect(screen.queryByText(movie.title)).not.toBeInTheDocument();

          // On hover: title should be visible
          fireEvent.mouseEnter(card);
          expect(screen.getByText(movie.title)).toBeInTheDocument();

          // After mouse leave: title should not be visible
          fireEvent.mouseLeave(card);
          expect(screen.queryByText(movie.title)).not.toBeInTheDocument();

          unmount();
        });
      });

      it('should display hover overlay with rating for all movies with vote_average', () => {
        // Generate multiple test cases with different ratings
        const testMovies = [
          { id: 1, title: 'Movie A', poster_path: '/path1.jpg', release_date: '2020-01-01', vote_average: 5.0 },
          { id: 2, title: 'Movie B', poster_path: '/path2.jpg', release_date: '2020-01-02', vote_average: 7.5 },
          { id: 3, title: 'Movie C', poster_path: '/path3.jpg', release_date: '2020-01-03', vote_average: 9.5 },
          { id: 4, title: 'Movie D', poster_path: '/path4.jpg', release_date: '2020-01-04', vote_average: 8.0 },
        ];

        testMovies.forEach((movie) => {
          const onClickHandler = jest.fn();
          const { unmount } = render(
            <MovieCard movie={movie} onClick={onClickHandler} />
          );

          const card = screen.getByRole('article');
          
          // Before hover: rating should not be visible
          expect(screen.queryByText(/\/10/)).not.toBeInTheDocument();

          // On hover: rating should be visible (use regex to match across elements)
          fireEvent.mouseEnter(card);
          expect(screen.getByText(new RegExp(`${movie.vote_average}`))).toBeInTheDocument();
          expect(screen.getByText(/\/10/)).toBeInTheDocument();

          // After mouse leave: rating should not be visible
          fireEvent.mouseLeave(card);
          expect(screen.queryByText(/\/10/)).not.toBeInTheDocument();

          unmount();
        });
      });

      it('should preserve hover state across multiple hover/leave cycles', () => {
        const onClickHandler = jest.fn();
        render(<MovieCard movie={mockMovie} onClick={onClickHandler} />);

        const card = screen.getByRole('article');

        // Cycle 1: hover and leave
        fireEvent.mouseEnter(card);
        expect(screen.getByText('Inception')).toBeInTheDocument();
        fireEvent.mouseLeave(card);
        expect(screen.queryByText('Inception')).not.toBeInTheDocument();

        // Cycle 2: hover and leave again
        fireEvent.mouseEnter(card);
        expect(screen.getByText('Inception')).toBeInTheDocument();
        fireEvent.mouseLeave(card);
        expect(screen.queryByText('Inception')).not.toBeInTheDocument();

        // Cycle 3: hover and leave once more
        fireEvent.mouseEnter(card);
        expect(screen.getByText('Inception')).toBeInTheDocument();
        fireEvent.mouseLeave(card);
        expect(screen.queryByText('Inception')).not.toBeInTheDocument();
      });
    });

    describe('Property: Watchlist Badge Preservation', () => {
      /**
       * Property: For all watchlist states, badge displays or hides correctly
       */
      it('should display watchlist badge for all movies in watchlist', () => {
        // Generate multiple test cases
        const testMovies = [
          { id: 1, title: 'Movie 1', poster_path: '/path1.jpg', release_date: '2020-01-01' },
          { id: 2, title: 'Movie 2', poster_path: '/path2.jpg', release_date: '2020-01-02' },
          { id: 3, title: 'Movie 3', poster_path: '/path3.jpg', release_date: '2020-01-03' },
          { id: 4, title: 'Movie 4', poster_path: '/path4.jpg', release_date: '2020-01-04' },
          { id: 5, title: 'Movie 5', poster_path: '/path5.jpg', release_date: '2020-01-05' },
        ];

        testMovies.forEach((movie) => {
          const onClickHandler = jest.fn();
          const { unmount } = render(
            <MovieCard movie={movie} onClick={onClickHandler} isInWatchlist={true} />
          );

          // Badge should be visible
          expect(screen.getByText('✓')).toBeInTheDocument();

          unmount();
        });
      });

      it('should not display watchlist badge for movies not in watchlist', () => {
        // Generate multiple test cases
        const testMovies = [
          { id: 1, title: 'Movie 1', poster_path: '/path1.jpg', release_date: '2020-01-01' },
          { id: 2, title: 'Movie 2', poster_path: '/path2.jpg', release_date: '2020-01-02' },
          { id: 3, title: 'Movie 3', poster_path: '/path3.jpg', release_date: '2020-01-03' },
          { id: 4, title: 'Movie 4', poster_path: '/path4.jpg', release_date: '2020-01-04' },
        ];

        testMovies.forEach((movie) => {
          const onClickHandler = jest.fn();
          const { unmount } = render(
            <MovieCard movie={movie} onClick={onClickHandler} isInWatchlist={false} />
          );

          // Badge should not be visible
          expect(screen.queryByText('✓')).not.toBeInTheDocument();

          unmount();
        });
      });

      it('should preserve watchlist badge visibility across hover states', () => {
        const onClickHandler = jest.fn();
        render(
          <MovieCard
            movie={mockMovie}
            onClick={onClickHandler}
            isInWatchlist={true}
          />
        );

        const card = screen.getByRole('article');

        // Badge visible before hover
        expect(screen.getByText('✓')).toBeInTheDocument();

        // Badge visible during hover
        fireEvent.mouseEnter(card);
        expect(screen.getByText('✓')).toBeInTheDocument();

        // Badge visible after hover
        fireEvent.mouseLeave(card);
        expect(screen.getByText('✓')).toBeInTheDocument();
      });
    });

    describe('Property: Focus Ring Preservation', () => {
      /**
       * Property: Focus ring (Netflix red) displays when card is keyboard-focused
       */
      it('should have focus ring classes for keyboard navigation', () => {
        const onClickHandler = jest.fn();
        render(<MovieCard movie={mockMovie} onClick={onClickHandler} />);

        const card = screen.getByRole('article');
        const className = card.className;

        // Should have focus ring styling
        expect(className).toContain('focus:ring-2');
        expect(className).toContain('focus:ring-netflix-red');
      });

      it('should maintain focus ring styling for all movies', () => {
        // Generate multiple test cases
        const testMovies = [
          { id: 1, title: 'Movie 1', poster_path: '/path1.jpg', release_date: '2020-01-01' },
          { id: 2, title: 'Movie 2', poster_path: '/path2.jpg', release_date: '2020-01-02' },
          { id: 3, title: 'Movie 3', poster_path: '/path3.jpg', release_date: '2020-01-03' },
        ];

        testMovies.forEach((movie) => {
          const onClickHandler = jest.fn();
          const { unmount } = render(
            <MovieCard movie={movie} onClick={onClickHandler} />
          );

          const card = screen.getByRole('article');
          const className = card.className;

          expect(className).toContain('focus:ring-2');
          expect(className).toContain('focus:ring-netflix-red');

          unmount();
        });
      });
    });

    describe('Property: Scale and Shadow Hover Effects Preservation', () => {
      /**
       * Property: Scale and shadow hover effects work correctly
       */
      it('should have hover scale effect classes', () => {
        const onClickHandler = jest.fn();
        render(<MovieCard movie={mockMovie} onClick={onClickHandler} />);

        const card = screen.getByRole('article');
        const className = card.className;

        // Should have hover scale effect
        expect(className).toContain('hover:scale-105');
      });

      it('should have hover shadow effect classes', () => {
        const onClickHandler = jest.fn();
        render(<MovieCard movie={mockMovie} onClick={onClickHandler} />);

        const card = screen.getByRole('article');
        const className = card.className;

        // Should have hover shadow effect
        expect(className).toContain('hover:shadow-2xl');
        expect(className).toContain('hover:shadow-netflix-red/50');
      });

      it('should maintain hover effects for all movies', () => {
        // Generate multiple test cases
        const testMovies = [
          { id: 1, title: 'Movie 1', poster_path: '/path1.jpg', release_date: '2020-01-01' },
          { id: 2, title: 'Movie 2', poster_path: '/path2.jpg', release_date: '2020-01-02' },
          { id: 3, title: 'Movie 3', poster_path: '/path3.jpg', release_date: '2020-01-03' },
          { id: 4, title: 'Movie 4', poster_path: '/path4.jpg', release_date: '2020-01-04' },
        ];

        testMovies.forEach((movie) => {
          const onClickHandler = jest.fn();
          const { unmount } = render(
            <MovieCard movie={movie} onClick={onClickHandler} />
          );

          const card = screen.getByRole('article');
          const className = card.className;

          expect(className).toContain('hover:scale-105');
          expect(className).toContain('hover:shadow-2xl');

          unmount();
        });
      });
    });

    describe('Property: Poster Image Display Preservation', () => {
      /**
       * Property: Poster images display correctly with TMDb URLs
       */
      it('should display poster images with correct TMDb URL format for all movies', () => {
        // Generate multiple test cases with different poster paths
        const testMovies = [
          { id: 1, title: 'Movie 1', poster_path: '/path1.jpg', release_date: '2020-01-01' },
          { id: 2, title: 'Movie 2', poster_path: '/path2.jpg', release_date: '2020-01-02' },
          { id: 3, title: 'Movie 3', poster_path: '/path3.jpg', release_date: '2020-01-03' },
          { id: 4, title: 'Movie 4', poster_path: '/path4.jpg', release_date: '2020-01-04' },
        ];

        testMovies.forEach((movie) => {
          const onClickHandler = jest.fn();
          const { unmount } = render(
            <MovieCard movie={movie} onClick={onClickHandler} />
          );

          const image = screen.getByAltText(movie.title) as HTMLImageElement;
          expect(image).toBeInTheDocument();
          expect(image.src).toContain('image.tmdb.org');
          expect(image.src).toContain(movie.poster_path);

          unmount();
        });
      });

      it('should display fallback for movies without poster images', () => {
        const movieWithoutPoster: Movie & { vote_average?: number } = {
          id: 1,
          title: 'No Poster Movie',
          poster_path: '',
          release_date: '2020-01-01',
        };

        const onClickHandler = jest.fn();
        render(
          <MovieCard movie={movieWithoutPoster} onClick={onClickHandler} />
        );

        // Should display fallback text
        expect(screen.getByText('No Image')).toBeInTheDocument();
      });
    });

    describe('Property: Non-Navigation Keyboard Input Preservation', () => {
      /**
       * Property: For all keyboard inputs except Enter, no navigation occurs
       */
      it('should not trigger onClick for any non-Enter keyboard input', () => {
        // Generate multiple test cases with different keyboard inputs
        const nonNavigationKeys = [
          'Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight',
          'Tab', 'Escape', 'Backspace', 'Delete', 'Shift', 'Control', 'Alt',
          'a', 'b', 'c', '1', '2', '3', '@', '#', '$',
        ];

        nonNavigationKeys.forEach((key) => {
          const onClickHandler = jest.fn();
          const { unmount } = render(
            <MovieCard movie={mockMovie} onClick={onClickHandler} />
          );

          const card = screen.getByRole('article');
          fireEvent.keyDown(card, { key });

          // Should NOT call onClick for non-Enter keys
          expect(onClickHandler).not.toHaveBeenCalled();

          unmount();
        });
      });

      it('should preserve component state for all non-Enter keyboard inputs', () => {
        // Generate multiple test cases
        const testMovies = [
          { id: 1, title: 'Movie 1', poster_path: '/path1.jpg', release_date: '2020-01-01', vote_average: 8.0 },
          { id: 2, title: 'Movie 2', poster_path: '/path2.jpg', release_date: '2020-01-02', vote_average: 7.5 },
          { id: 3, title: 'Movie 3', poster_path: '/path3.jpg', release_date: '2020-01-03', vote_average: 9.0 },
        ];

        const nonNavigationKeys = ['Space', 'ArrowUp', 'ArrowDown', 'Tab'];

        testMovies.forEach((movie) => {
          nonNavigationKeys.forEach((key) => {
            const onClickHandler = jest.fn();
            const { unmount } = render(
              <MovieCard movie={movie} onClick={onClickHandler} isInWatchlist={true} />
            );

            const card = screen.getByRole('article');

            // Component state before key press
            expect(screen.getByText('✓')).toBeInTheDocument();

            // Press non-navigation key
            fireEvent.keyDown(card, { key });

            // Component state should remain unchanged
            expect(screen.getByText('✓')).toBeInTheDocument();
            expect(onClickHandler).not.toHaveBeenCalled();

            unmount();
          });
        });
      });
    });

    describe('Property: Non-Click Interaction State Preservation', () => {
      /**
       * Property: For all non-click interactions, component state remains unchanged
       */
      it('should preserve component state for all non-click mouse interactions', () => {
        // Generate multiple test cases
        const testMovies = [
          { id: 1, title: 'Movie 1', poster_path: '/path1.jpg', release_date: '2020-01-01' },
          { id: 2, title: 'Movie 2', poster_path: '/path2.jpg', release_date: '2020-01-02' },
          { id: 3, title: 'Movie 3', poster_path: '/path3.jpg', release_date: '2020-01-03' },
        ];

        testMovies.forEach((movie) => {
          const onClickHandler = jest.fn();
          const { unmount } = render(
            <MovieCard movie={movie} onClick={onClickHandler} isInWatchlist={true} />
          );

          const card = screen.getByRole('article');

          // Initial state
          expect(screen.getByText('✓')).toBeInTheDocument();
          expect(screen.queryByText(movie.title)).not.toBeInTheDocument();

          // Mouse enter (hover)
          fireEvent.mouseEnter(card);
          expect(screen.getByText('✓')).toBeInTheDocument();
          expect(screen.getByText(movie.title)).toBeInTheDocument();

          // Mouse leave
          fireEvent.mouseLeave(card);
          expect(screen.getByText('✓')).toBeInTheDocument();
          expect(screen.queryByText(movie.title)).not.toBeInTheDocument();

          // onClick should not have been called
          expect(onClickHandler).not.toHaveBeenCalled();

          unmount();
        });
      });

      it('should preserve all visual states across multiple interactions', () => {
        const onClickHandler = jest.fn();
        render(
          <MovieCard
            movie={mockMovie}
            onClick={onClickHandler}
            isInWatchlist={true}
          />
        );

        const card = screen.getByRole('article');

        // Sequence of interactions
        fireEvent.mouseEnter(card);
        expect(screen.getByText('Inception')).toBeInTheDocument();
        expect(screen.getByText('✓')).toBeInTheDocument();

        fireEvent.mouseLeave(card);
        expect(screen.queryByText('Inception')).not.toBeInTheDocument();
        expect(screen.getByText('✓')).toBeInTheDocument();

        fireEvent.keyDown(card, { key: 'Space' });
        expect(screen.getByText('✓')).toBeInTheDocument();

        fireEvent.mouseEnter(card);
        expect(screen.getByText('Inception')).toBeInTheDocument();
        expect(screen.getByText('✓')).toBeInTheDocument();

        // onClick should never have been called
        expect(onClickHandler).not.toHaveBeenCalled();
      });
    });
  });
});
