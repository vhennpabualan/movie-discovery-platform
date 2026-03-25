/**
 * Bug Condition Exploration Tests for Validation Schemas
 * 
 * These tests validate that the schemas properly reject invalid data.
 * On unfixed code, these tests WILL FAIL because the schemas accept invalid data.
 * This failure proves the bug exists.
 * 
 * Validates: Requirements 1.1, 1.5
 */

import { movieSchema } from './movie.schema';
import { movieDetailsSchema } from './movie-details.schema';
import { apiResponseSchema } from './api-response.schema';
import { ZodError } from 'zod';

describe('Validation Schemas - Bug Condition Exploration', () => {
  describe('movieSchema - Missing Required Fields', () => {
    it('should reject movie data missing poster_path', () => {
      const invalidData = {
        id: 550,
        title: 'Fight Club',
        release_date: '1999-10-15',
        // missing poster_path
      };

      expect(() => movieSchema.parse(invalidData)).toThrow(ZodError);
    });

    it('should reject movie data missing release_date', () => {
      const invalidData = {
        id: 550,
        title: 'Fight Club',
        poster_path: '/adw6Lq9FiC9zjYEpOqfq03itm7b.jpg',
        // missing release_date
      };

      expect(() => movieSchema.parse(invalidData)).toThrow(ZodError);
    });
  });

  describe('movieSchema - Empty Required Fields', () => {
    it('should reject movie data with empty release_date string', () => {
      const invalidData = {
        id: 550,
        title: 'Fight Club',
        poster_path: '/adw6Lq9FiC9zjYEpOqfq03itm7b.jpg',
        release_date: '',
      };

      expect(() => movieSchema.parse(invalidData)).toThrow(ZodError);
    });

    it('should reject movie data with empty poster_path string', () => {
      const invalidData = {
        id: 550,
        title: 'Fight Club',
        poster_path: '',
        release_date: '1999-10-15',
      };

      expect(() => movieSchema.parse(invalidData)).toThrow(ZodError);
    });
  });

  describe('apiResponseSchema - Undefined Results Array', () => {
    it('should reject API response with undefined results array', () => {
      const invalidData = {
        results: undefined,
        page: 1,
        total_pages: 10,
      };

      expect(() => apiResponseSchema.parse(invalidData)).toThrow(ZodError);
    });

    it('should reject API response with missing results array', () => {
      const invalidData = {
        page: 1,
        total_pages: 10,
        // missing results
      };

      expect(() => apiResponseSchema.parse(invalidData)).toThrow(ZodError);
    });
  });

  describe('movieDetailsSchema - Empty Overview', () => {
    it('should reject movie details with empty overview string', () => {
      const invalidData = {
        id: 550,
        title: 'Fight Club',
        poster_path: '/adw6Lq9FiC9zjYEpOqfq03itm7b.jpg',
        release_date: '1999-10-15',
        overview: '',
        genres: [],
        runtime: 139,
        vote_average: 8.8,
      };

      expect(() => movieDetailsSchema.parse(invalidData)).toThrow(ZodError);
    });
  });

  describe('Valid Data - Baseline Behavior', () => {
    it('should accept valid movie data with all required fields', () => {
      const validData = {
        id: 550,
        title: 'Fight Club',
        poster_path: '/adw6Lq9FiC9zjYEpOqfq03itm7b.jpg',
        release_date: '1999-10-15',
      };

      const result = movieSchema.parse(validData);
      expect(result).toEqual(validData);
    });

    it('should accept valid API response with results array', () => {
      const validData = {
        results: [
          {
            id: 550,
            title: 'Fight Club',
            poster_path: '/adw6Lq9FiC9zjYEpOqfq03itm7b.jpg',
            release_date: '1999-10-15',
          },
        ],
        page: 1,
        total_pages: 10,
      };

      const result = apiResponseSchema.parse(validData);
      expect(result.results).toHaveLength(1);
      expect(result.page).toBe(1);
    });

    it('should accept valid movie details with all fields', () => {
      const validData = {
        id: 550,
        title: 'Fight Club',
        poster_path: '/adw6Lq9FiC9zjYEpOqfq03itm7b.jpg',
        release_date: '1999-10-15',
        overview: 'An insomniac office worker and a devil-may-care soapmaker form an underground fight club.',
        genres: [{ id: 18, name: 'Drama' }],
        runtime: 139,
        vote_average: 8.8,
      };

      const result = movieDetailsSchema.parse(validData);
      expect(result.overview).toBe(validData.overview);
      expect(result.runtime).toBe(139);
    });
  });
});

