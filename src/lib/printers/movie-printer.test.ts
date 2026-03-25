/**
 * Tests for Movie Pretty Printer
 * Validates formatting of Movie objects to JSON matching TMDb API structure
 */

import {
  printMovie,
  printMovieDetails,
  movieToJSON,
  movieDetailsToJSON,
  printMovieCompact,
  printMovieDetailsCompact,
} from './movie-printer';
import { Movie, MovieDetails } from '@/types';

describe('Movie Pretty Printer', () => {
  const mockMovie: Movie = {
    id: 550,
    title: 'Fight Club',
    poster_path: '/adw6Lq9FiC9zjYEpOqfq03itm7b.jpg',
    release_date: '1999-10-15',
  };

  const mockMovieDetails: MovieDetails = {
    id: 550,
    title: 'Fight Club',
    poster_path: '/adw6Lq9FiC9zjYEpOqfq03itm7b.jpg',
    release_date: '1999-10-15',
    overview: 'An insomniac office worker and a devil-may-care soapmaker form an underground fight club.',
    genres: [
      { id: 18, name: 'Drama' },
      { id: 53, name: 'Thriller' },
    ],
    runtime: 139,
    vote_average: 8.8,
  };

  describe('movieToJSON', () => {
    it('should convert Movie to plain object with all fields', () => {
      const result = movieToJSON(mockMovie);

      expect(result).toEqual({
        id: 550,
        title: 'Fight Club',
        poster_path: '/adw6Lq9FiC9zjYEpOqfq03itm7b.jpg',
        release_date: '1999-10-15',
      });
    });

    it('should preserve field types', () => {
      const result = movieToJSON(mockMovie);

      expect(typeof result.id).toBe('number');
      expect(typeof result.title).toBe('string');
      expect(typeof result.poster_path).toBe('string');
      expect(typeof result.release_date).toBe('string');
    });

    it('should match TMDb API response structure', () => {
      const result = movieToJSON(mockMovie);
      const keys = Object.keys(result);

      expect(keys).toContain('id');
      expect(keys).toContain('title');
      expect(keys).toContain('poster_path');
      expect(keys).toContain('release_date');
      expect(keys.length).toBe(4);
    });
  });

  describe('movieDetailsToJSON', () => {
    it('should convert MovieDetails to plain object with all fields', () => {
      const result = movieDetailsToJSON(mockMovieDetails);

      expect(result).toEqual({
        id: 550,
        title: 'Fight Club',
        poster_path: '/adw6Lq9FiC9zjYEpOqfq03itm7b.jpg',
        release_date: '1999-10-15',
        overview: 'An insomniac office worker and a devil-may-care soapmaker form an underground fight club.',
        genres: [
          { id: 18, name: 'Drama' },
          { id: 53, name: 'Thriller' },
        ],
        runtime: 139,
        vote_average: 8.8,
      });
    });

    it('should preserve field types', () => {
      const result = movieDetailsToJSON(mockMovieDetails);

      expect(typeof result.id).toBe('number');
      expect(typeof result.title).toBe('string');
      expect(typeof result.overview).toBe('string');
      expect(typeof result.runtime).toBe('number');
      expect(typeof result.vote_average).toBe('number');
      expect(Array.isArray(result.genres)).toBe(true);
    });

    it('should format genres correctly', () => {
      const result = movieDetailsToJSON(mockMovieDetails);

      expect(result.genres).toEqual([
        { id: 18, name: 'Drama' },
        { id: 53, name: 'Thriller' },
      ]);
    });

    it('should handle empty genres array', () => {
      const movieWithoutGenres: MovieDetails = {
        ...mockMovieDetails,
        genres: [],
      };

      const result = movieDetailsToJSON(movieWithoutGenres);

      expect(result.genres).toEqual([]);
    });

    it('should match TMDb API response structure', () => {
      const result = movieDetailsToJSON(mockMovieDetails);
      const keys = Object.keys(result);

      expect(keys).toContain('id');
      expect(keys).toContain('title');
      expect(keys).toContain('poster_path');
      expect(keys).toContain('release_date');
      expect(keys).toContain('overview');
      expect(keys).toContain('genres');
      expect(keys).toContain('runtime');
      expect(keys).toContain('vote_average');
    });
  });

  describe('printMovie', () => {
    it('should return valid JSON string', () => {
      const result = printMovie(mockMovie);

      expect(() => JSON.parse(result)).not.toThrow();
    });

    it('should format with default indentation (2 spaces)', () => {
      const result = printMovie(mockMovie);

      expect(result).toContain('  ');
      expect(result).toContain('\n');
    });

    it('should format with custom indentation', () => {
      const result = printMovie(mockMovie, { indent: 4 });

      expect(result).toContain('    ');
    });

    it('should format with no indentation when indent is 0', () => {
      const result = printMovie(mockMovie, { indent: 0 });

      expect(result).not.toContain('\n');
      expect(result).not.toContain('  ');
    });

    it('should parse back to equivalent object', () => {
      const result = printMovie(mockMovie);
      const parsed = JSON.parse(result);

      expect(parsed).toEqual(mockMovie);
    });
  });

  describe('printMovieDetails', () => {
    it('should return valid JSON string', () => {
      const result = printMovieDetails(mockMovieDetails);

      expect(() => JSON.parse(result)).not.toThrow();
    });

    it('should format with default indentation (2 spaces)', () => {
      const result = printMovieDetails(mockMovieDetails);

      expect(result).toContain('  ');
      expect(result).toContain('\n');
    });

    it('should format with custom indentation', () => {
      const result = printMovieDetails(mockMovieDetails, { indent: 4 });

      expect(result).toContain('    ');
    });

    it('should format with no indentation when indent is 0', () => {
      const result = printMovieDetails(mockMovieDetails, { indent: 0 });

      expect(result).not.toContain('\n');
      expect(result).not.toContain('  ');
    });

    it('should parse back to equivalent object', () => {
      const result = printMovieDetails(mockMovieDetails);
      const parsed = JSON.parse(result);

      expect(parsed).toEqual(mockMovieDetails);
    });
  });

  describe('printMovieCompact', () => {
    it('should return compact JSON string without indentation', () => {
      const result = printMovieCompact(mockMovie);

      expect(result).not.toContain('\n');
      expect(result).not.toContain('  ');
    });

    it('should return valid JSON string', () => {
      const result = printMovieCompact(mockMovie);

      expect(() => JSON.parse(result)).not.toThrow();
    });

    it('should parse back to equivalent object', () => {
      const result = printMovieCompact(mockMovie);
      const parsed = JSON.parse(result);

      expect(parsed).toEqual(mockMovie);
    });
  });

  describe('printMovieDetailsCompact', () => {
    it('should return compact JSON string without indentation', () => {
      const result = printMovieDetailsCompact(mockMovieDetails);

      expect(result).not.toContain('\n');
      expect(result).not.toContain('  ');
    });

    it('should return valid JSON string', () => {
      const result = printMovieDetailsCompact(mockMovieDetails);

      expect(() => JSON.parse(result)).not.toThrow();
    });

    it('should parse back to equivalent object', () => {
      const result = printMovieDetailsCompact(mockMovieDetails);
      const parsed = JSON.parse(result);

      expect(parsed).toEqual(mockMovieDetails);
    });
  });

  describe('Round-trip property', () => {
    it('should maintain Movie object through print → parse cycle', () => {
      const printed = printMovie(mockMovie);
      const parsed = JSON.parse(printed);

      expect(parsed).toEqual(mockMovie);
    });

    it('should maintain MovieDetails object through print → parse cycle', () => {
      const printed = printMovieDetails(mockMovieDetails);
      const parsed = JSON.parse(printed);

      expect(parsed).toEqual(mockMovieDetails);
    });

    it('should maintain Movie object through compact print → parse cycle', () => {
      const printed = printMovieCompact(mockMovie);
      const parsed = JSON.parse(printed);

      expect(parsed).toEqual(mockMovie);
    });

    it('should maintain MovieDetails object through compact print → parse cycle', () => {
      const printed = printMovieDetailsCompact(mockMovieDetails);
      const parsed = JSON.parse(printed);

      expect(parsed).toEqual(mockMovieDetails);
    });

    it('should handle multiple round-trips', () => {
      let current = mockMovie;

      for (let i = 0; i < 3; i++) {
        const printed = printMovie(current);
        current = JSON.parse(printed);
      }

      expect(current).toEqual(mockMovie);
    });
  });

  describe('Edge cases', () => {
    it('should handle movie with special characters in title', () => {
      const movieWithSpecialChars: Movie = {
        ...mockMovie,
        title: 'Movie with "quotes" and \\backslashes\\',
      };

      const result = printMovie(movieWithSpecialChars);
      const parsed = JSON.parse(result);

      expect(parsed.title).toBe(movieWithSpecialChars.title);
    });

    it('should handle movie with unicode characters', () => {
      const movieWithUnicode: Movie = {
        ...mockMovie,
        title: '电影 🎬 Película',
      };

      const result = printMovie(movieWithUnicode);
      const parsed = JSON.parse(result);

      expect(parsed.title).toBe(movieWithUnicode.title);
    });

    it('should handle movie details with empty overview', () => {
      const movieWithEmptyOverview: MovieDetails = {
        ...mockMovieDetails,
        overview: '',
      };

      const result = printMovieDetails(movieWithEmptyOverview);
      const parsed = JSON.parse(result);

      expect(parsed.overview).toBe('');
    });

    it('should handle movie details with zero runtime', () => {
      const movieWithZeroRuntime: MovieDetails = {
        ...mockMovieDetails,
        runtime: 0,
      };

      const result = printMovieDetails(movieWithZeroRuntime);
      const parsed = JSON.parse(result);

      expect(parsed.runtime).toBe(0);
    });
  });
});
