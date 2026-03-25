/**
 * SearchResultsList Bug Condition Exploration Test - Navigation
 * 
 * **Validates: Requirements 1.1, 1.2**
 * 
 * Property 1: Bug Condition - Search Navigation Double Call
 * 
 * CRITICAL: This test MUST FAIL on unfixed code - failure confirms the bug exists.
 * DO NOT attempt to fix the test or the code when it fails.
 * 
 * GOAL: Surface counterexamples that demonstrate the navigation bug exists
 * 
 * Bug Condition (from design.md):
 * - User clicks on a movie in SearchResultsList
 * - SearchResultsList.handleMovieClick calls navigateWithTransition
 * - MovieCard.handleClick ALSO calls navigateWithTransition
 * - Both are executed in sequence, causing double navigation
 * - This interrupts the View Transition and navigation fails silently
 * 
 * Expected Behavior:
 * - Navigation to /movies/[id] completes successfully
 * - View transition completes without interruption
 * - startViewTransition is called exactly once
 * 
 * EXPECTED OUTCOME on UNFIXED code: Test FAILS (this is correct - it proves the bug exists)
 * 
 * Counterexamples that will be found:
 * - "startViewTransition called twice, navigation fails"
 * - "Navigation interrupted by double call"
 * - "User remains on search page after clicking movie"
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SearchResultsList } from './SearchResultsList';
import { Movie } from '@/types';

// Mock Next.js Image component
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => {
    // eslint-disable-next-line jsx-a11y/alt-text
    return <img {...props} />;
  },
}));

// Mock useViewTransition hook to track calls
const mockNavigateWithTransition = jest.fn();
jest.mock('@/lib/hooks/useViewTransition', () => ({
  useViewTransition: () => ({
    navigateWithTransition: mockNavigateWithTransition,
  }),
}));

// Mock document.startViewTransition to track calls
const mockStartViewTransition = jest.fn((callback: () => void) => {
  callback();
  return {
    finished: Promise.resolve(),
    ready: Promise.resolve(),
    updateCallbackDone: Promise.resolve(),
  };
});

Object.defineProperty(document, 'startViewTransition', {
  value: mockStartViewTransition,
  writable: true,
  configurable: true,
});

describe('SearchResultsList - Bug Condition Exploration: Navigation', () => {
  const mockMovies: Movie[] = [
    {
      id: 1,
      title: 'Inception',
      poster_path: '/path/to/inception.jpg',
      release_date: '2010-07-16',
    },
    {
      id: 2,
      title: 'The Dark Knight',
      poster_path: '/path/to/dark-knight.jpg',
      release_date: '2008-07-18',
    },
    {
      id: 3,
      title: 'Interstellar',
      poster_path: '/path/to/interstellar.jpg',
      release_date: '2014-11-07',
    },
    {
      id: 4,
      title: 'Pulp Fiction',
      poster_path: '/path/to/pulp-fiction.jpg',
      release_date: '1994-10-14',
    },
    {
      id: 5,
      title: 'Forrest Gump',
      poster_path: '/path/to/forrest-gump.jpg',
      release_date: '1994-07-06',
    },
  ];

  beforeEach(() => {
    mockNavigateWithTransition.mockClear();
    mockStartViewTransition.mockClear();
  });

  describe('Property: Clicking Movie in SearchResultsList Navigates Successfully', () => {
    /**
     * Property: For any click event on a movie in SearchResultsList,
     * the navigation to /movies/[id] SHALL complete successfully with
     * a smooth view transition that completes without being interrupted.
     * 
     * This test encodes the expected behavior from Requirements 2.1, 2.2
     * When this test passes, it confirms the navigation bug is fixed.
     * When this test fails on unfixed code, it confirms the bug exists.
     * 
     * EXPECTED OUTCOME on UNFIXED code: Test FAILS
     * Counterexample: "startViewTransition called twice, navigation fails"
     */
    it('should navigate to /movies/[id] when clicking a movie in search results', async () => {
      render(<SearchResultsList results={mockMovies} />);

      // Find and click the first movie card
      const movieCards = screen.getAllByRole('article');
      const firstMovieCard = movieCards[0];

      fireEvent.click(firstMovieCard);

      // EXPECTED: navigateWithTransition is called exactly once with correct path
      await waitFor(() => {
        expect(mockNavigateWithTransition).toHaveBeenCalledWith('/movies/1');
        expect(mockNavigateWithTransition).toHaveBeenCalledTimes(1);
      });
    });

    it('should call navigateWithTransition exactly once per click (not twice)', async () => {
      render(<SearchResultsList results={mockMovies} />);

      const movieCards = screen.getAllByRole('article');
      const firstMovieCard = movieCards[0];

      fireEvent.click(firstMovieCard);

      // CRITICAL: navigateWithTransition should be called exactly once
      // On unfixed code, this will be called twice (double navigation bug)
      await waitFor(() => {
        expect(mockNavigateWithTransition).toHaveBeenCalledTimes(1);
      });
    });

    it('should navigate to correct movie ID for all movies in search results', async () => {
      // Generate multiple test cases for stronger guarantees
      render(<SearchResultsList results={mockMovies} />);

      const movieCards = screen.getAllByRole('article');

      // Test clicking each movie
      for (let i = 0; i < movieCards.length; i++) {
        mockNavigateWithTransition.mockClear();

        fireEvent.click(movieCards[i]);

        const expectedMovieId = mockMovies[i].id;
        const expectedPath = `/movies/${expectedMovieId}`;

        // EXPECTED: navigateWithTransition is called exactly once with correct path
        await waitFor(() => {
          expect(mockNavigateWithTransition).toHaveBeenCalledWith(expectedPath);
          expect(mockNavigateWithTransition).toHaveBeenCalledTimes(1);
        });
      }
    });

    it('should navigate with correct path format /movies/[id] for all movies', async () => {
      render(<SearchResultsList results={mockMovies} />);

      const movieCards = screen.getAllByRole('article');

      movieCards.forEach((card, index) => {
        mockNavigateWithTransition.mockClear();

        fireEvent.click(card);

        // EXPECTED: Path format is /movies/{id}
        expect(mockNavigateWithTransition).toHaveBeenCalledWith(
          expect.stringMatching(/^\/movies\/\d+$/)
        );
        expect(mockNavigateWithTransition).toHaveBeenCalledTimes(1);
      });
    });

    it('should handle multiple sequential clicks on different movies', async () => {
      render(<SearchResultsList results={mockMovies} />);

      const movieCards = screen.getAllByRole('article');

      // Click first movie
      mockNavigateWithTransition.mockClear();
      fireEvent.click(movieCards[0]);
      await waitFor(() => {
        expect(mockNavigateWithTransition).toHaveBeenCalledWith('/movies/1');
        expect(mockNavigateWithTransition).toHaveBeenCalledTimes(1);
      });

      // Click second movie
      mockNavigateWithTransition.mockClear();
      fireEvent.click(movieCards[1]);
      await waitFor(() => {
        expect(mockNavigateWithTransition).toHaveBeenCalledWith('/movies/2');
        expect(mockNavigateWithTransition).toHaveBeenCalledTimes(1);
      });

      // Click third movie
      mockNavigateWithTransition.mockClear();
      fireEvent.click(movieCards[2]);
      await waitFor(() => {
        expect(mockNavigateWithTransition).toHaveBeenCalledWith('/movies/3');
        expect(mockNavigateWithTransition).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('Property: View Transition Called Exactly Once', () => {
    /**
     * Property: For any click event on a movie in SearchResultsList,
     * startViewTransition SHALL be called exactly once, allowing the
     * transition to complete successfully without interruption.
     * 
     * This test encodes the expected behavior from Requirements 2.2
     * When this test passes, it confirms the View Transition bug is fixed.
     * When this test fails on unfixed code, it confirms the bug exists.
     * 
     * EXPECTED OUTCOME on UNFIXED code: Test FAILS
     * Counterexample: "startViewTransition called twice"
     */
    it('should call startViewTransition exactly once when clicking a movie', async () => {
      render(<SearchResultsList results={mockMovies} />);

      const movieCards = screen.getAllByRole('article');
      const firstMovieCard = movieCards[0];

      fireEvent.click(firstMovieCard);

      // CRITICAL: startViewTransition should be called exactly once
      // On unfixed code, this will be called twice (double navigation bug)
      await waitFor(() => {
        expect(mockStartViewTransition).toHaveBeenCalledTimes(1);
      });
    });

    it('should call startViewTransition exactly once for all movies', async () => {
      render(<SearchResultsList results={mockMovies} />);

      const movieCards = screen.getAllByRole('article');

      for (let i = 0; i < movieCards.length; i++) {
        mockStartViewTransition.mockClear();

        fireEvent.click(movieCards[i]);

        // EXPECTED: startViewTransition is called exactly once
        await waitFor(() => {
          expect(mockStartViewTransition).toHaveBeenCalledTimes(1);
        });
      }
    });

    it('should not call startViewTransition multiple times for single click', async () => {
      render(<SearchResultsList results={mockMovies} />);

      const movieCards = screen.getAllByRole('article');
      const firstMovieCard = movieCards[0];

      mockStartViewTransition.mockClear();
      fireEvent.click(firstMovieCard);

      // CRITICAL: Verify startViewTransition is NOT called twice
      // This is the core of the bug - double navigation causes double calls
      await waitFor(() => {
        expect(mockStartViewTransition).toHaveBeenCalledTimes(1);
        expect(mockStartViewTransition).not.toHaveBeenCalledTimes(2);
      });
    });

    it('should call startViewTransition with callback that navigates', async () => {
      render(<SearchResultsList results={mockMovies} />);

      const movieCards = screen.getAllByRole('article');
      const firstMovieCard = movieCards[0];

      fireEvent.click(firstMovieCard);

      // EXPECTED: startViewTransition is called with a callback function
      await waitFor(() => {
        expect(mockStartViewTransition).toHaveBeenCalledWith(
          expect.any(Function)
        );
      });
    });
  });

  describe('Property: Navigation Completes Without Interruption', () => {
    /**
     * Property: For any click event on a movie in SearchResultsList,
     * the navigation SHALL complete without being interrupted by
     * duplicate navigation attempts.
     * 
     * This test encodes the expected behavior from Requirements 2.1, 2.2
     * When this test passes, it confirms the navigation completes successfully.
     * When this test fails on unfixed code, it confirms the bug exists.
     * 
     * EXPECTED OUTCOME on UNFIXED code: Test FAILS
     * Counterexample: "Navigation interrupted by double call"
     */
    it('should complete navigation without interruption for single click', async () => {
      render(<SearchResultsList results={mockMovies} />);

      const movieCards = screen.getAllByRole('article');
      const firstMovieCard = movieCards[0];

      fireEvent.click(firstMovieCard);

      // EXPECTED: navigateWithTransition is called exactly once
      // If called twice, the first navigation is interrupted
      await waitFor(() => {
        expect(mockNavigateWithTransition).toHaveBeenCalledTimes(1);
      });

      // EXPECTED: startViewTransition is called exactly once
      // If called twice, the first transition is interrupted
      expect(mockStartViewTransition).toHaveBeenCalledTimes(1);
    });

    it('should not have duplicate navigation calls for any movie', async () => {
      render(<SearchResultsList results={mockMovies} />);

      const movieCards = screen.getAllByRole('article');

      for (let i = 0; i < movieCards.length; i++) {
        mockNavigateWithTransition.mockClear();
        mockStartViewTransition.mockClear();

        fireEvent.click(movieCards[i]);

        // CRITICAL: Verify no duplicate calls
        // On unfixed code, both SearchResultsList and MovieCard call navigate
        await waitFor(() => {
          expect(mockNavigateWithTransition).toHaveBeenCalledTimes(1);
          expect(mockStartViewTransition).toHaveBeenCalledTimes(1);
        });
      }
    });

    it('should maintain single navigation call across multiple clicks', async () => {
      render(<SearchResultsList results={mockMovies} />);

      const movieCards = screen.getAllByRole('article');

      // Click multiple movies sequentially
      for (let i = 0; i < 3; i++) {
        mockNavigateWithTransition.mockClear();
        mockStartViewTransition.mockClear();

        fireEvent.click(movieCards[i]);

        // EXPECTED: Each click results in exactly one navigation call
        await waitFor(() => {
          expect(mockNavigateWithTransition).toHaveBeenCalledTimes(1);
          expect(mockStartViewTransition).toHaveBeenCalledTimes(1);
        });
      }
    });
  });

  describe('Property: Correct Movie ID Navigation', () => {
    /**
     * Property: For any click event on a movie in SearchResultsList,
     * the navigation SHALL be to the correct movie ID (/movies/[id]).
     * 
     * This test encodes the expected behavior from Requirements 2.1
     * When this test passes, it confirms navigation goes to correct movie.
     * When this test fails on unfixed code, it confirms the bug exists.
     */
    it('should navigate to correct movie ID for each movie in results', async () => {
      render(<SearchResultsList results={mockMovies} />);

      const movieCards = screen.getAllByRole('article');

      // Test each movie
      for (let i = 0; i < mockMovies.length; i++) {
        mockNavigateWithTransition.mockClear();

        fireEvent.click(movieCards[i]);

        const expectedMovieId = mockMovies[i].id;
        const expectedPath = `/movies/${expectedMovieId}`;

        // EXPECTED: navigateWithTransition is called with correct movie ID
        await waitFor(() => {
          expect(mockNavigateWithTransition).toHaveBeenCalledWith(expectedPath);
        });
      }
    });

    it('should navigate to /movies/1 when clicking first movie', async () => {
      render(<SearchResultsList results={mockMovies} />);

      const movieCards = screen.getAllByRole('article');
      fireEvent.click(movieCards[0]);

      await waitFor(() => {
        expect(mockNavigateWithTransition).toHaveBeenCalledWith('/movies/1');
      });
    });

    it('should navigate to /movies/2 when clicking second movie', async () => {
      render(<SearchResultsList results={mockMovies} />);

      const movieCards = screen.getAllByRole('article');
      fireEvent.click(movieCards[1]);

      await waitFor(() => {
        expect(mockNavigateWithTransition).toHaveBeenCalledWith('/movies/2');
      });
    });

    it('should navigate to /movies/3 when clicking third movie', async () => {
      render(<SearchResultsList results={mockMovies} />);

      const movieCards = screen.getAllByRole('article');
      fireEvent.click(movieCards[2]);

      await waitFor(() => {
        expect(mockNavigateWithTransition).toHaveBeenCalledWith('/movies/3');
      });
    });

    it('should navigate to /movies/4 when clicking fourth movie', async () => {
      render(<SearchResultsList results={mockMovies} />);

      const movieCards = screen.getAllByRole('article');
      fireEvent.click(movieCards[3]);

      await waitFor(() => {
        expect(mockNavigateWithTransition).toHaveBeenCalledWith('/movies/4');
      });
    });

    it('should navigate to /movies/5 when clicking fifth movie', async () => {
      render(<SearchResultsList results={mockMovies} />);

      const movieCards = screen.getAllByRole('article');
      fireEvent.click(movieCards[4]);

      await waitFor(() => {
        expect(mockNavigateWithTransition).toHaveBeenCalledWith('/movies/5');
      });
    });
  });
});