/**
 * Preservation Property Tests for Validation Schemas
 * 
 * These tests verify that valid data continues to be accepted correctly
 * after the validation schema fixes are applied. They capture the baseline
 * behavior that must be preserved to prevent regressions.
 * 
 * Validates: Requirements 3.5, 3.6
 */
describe('Validation Schemas - Preservation Properties', () => {
  describe('Property 1: Valid Movie Data Acceptance', () => {
    // Generate multiple test cases for stronger guarantees
    const validMovieTestCases = [
      {
        id: 550,
        title: 'Fight Club',
        poster_path: '/adw6Lq9FiC9zjYEpOqfq03itm7b.jpg',
        release_date: '1999-10-15',
      },
      {
        id: 278,
        title: 'The Shawshank Redemption',
        poster_path: '/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg',
        release_date: '1994-09-23',
      },
      {
        id: 238,
        title: 'The Godfather',
        poster_path: '/3bhkrj58Vtu7enYsRolD1fZdja1.jpg',
        release_date: '1972-03-14',
      },
      {
        id: 240,
        title: 'The Godfather Part II',
        poster_path: '/hWK4EsH1PtGnqkaKn41715qwEsf.jpg',
        release_date: '1974-12-20',
      },
      {
        id: 424,
        title: 'Schindler\'s List',
        poster_path: '/sF1U4EUQS8YHUYjNl7pKFATZLa2.jpg',
        release_date: '1993-12-15',
      },
    ];

    validMovieTestCases.forEach((testCase, index) => {
      it(`should accept valid movie data case ${index + 1}: ${testCase.title}`, () => {
        const result = movieSchema.parse(testCase);
        expect(result.id).toBe(testCase.id);
        expect(result.title).toBe(testCase.title);
        expect(result.poster_path).toBe(testCase.poster_path);
        expect(result.release_date).toBe(testCase.release_date);
      });
    });
  });

  describe('Property 2: Valid API Response Acceptance', () => {
    // Generate multiple test cases for stronger guarantees
    const validApiResponseTestCases = [
      {
        results: [
          {
            id: 550,
            title: 'Fight Club',
            poster_path: '/adw6Lq9FiC9zjYEpOqfq03itm7b.jpg',
            release_date: '1999-10-15',
          },
        ],
        page: 1,
        total_pages: 10,
      },
      {
        results: [
          {
            id: 278,
            title: 'The Shawshank Redemption',
            poster_path: '/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg',
            release_date: '1994-09-23',
          },
          {
            id: 238,
            title: 'The Godfather',
            poster_path: '/3bhkrj58Vtu7enYsRolD1fZdja1.jpg',
            release_date: '1972-03-14',
          },
        ],
        page: 1,
        total_pages: 5,
      },
      {
        results: [],
        page: 2,
        total_pages: 0,
      },
      {
        results: [
          {
            id: 240,
            title: 'The Godfather Part II',
            poster_path: '/hWK4EsH1PtGnqkaKn41715qwEsf.jpg',
            release_date: '1974-12-20',
          },
        ],
        page: 5,
        total_pages: 50,
      },
    ];

    validApiResponseTestCases.forEach((testCase, index) => {
      it(`should accept valid API response case ${index + 1} with ${testCase.results.length} results`, () => {
        const result = apiResponseSchema.parse(testCase);
        expect(result.results).toHaveLength(testCase.results.length);
        expect(result.page).toBe(testCase.page);
        expect(result.total_pages).toBe(testCase.total_pages);
        expect(Array.isArray(result.results)).toBe(true);
      });
    });
  });

  describe('Property 3: Optional Fields with Defaults', () => {
    // Generate multiple test cases for stronger guarantees
    const optionalFieldsTestCases = [
      {
        // Movie with minimal required fields
        id: 550,
        title: 'Fight Club',
        poster_path: '/adw6Lq9FiC9zjYEpOqfq03itm7b.jpg',
        release_date: '1999-10-15',
        // optional fields omitted
      },
      {
        // Movie details with some optional fields
        id: 550,
        title: 'Fight Club',
        poster_path: '/adw6Lq9FiC9zjYEpOqfq03itm7b.jpg',
        release_date: '1999-10-15',
        overview: 'An insomniac office worker and a devil-may-care soapmaker form an underground fight club.',
        genres: [{ id: 18, name: 'Drama' }],
        // runtime and vote_average omitted
      },
      {
        // Movie details with all optional fields
        id: 550,
        title: 'Fight Club',
        poster_path: '/adw6Lq9FiC9zjYEpOqfq03itm7b.jpg',
        release_date: '1999-10-15',
        overview: 'An insomniac office worker and a devil-may-care soapmaker form an underground fight club.',
        genres: [
          { id: 18, name: 'Drama' },
          { id: 28, name: 'Action' },
        ],
        runtime: 139,
        vote_average: 8.8,
      },
    ];

    optionalFieldsTestCases.forEach((testCase, index) => {
      it(`should apply defaults correctly for optional fields case ${index + 1}`, () => {
        const result = movieDetailsSchema.parse(testCase);
        
        // Verify required fields are preserved
        expect(result.id).toBe(testCase.id);
        expect(result.title).toBe(testCase.title);
        expect(result.poster_path).toBe(testCase.poster_path);
        expect(result.release_date).toBe(testCase.release_date);
        
        // Verify optional fields have expected values or defaults
        // overview is optional and can be undefined if not provided
        if ('overview' in testCase && testCase.overview !== undefined) {
          expect(result.overview).toBe(testCase.overview);
        }
        expect(Array.isArray(result.genres)).toBe(true);
        expect(typeof result.runtime).toBe('number');
        expect(typeof result.vote_average).toBe('number');
      });
    });
  });

  describe('Property 4: API Response with Various Page Numbers', () => {
    // Generate multiple test cases for stronger guarantees
    const pageNumberTestCases = [
      { page: 1, total_pages: 1 },
      { page: 1, total_pages: 100 },
      { page: 50, total_pages: 100 },
      { page: 100, total_pages: 100 },
      { page: 1, total_pages: 0 },
    ];

    pageNumberTestCases.forEach((testCase, index) => {
      it(`should accept valid page numbers case ${index + 1}: page ${testCase.page} of ${testCase.total_pages}`, () => {
        const validData = {
          results: [
            {
              id: 550,
              title: 'Fight Club',
              poster_path: '/adw6Lq9FiC9zjYEpOqfq03itm7b.jpg',
              release_date: '1999-10-15',
            },
          ],
          page: testCase.page,
          total_pages: testCase.total_pages,
        };

        const result = apiResponseSchema.parse(validData);
        expect(result.page).toBe(testCase.page);
        expect(result.total_pages).toBe(testCase.total_pages);
      });
    });
  });

  describe('Property 5: Movie Data with Various Titles and Paths', () => {
    // Generate multiple test cases for stronger guarantees
    const movieVariationTestCases = [
      {
        id: 1,
        title: 'A',
        poster_path: '/a.jpg',
        release_date: '2000-01-01',
      },
      {
        id: 999999,
        title: 'Very Long Movie Title That Contains Many Words And Special Characters Like Colons: The Sequel',
        poster_path: '/very/long/path/to/poster/image.jpg',
        release_date: '1900-01-01',
      },
      {
        id: 12345,
        title: 'Movie with Numbers 123 and Symbols !@#$%',
        poster_path: '/path-with-dashes/and_underscores/poster.jpg',
        release_date: '2099-12-31',
      },
    ];

    movieVariationTestCases.forEach((testCase, index) => {
      it(`should accept movie with various title/path formats case ${index + 1}`, () => {
        const result = movieSchema.parse(testCase);
        expect(result.id).toBe(testCase.id);
        expect(result.title).toBe(testCase.title);
        expect(result.poster_path).toBe(testCase.poster_path);
        expect(result.release_date).toBe(testCase.release_date);
      });
    });
  });
});
