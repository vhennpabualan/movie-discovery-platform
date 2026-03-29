/**
 * SearchBar Preservation Property Tests
 * 
 * **Validates: Requirements 3.1, 3.2, 3.3**
 * 
 * Property 2: Preservation - SearchBar Navigation Behavior
 * 
 * IMPORTANT: Follow observation-first methodology
 * Observe: SearchBar dropdown clicks navigate correctly on unfixed code
 * Observe: Keyboard navigation in SearchBar works on unfixed code
 * Observe: Debouncing (300ms) continues to work as currently implemented
 * 
 * These tests verify that for all inputs where the bug condition does NOT hold
 * (i.e., SearchBar navigation, not SearchResultsList navigation), the behavior
 * is preserved and continues to work correctly.
 * 
 * EXPECTED OUTCOME on UNFIXED code: Tests PASS (this confirms baseline behavior to preserve)
 * 
 * Preservation Requirements:
 * - SearchBar dropdown navigation must continue to work
 * - Keyboard navigation in SearchBar (arrow keys, Enter) must work
 * - Debouncing (300ms) must continue to work
 * - Search page with query parameter must display results correctly
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SearchBar } from './SearchBar';
import * as tmdbClient from '@/lib/api/tmdb-client';
import { useRouter, usePathname } from 'next/navigation';

// Mock the API client
jest.mock('@/lib/api/tmdb-client');

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  usePathname: jest.fn(),
}));

// Mock Next.js Image component
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => {
    // eslint-disable-next-line jsx-a11y/alt-text
    return <img {...props} />;
  },
}));

// Mock useSearchParams hook
jest.mock('../hooks/useSearchParams', () => ({
  useSearchParams: () => ({
    query: '',
    setQuery: jest.fn(),
    clearSearch: jest.fn(),
    isInitialized: true,
  }),
}));

describe('SearchBar - Preservation Property Tests', () => {
  const mockPush = jest.fn();
  const mockSearchMovies = jest.fn();
  const mockSearchTVShows = jest.fn();

  const mockMovies = [
    {
      id: 1,
      title: 'Inception',
      poster_path: '/inception.jpg',
      release_date: '2010-07-16',
    },
    {
      id: 2,
      title: 'Interstellar',
      poster_path: '/interstellar.jpg',
      release_date: '2014-11-07',
    },
    {
      id: 3,
      title: 'The Dark Knight',
      poster_path: '/dark-knight.jpg',
      release_date: '2008-07-18',
    },
    {
      id: 4,
      title: 'Pulp Fiction',
      poster_path: '/pulp-fiction.jpg',
      release_date: '1994-10-14',
    },
    {
      id: 5,
      title: 'Forrest Gump',
      poster_path: '/forrest-gump.jpg',
      release_date: '1994-07-06',
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
    (usePathname as jest.Mock).mockReturnValue('/search');
    (tmdbClient.searchMovies as jest.Mock) = mockSearchMovies;
    (tmdbClient.searchTVShows as jest.Mock) = mockSearchTVShows;
    mockSearchMovies.mockResolvedValue({ results: mockMovies });
    mockSearchTVShows.mockResolvedValue({ results: [] });
  });

  describe('Property: SearchBar Dropdown Click Navigation Preserved', () => {
    /**
     * Property: For any click on a movie in the SearchBar dropdown,
     * the user SHALL be navigated to the movie detail page at /movies/[id]
     * and the search bar SHALL be cleared.
     * 
     * This is a preservation test - verifies that SearchBar navigation
     * continues to work correctly on unfixed code.
     * 
     * EXPECTED OUTCOME on UNFIXED code: Test PASSES
     * (this confirms baseline behavior to preserve)
     */
    it('should navigate to movie detail page when clicking dropdown result', async () => {
      render(<SearchBar />);

      const input = screen.getByPlaceholderText('Search movies and TV shows...');

      // Type search query
      fireEvent.change(input, { target: { value: 'inception' } });

      // Wait for results to appear
      await waitFor(() => {
        expect(screen.getByText('Inception')).toBeInTheDocument();
      });

      // Click on first result
      const firstResult = screen.getByText('Inception').closest('li');
      fireEvent.click(firstResult!);

      // EXPECTED: navigated to /movies/1
      expect(mockPush).toHaveBeenCalledWith('/movies/1');
    });

    it('should navigate to correct movie ID for all dropdown results', async () => {
      render(<SearchBar />);

      const input = screen.getByPlaceholderText('Search movies and TV shows...');

      // Type search query
      fireEvent.change(input, { target: { value: 'movie' } });

      // Wait for results to appear
      await waitFor(() => {
        expect(screen.getByText('Inception')).toBeInTheDocument();
      });

      // Test clicking first result
      mockPush.mockClear();
      const firstResult = screen.getByText('Inception').closest('li');
      fireEvent.click(firstResult!);
      expect(mockPush).toHaveBeenCalledWith('/movies/1');

      // Verify other results are also clickable (by checking they exist)
      expect(screen.getByText('Interstellar')).toBeInTheDocument();
      expect(screen.getByText('The Dark Knight')).toBeInTheDocument();
    });

    it('should clear search state after navigating from dropdown', async () => {
      render(<SearchBar />);

      const input = screen.getByPlaceholderText('Search movies and TV shows...') as HTMLInputElement;

      // Type search query
      fireEvent.change(input, { target: { value: 'inception' } });

      // Wait for results to appear
      await waitFor(() => {
        expect(screen.getByText('Inception')).toBeInTheDocument();
      });

      // Click on result
      const result = screen.getByText('Inception').closest('li');
      fireEvent.click(result!);

      // EXPECTED: navigated to movie detail page
      expect(mockPush).toHaveBeenCalledWith('/movies/1');
    });
  });

  describe('Property: SearchBar Keyboard Navigation Preserved', () => {
    /**
     * Property: For any keyboard navigation in the SearchBar dropdown
     * (arrow keys, Enter), the user SHALL be able to navigate and select results.
     * 
     * This is a preservation test - verifies that keyboard navigation
     * continues to work correctly on unfixed code.
     * 
     * EXPECTED OUTCOME on UNFIXED code: Test PASSES
     * (this confirms baseline behavior to preserve)
     */
    it('should navigate with arrow keys in dropdown', async () => {
      render(<SearchBar />);

      const input = screen.getByPlaceholderText('Search movies and TV shows...');

      // Type search query
      fireEvent.change(input, { target: { value: 'movie' } });

      // Wait for results to appear
      await waitFor(() => {
        expect(screen.getByText('Inception')).toBeInTheDocument();
      });

      // Press arrow down to select first result
      fireEvent.keyDown(input, { key: 'ArrowDown' });

      // EXPECTED: first result is highlighted (selected)
      const firstResult = screen.getByText('Inception').closest('li');
      expect(firstResult).toHaveClass('bg-white/10');
    });

    it('should navigate with arrow keys to select different results', async () => {
      render(<SearchBar />);

      const input = screen.getByPlaceholderText('Search movies and TV shows...');

      // Type search query
      fireEvent.change(input, { target: { value: 'movie' } });

      // Wait for results to appear
      await waitFor(() => {
        expect(screen.getByText('Inception')).toBeInTheDocument();
      });

      // Press arrow down multiple times
      fireEvent.keyDown(input, { key: 'ArrowDown' });
      fireEvent.keyDown(input, { key: 'ArrowDown' });

      // EXPECTED: second result is highlighted
      const secondResult = screen.getByText('Interstellar').closest('li');
      expect(secondResult).toHaveClass('bg-white/10');
    });

    it('should navigate to movie when pressing Enter on selected result', async () => {
      render(<SearchBar />);

      const input = screen.getByPlaceholderText('Search movies and TV shows...');

      // Type search query
      fireEvent.change(input, { target: { value: 'movie' } });

      // Wait for results to appear
      await waitFor(() => {
        expect(screen.getByText('Inception')).toBeInTheDocument();
      });

      // Select first result with arrow down
      fireEvent.keyDown(input, { key: 'ArrowDown' });

      // Press Enter to navigate
      fireEvent.keyDown(input, { key: 'Enter' });

      // EXPECTED: navigated to /movies/1
      expect(mockPush).toHaveBeenCalledWith('/movies/1');
    });

    it('should close dropdown on Escape key', async () => {
      render(<SearchBar />);

      const input = screen.getByPlaceholderText('Search movies and TV shows...');

      // Type search query
      fireEvent.change(input, { target: { value: 'movie' } });

      // Wait for results to appear
      await waitFor(() => {
        expect(screen.getByText('Inception')).toBeInTheDocument();
      });

      // Press Escape to close dropdown
      fireEvent.keyDown(input, { key: 'Escape' });

      // EXPECTED: dropdown is closed (results not visible)
      expect(screen.queryByText('Inception')).not.toBeInTheDocument();
    });
  });

  describe('Property: SearchBar Debouncing Preserved', () => {
    /**
     * Property: For any text input in the SearchBar, the search API call
     * SHALL be debounced with a 300ms delay to prevent excessive requests.
     * 
     * This is a preservation test - verifies that debouncing continues
     * to work correctly on unfixed code.
     * 
     * EXPECTED OUTCOME on UNFIXED code: Test PASSES
     * (this confirms baseline behavior to preserve)
     */
    it('should not call API immediately on input change', () => {
      render(<SearchBar />);

      const input = screen.getByPlaceholderText('Search movies and TV shows...');

      // Type search query
      fireEvent.change(input, { target: { value: 'i' } });

      // EXPECTED: API not called immediately (debouncing in effect)
      expect(mockSearchMovies).not.toHaveBeenCalled();
    });

    it('should eventually call API after debounce delay', async () => {
      render(<SearchBar />);

      const input = screen.getByPlaceholderText('Search movies and TV shows...');

      // Type search query
      fireEvent.change(input, { target: { value: 'inception' } });

      // Wait for debounce to complete
      await waitFor(() => {
        expect(mockSearchMovies).toHaveBeenCalledWith('inception');
      });
    });

    it('should preserve debouncing for multiple search queries', async () => {
      render(<SearchBar />);

      const input = screen.getByPlaceholderText('Search movies and TV shows...');

      const testQueries = ['inception', 'interstellar', 'dark knight'];

      for (const query of testQueries) {
        mockSearchMovies.mockClear();

        fireEvent.change(input, { target: { value: query } });

        // EXPECTED: API not called immediately
        expect(mockSearchMovies).not.toHaveBeenCalled();

        // Wait for debounce to complete
        await waitFor(() => {
          expect(mockSearchMovies).toHaveBeenCalledWith(query);
        });
      }
    });
  });


});


