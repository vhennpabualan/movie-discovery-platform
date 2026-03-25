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
});
