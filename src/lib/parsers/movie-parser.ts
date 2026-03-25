/**
 * Movie Data Parser
 * Parses TMDb API responses into Movie objects with validation
 * Ensures all required fields are present and handles optional fields gracefully
 */

import { Movie, MovieDetails } from '@/types';
import { movieSchema, movieDetailsSchema } from '@/lib/validation';
import { ZodError } from 'zod';

/**
 * Custom error for parsing failures
 */
export class MovieParseError extends Error {
  constructor(
    message: string,
    public readonly validationErrors?: ZodError
  ) {
    super(message);
    this.name = 'MovieParseError';
  }
}

/**
 * Parses a raw API response into a Movie object
 * Validates all required fields are present
 * @param data - Raw data from TMDb API
 * @returns Parsed Movie object
 * @throws MovieParseError if required fields are missing or invalid
 */
export function parseMovie(data: unknown): Movie {
  try {
    const parsed = movieSchema.parse(data);
    return parsed;
  } catch (error) {
    if (error instanceof ZodError) {
      const fieldErrors = error.issues
        .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
        .join('; ');
      throw new MovieParseError(
        `Failed to parse movie data. Missing or invalid fields: ${fieldErrors}`,
        error
      );
    }
    throw new MovieParseError('Failed to parse movie data: Unknown error');
  }
}

/**
 * Parses a raw API response into a MovieDetails object
 * Validates all required fields are present
 * Handles optional fields gracefully with defaults
 * @param data - Raw data from TMDb API
 * @returns Parsed MovieDetails object
 * @throws MovieParseError if required fields are missing or invalid
 */
export function parseMovieDetails(data: unknown): MovieDetails {
  try {
    const parsed = movieDetailsSchema.parse(data);
    return parsed;
  } catch (error) {
    if (error instanceof ZodError) {
      const fieldErrors = error.issues
        .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
        .join('; ');
      throw new MovieParseError(
        `Failed to parse movie details. Missing or invalid fields: ${fieldErrors}`,
        error
      );
    }
    throw new MovieParseError('Failed to parse movie details: Unknown error');
  }
}
