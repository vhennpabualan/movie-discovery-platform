/**
 * MovieCard Preservation Property Tests
 * 
 * **Validates: Requirements 3.4, 3.5**
 * 
 * Property 2: Preservation - Non-Search Navigation Behavior
 * 
 * IMPORTANT: Follow observation-first methodology
 * Observe: Movie cards in trending/related sections navigate correctly on unfixed code
 * Observe: Keyboard navigation on movie cards works on unfixed code
 * Observe: Error handling displays errors correctly on unfixed code
 * 
 * These tests verify that for all inputs where the bug condition does NOT hold
 * (i.e., movie cards in trending/related sections, not SearchResultsList), the behavior
 * is preserved and continues to work correctly.
 * 
 * EXPECTED OUTCOME on UNFIXED code: Tests PASS (this confirms baseline behavior to preserve)
 * 
 * Preservation Requirements:
 * - Movie cards in other parts of the application (trending, related movies) must navigate correctly
 * - Keyboard navigation on movie cards must work
 * - Hover state display must work
 * - Watchlist badges must display correctly
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
const mockNavigateWithTransition = jest.fn();
jest.mock('@/lib/hooks/useViewTransition', () => ({
  useViewTransition: () => ({
    navigateWithTransition: mockNavigateWithTransition,
  }),
}));

describe('MovieCard - Preservation Property Tests', () => {
  const mockOnClick = jest.fn();

  const testMovies: Array<Movie & { vote_average?: number }> = [
    {
      id: 1,
      title: 'Inception',
      poster_path: '/inception.jpg',
      release_date: '2010-07-16',
      vote_average: 8.8,
    },
    {
      id: 2,
      title: 'The Dark Knight',
      poster_path: '/dark-knight.jpg',
      release_date: '2008-07-18',
      vote_average: 9.0,
    },
    {
      id: 3,
      title: 'Interstellar',
      poster_path: '/interstellar.jpg',
      release_date: '2014-11-07',
      vote_average: 8.6,
    },
    {
      id: 4,
      title: 'Pulp Fiction',
      poster_path: '/pulp-fiction.jpg',
      release_date: '1994-10-14',
      vote_average: 8.9,
    },
    {
      id: 5,
      title: 'Forrest Gump',
      poster_path: '/forrest-gump.jpg',
      release_date: '1994-07-06',
      vote_average: 8.8,
    },
  ];

  beforeEach(() => {
    mockOnClick.mockClear();
    mockNavigateWithTransition.mockClear();
  });

  describe('Property: MovieCard Click Handler Invokes onClick Callback', () => {
    /**
     * Property: For any click event on a MovieCard (in trending/related sections),
     * the onClick callback SHALL be invoked with the movie ID.
     * 
     * This is a preservation test - verifies that onClick callback is invoked
     * for movie cards in non-search contexts (trending, related movies).
     * 
     * EXPECTED OUTCOME on UNFIXED code: Test PASSES
     * (this confirms baseline behavior to preserve)
     */
    it('should invoke onClick callback when card is clicked', () => {
      render(<MovieCard movie={testMovies[0]} onClick={mockOnClick} />);

      const card = screen.getByRole('article');
      fireEvent.click(card);

      // EXPECTED: onClick callback is invoked with movie ID
      expect(mockOnClick).toHaveBeenCalledWith(testMovies[0].id);
      expect(mockOnClick).toHaveBeenCalledTimes(1);
    });

    it('should invoke onClick callback for all movies in carousel', () => {
      // Generate multiple test cases for stronger guarantees
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
      render(<MovieCard movie={testMovies[0]} onClick={mockOnClick} />);

      const card = screen.getByRole('article');

      // First click
      fireEvent.click(card);
      expect(mockOnClick).toHaveBeenCalledWith(testMovies[0].id);
      expect(mockOnClick).toHaveBeenCalledTimes(1);

      // Second click
      fireEvent.click(card);
      expect(mockOnClick).toHaveBeenCalledWith(testMovies[0].id);
      expect(mockOnClick).toHaveBeenCalledTimes(2);

      // Third click
      fireEvent.click(card);
      expect(mockOnClick).toHaveBeenCalledWith(testMovies[0].id);
      expect(mockOnClick).toHaveBeenCalledTimes(3);
    });

    it('should preserve onClick callback invocation across different movies', () => {
      // Test clicking different movies sequentially
      testMovies.slice(0, 3).forEach((movie) => {
        const onClickHandler = jest.fn();
        const { unmount } = render(
          <MovieCard movie={movie} onClick={onClickHandler} />
        );

        const card = screen.getByRole('article');
        fireEvent.click(card);

        // EXPECTED: onClick callback is invoked with correct movie ID
        expect(onClickHandler).toHaveBeenCalledWith(movie.id);

        unmount();
      });
    });
  });

  describe('Property: MovieCard Enter Key Handler Invokes onClick Callback', () => {
    /**
     * Property: For any Enter key press on a MovieCard (in trending/related sections),
     * the onClick callback SHALL be invoked with the movie ID.
     * 
     * This is a preservation test - verifies that keyboard navigation works
     * for movie cards in non-search contexts.
     * 
     * EXPECTED OUTCOME on UNFIXED code: Test PASSES
     * (this confirms baseline behavior to preserve)
     */
    it('should invoke onClick callback when Enter key is pressed', () => {
      render(<MovieCard movie={testMovies[0]} onClick={mockOnClick} />);

      const card = screen.getByRole('article');
      fireEvent.keyDown(card, { key: 'Enter' });

      // EXPECTED: onClick callback is invoked with movie ID
      expect(mockOnClick).toHaveBeenCalledWith(testMovies[0].id);
      expect(mockOnClick).toHaveBeenCalledTimes(1);
    });

    it('should invoke onClick callback for all movies on Enter key press', () => {
      // Generate multiple test cases for stronger guarantees
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
      render(<MovieCard movie={testMovies[0]} onClick={mockOnClick} />);

      const card = screen.getByRole('article');

      // First Enter key press
      fireEvent.keyDown(card, { key: 'Enter' });
      expect(mockOnClick).toHaveBeenCalledWith(testMovies[0].id);
      expect(mockOnClick).toHaveBeenCalledTimes(1);

      // Second Enter key press
      fireEvent.keyDown(card, { key: 'Enter' });
      expect(mockOnClick).toHaveBeenCalledWith(testMovies[0].id);
      expect(mockOnClick).toHaveBeenCalledTimes(2);

      // Third Enter key press
      fireEvent.keyDown(card, { key: 'Enter' });
      expect(mockOnClick).toHaveBeenCalledWith(testMovies[0].id);
      expect(mockOnClick).toHaveBeenCalledTimes(3);
    });

    it('should preserve Enter key navigation for all movies', () => {
      // Test Enter key on different movies sequentially
      testMovies.slice(0, 3).forEach((movie) => {
        const onClickHandler = jest.fn();
        const { unmount } = render(
          <MovieCard movie={movie} onClick={onClickHandler} />
        );

        const card = screen.getByRole('article');
        fireEvent.keyDown(card, { key: 'Enter' });

        // EXPECTED: onClick callback is invoked with correct movie ID
        expect(onClickHandler).toHaveBeenCalledWith(movie.id);

        unmount();
      });
    });
  });

  describe('Property: MovieCard Non-Enter Keys Do NOT Invoke onClick Callback', () => {
    /**
     * Property: For all keyboard inputs except Enter, the onClick callback
     * SHALL NOT be invoked on MovieCard.
     * 
     * This is a preservation test - verifies that only Enter key triggers
     * navigation, other keys do not.
     * 
     * EXPECTED OUTCOME on UNFIXED code: Test PASSES
     * (this confirms baseline behavior to preserve)
     */
    it('should not invoke onClick callback for non-Enter keys', () => {
      // Generate multiple test cases with different keyboard inputs
      const nonNavigationKeys = [
        'Space',
        'ArrowUp',
        'ArrowDown',
        'ArrowLeft',
        'ArrowRight',
        'Tab',
        'Escape',
        'Backspace',
        'Delete',
        'Shift',
        'Control',
        'Alt',
        'a',
        'b',
        'c',
        '1',
        '2',
        '3',
      ];

      nonNavigationKeys.forEach((key) => {
        const onClickHandler = jest.fn();
        const { unmount } = render(
          <MovieCard movie={testMovies[0]} onClick={onClickHandler} />
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

  describe('Property: MovieCard Hover State Preserved', () => {
    /**
     * Property: For any hover interaction on a MovieCard, the overlay
     * SHALL display with title and rating information.
     * 
     * This is a preservation test - verifies that hover state display
     * continues to work correctly.
     * 
     * EXPECTED OUTCOME on UNFIXED code: Test PASSES
     * (this confirms baseline behavior to preserve)
     */
    it('should display hover overlay with title for all movies', () => {
      // Generate multiple test cases for stronger guarantees
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
      testMovies.forEach((movie) => {
        const onClickHandler = jest.fn();
        const { unmount } = render(
          <MovieCard movie={movie} onClick={onClickHandler} />
        );

        const card = screen.getByRole('article');

        // Before hover: rating should not be visible
        expect(screen.queryByText(/\/10/)).not.toBeInTheDocument();

        // On hover: rating should be visible
        fireEvent.mouseEnter(card);
        if (movie.vote_average !== undefined) {
          expect(screen.getByText(new RegExp(`${movie.vote_average}`))).toBeInTheDocument();
          expect(screen.getByText(/\/10/)).toBeInTheDocument();
        }

        // After mouse leave: rating should not be visible
        fireEvent.mouseLeave(card);
        expect(screen.queryByText(/\/10/)).not.toBeInTheDocument();

        unmount();
      });
    });

    it('should preserve hover state across multiple hover/leave cycles', () => {
      const onClickHandler = jest.fn();
      render(<MovieCard movie={testMovies[0]} onClick={onClickHandler} />);

      const card = screen.getByRole('article');

      // Cycle 1: hover and leave
      fireEvent.mouseEnter(card);
      expect(screen.getByText(testMovies[0].title)).toBeInTheDocument();
      fireEvent.mouseLeave(card);
      expect(screen.queryByText(testMovies[0].title)).not.toBeInTheDocument();

      // Cycle 2: hover and leave again
      fireEvent.mouseEnter(card);
      expect(screen.getByText(testMovies[0].title)).toBeInTheDocument();
      fireEvent.mouseLeave(card);
      expect(screen.queryByText(testMovies[0].title)).not.toBeInTheDocument();

      // Cycle 3: hover and leave once more
      fireEvent.mouseEnter(card);
      expect(screen.getByText(testMovies[0].title)).toBeInTheDocument();
      fireEvent.mouseLeave(card);
      expect(screen.queryByText(testMovies[0].title)).not.toBeInTheDocument();
    });
  });

  describe('Property: MovieCard Watchlist Badge Preserved', () => {
    /**
     * Property: For all watchlist states, the watchlist badge
     * SHALL display or hide correctly.
     * 
     * This is a preservation test - verifies that watchlist badge
     * display continues to work correctly.
     * 
     * EXPECTED OUTCOME on UNFIXED code: Test PASSES
     * (this confirms baseline behavior to preserve)
     */
    it('should display watchlist badge for all movies in watchlist', () => {
      // Generate multiple test cases
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

    it('should preserve watchlist badge display across different movies', () => {
      // Test watchlist badge for different movies
      testMovies.slice(0, 3).forEach((movie) => {
        const onClickHandler = jest.fn();

        // Test with watchlist
        const { unmount: unmount1 } = render(
          <MovieCard movie={movie} onClick={onClickHandler} isInWatchlist={true} />
        );
        expect(screen.getByText('✓')).toBeInTheDocument();
        unmount1();

        // Test without watchlist
        const { unmount: unmount2 } = render(
          <MovieCard movie={movie} onClick={onClickHandler} isInWatchlist={false} />
        );
        expect(screen.queryByText('✓')).not.toBeInTheDocument();
        unmount2();
      });
    });
  });

  describe('Property: MovieCard Accessibility Preserved', () => {
    /**
     * Property: For all MovieCard instances, accessibility features
     * SHALL be preserved including aria-label, tabindex, and role.
     * 
     * This is a preservation test - verifies that accessibility
     * continues to work correctly.
     * 
     * EXPECTED OUTCOME on UNFIXED code: Test PASSES
     * (this confirms baseline behavior to preserve)
     */
    it('should have proper aria-label for all movies', () => {
      // Generate multiple test cases
      testMovies.forEach((movie) => {
        const onClickHandler = jest.fn();
        const { unmount } = render(
          <MovieCard movie={movie} onClick={onClickHandler} />
        );

        const card = screen.getByRole('article');
        const releaseYear = movie.release_date ? new Date(movie.release_date).getFullYear() : 'Unknown';
        expect(card).toHaveAttribute(
          'aria-label',
          `${movie.title}, released ${releaseYear}`
        );

        unmount();
      });
    });

    it('should have tabindex=0 for keyboard navigation', () => {
      // Generate multiple test cases
      testMovies.forEach((movie) => {
        const onClickHandler = jest.fn();
        const { unmount } = render(
          <MovieCard movie={movie} onClick={onClickHandler} />
        );

        const card = screen.getByRole('article');
        expect(card).toHaveAttribute('tabindex', '0');

        unmount();
      });
    });

    it('should have role="article" for semantic HTML', () => {
      // Generate multiple test cases
      testMovies.forEach((movie) => {
        const onClickHandler = jest.fn();
        const { unmount } = render(
          <MovieCard movie={movie} onClick={onClickHandler} />
        );

        const card = screen.getByRole('article');
        expect(card).toHaveAttribute('role', 'article');

        unmount();
      });
    });

    it('should preserve accessibility features across different movies', () => {
      // Test accessibility for different movies
      testMovies.slice(0, 3).forEach((movie) => {
        const onClickHandler = jest.fn();
        const { unmount } = render(
          <MovieCard movie={movie} onClick={onClickHandler} />
        );

        const card = screen.getByRole('article');

        // All accessibility features should be present
        expect(card).toHaveAttribute('role', 'article');
        expect(card).toHaveAttribute('tabindex', '0');
        expect(card).toHaveAttribute('aria-label');

        unmount();
      });
    });
  });

  describe('Property: MovieCard Image Display Preserved', () => {
    /**
     * Property: For all MovieCard instances, poster images
     * SHALL display correctly with proper TMDb URLs.
     * 
     * This is a preservation test - verifies that image display
     * continues to work correctly.
     * 
     * EXPECTED OUTCOME on UNFIXED code: Test PASSES
     * (this confirms baseline behavior to preserve)
     */
    it('should render movie poster image for all movies', () => {
      // Generate multiple test cases
      testMovies.forEach((movie) => {
        const onClickHandler = jest.fn();
        const { unmount } = render(
          <MovieCard movie={movie} onClick={onClickHandler} />
        );

        const image = screen.getByAltText(movie.title);
        expect(image).toBeInTheDocument();

        unmount();
      });
    });

    it('should construct correct TMDb image URL for all movies', () => {
      // Generate multiple test cases
      testMovies.forEach((movie) => {
        const onClickHandler = jest.fn();
        const { unmount } = render(
          <MovieCard movie={movie} onClick={onClickHandler} />
        );

        const image = screen.getByAltText(movie.title) as HTMLImageElement;
        expect(image.src).toContain('image.tmdb.org');
        expect(image.src).toContain(movie.poster_path);

        unmount();
      });
    });

    it('should handle movies without poster_path', () => {
      const movieWithoutPoster: Movie & { vote_average?: number } = {
        id: 99,
        title: 'Unknown Movie',
        poster_path: null,
        release_date: '2020-01-01',
        vote_average: 7.5,
      };

      const onClickHandler = jest.fn();
      render(<MovieCard movie={movieWithoutPoster} onClick={onClickHandler} />);

      // Should display placeholder instead of image
      expect(screen.getByText('No Image')).toBeInTheDocument();
    });
  });
});
