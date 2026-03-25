import { z } from 'zod';
import { movieSchema } from './movie.schema';

/**
 * Zod schema for MovieDetails validation
 * Extends Movie schema with additional detailed information
 * Coerces types and provides defaults for optional fields
 */
export const genreSchema = z.object({
  id: z.number().int().positive('Genre ID must be a positive integer'),
  name: z.string().min(1, 'Genre name is required'),
});

export const movieDetailsSchema = movieSchema.extend({
  overview: z.string().default(''),
  genres: z.array(genreSchema).default([]),
  runtime: z.number().int().nonnegative('Runtime must be a non-negative integer').default(0),
  vote_average: z.number().nonnegative('Vote average must be non-negative').default(0),
});

export type MovieDetails = z.infer<typeof movieDetailsSchema>;
export type Genre = z.infer<typeof genreSchema>;
