/**
 * Tests for Movie Parser
 * Validates parsing of TMDb API responses with proper error handling
 */

import { parseMovie, parseMovieDetails, MovieParseError } from './movie-parser';
import { Movie, MovieDetails } from '@/types';

describe('Movie Parser', () => {
  describe('parseMovie', () => {
    it('should parse valid movie data', () => {
      const movieData = {
        id: 550,
        title: 'Fight Club',
        poster_path: '/adw6Lq9FiC9zjYEpOqfq03itm7b.jpg',
        release_date: '1999-10-15',
      };

      const result = parseMovie(movieData);

      expect(result).toEqual(movieData);
      expect(result.id).toBe(550);
      expect(result.title).toBe('Fight Club');
    });

    it('should throw error when required field is missing', () => {
      const incompleteData = {
        id: 550,
        title: 'Fight Club',
        // missing poster_path and release_date
      };

      expect(() => parseMovie(incompleteData)).toThrow(MovieParseError);
    });

    it('should throw error when id is not a positive integer', () => {
      const invalidData = {
        id: -1,
        title: 'Fight Club',
        poster_path: '/adw6Lq9FiC9zjYEpOqfq03itm7b.jpg',
        release_date: '1999-10-15',
      };

      expect(() => parseMovie(invalidData)).toThrow(MovieParseError);
    });

    it('should throw error when title is empty', () => {
      const invalidData = {
        id: 550,
        title: '',
        poster_path: '/adw6Lq9FiC9zjYEpOqfq03itm7b.jpg',
        release_date: '1999-10-15',
      };

      expect(() => parseMovie(invalidData)).toThrow(MovieParseError);
    });

    it('should throw error when poster_path is empty', () => {
      const invalidData = {
        id: 550,
        title: 'Fight Club',
        poster_path: '',
        release_date: '1999-10-15',
      };

      expect(() => parseMovie(invalidData)).toThrow(MovieParseError);
    });

    it('should throw error when release_date is empty', () => {
      const invalidData = {
        id: 550,
        title: 'Fight Club',
        poster_path: '/adw6Lq9FiC9zjYEpOqfq03itm7b.jpg',
        release_date: '',
      };

      expect(() => parseMovie(invalidData)).toThrow(MovieParseError);
    });

    it('should include validation errors in MovieParseError', () => {
      const incompleteData = {
        id: 550,
        title: 'Fight Club',
      };

      try {
        parseMovie(incompleteData);
        fail('Should have thrown MovieParseError');
      } catch (error) {
        expect(error).toBeInstanceOf(MovieParseError);
        expect((error as MovieParseError).validationErrors).toBeDefined();
      }
    });

    it('should have descriptive error message', () => {
      const incompleteData = {
        id: 550,
        title: 'Fight Club',
      };

      try {
        parseMovie(incompleteData);
        fail('Should have thrown MovieParseError');
      } catch (error) {
        expect((error as MovieParseError).message).toContain('Failed to parse movie data');
        expect((error as MovieParseError).message).toContain('Missing or invalid fields');
      }
    });
  });

  describe('parseMovieDetails', () => {
    it('should parse valid movie details data', () => {
      const movieDetailsData = {
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

      const result = parseMovieDetails(movieDetailsData);

      expect(result).toEqual(movieDetailsData);
      expect(result.overview).toBe(movieDetailsData.overview);
      expect(result.runtime).toBe(139);
      expect(result.vote_average).toBe(8.8);
    });

    it('should handle missing optional fields with defaults', () => {
      const minimalData = {
        id: 550,
        title: 'Fight Club',
        poster_path: '/adw6Lq9FiC9zjYEpOqfq03itm7b.jpg',
        release_date: '1999-10-15',
      };

      const result = parseMovieDetails(minimalData);

      expect(result.overview).toBe('');
      expect(result.genres).toEqual([]);
      expect(result.runtime).toBe(0);
      expect(result.vote_average).toBe(0);
    });

    it('should throw error when required field is missing', () => {
      const incompleteData = {
        id: 550,
        title: 'Fight Club',
        // missing poster_path and release_date
        overview: 'An insomniac office worker...',
      };

      expect(() => parseMovieDetails(incompleteData)).toThrow(MovieParseError);
    });

    it('should throw error when runtime is negative', () => {
      const invalidData = {
        id: 550,
        title: 'Fight Club',
        poster_path: '/adw6Lq9FiC9zjYEpOqfq03itm7b.jpg',
        release_date: '1999-10-15',
        overview: 'An insomniac office worker...',
        genres: [],
        runtime: -1,
        vote_average: 8.8,
      };

      expect(() => parseMovieDetails(invalidData)).toThrow(MovieParseError);
    });

    it('should throw error when vote_average is negative', () => {
      const invalidData = {
        id: 550,
        title: 'Fight Club',
        poster_path: '/adw6Lq9FiC9zjYEpOqfq03itm7b.jpg',
        release_date: '1999-10-15',
        overview: 'An insomniac office worker...',
        genres: [],
        runtime: 139,
        vote_average: -1,
      };

      expect(() => parseMovieDetails(invalidData)).toThrow(MovieParseError);
    });

    it('should validate genre structure', () => {
      const invalidData = {
        id: 550,
        title: 'Fight Club',
        poster_path: '/adw6Lq9FiC9zjYEpOqfq03itm7b.jpg',
        release_date: '1999-10-15',
        overview: 'An insomniac office worker...',
        genres: [{ id: 18 }], // missing name
        runtime: 139,
        vote_average: 8.8,
      };

      expect(() => parseMovieDetails(invalidData)).toThrow(MovieParseError);
    });

    it('should handle empty genres array', () => {
      const movieDetailsData = {
        id: 550,
        title: 'Fight Club',
        poster_path: '/adw6Lq9FiC9zjYEpOqfq03itm7b.jpg',
        release_date: '1999-10-15',
        overview: 'An insomniac office worker...',
        genres: [],
        runtime: 139,
        vote_average: 8.8,
      };

      const result = parseMovieDetails(movieDetailsData);

      expect(result.genres).toEqual([]);
    });
  });

  describe('Round-trip property', () => {
    it('should maintain Movie object through parse → print → parse cycle', () => {
      const originalMovie: Movie = {
        id: 550,
        title: 'Fight Club',
        poster_path: '/adw6Lq9FiC9zjYEpOqfq03itm7b.jpg',
        release_date: '1999-10-15',
      };

      // Import printer to test round-trip
      const { printMovie } = require('../printers/movie-printer');

      const printed = printMovie(originalMovie);
      const parsed = JSON.parse(printed);
      const reparsed = parseMovie(parsed);

      expect(reparsed).toEqual(originalMovie);
    });

    it('should maintain MovieDetails object through parse → print → parse cycle', () => {
      const originalMovie: MovieDetails = {
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

      // Import printer to test round-trip
      const { printMovieDetails } = require('../printers/movie-printer');

      const printed = printMovieDetails(originalMovie);
      const parsed = JSON.parse(printed);
      const reparsed = parseMovieDetails(parsed);

      expect(reparsed).toEqual(originalMovie);
    });
  });
});
