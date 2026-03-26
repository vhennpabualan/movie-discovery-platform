import { z } from 'zod';

/**
 * Zod schema for Movie validation
 * Validates basic movie objects from TMDb API responses
 * Coerces string values to appropriate types and provides defaults for optional fields
 */
export const movieSchema = z.object({
  id: z.number().int().positive('Movie ID must be a positive integer'),
  title: z.string().min(1, 'Movie title is required'),
  poster_path: z.string().min(1, 'Movie poster path is required'),
  release_date: z.string().min(1, 'Movie release date is required'),
});

export type Movie = z.infer<typeof movieSchema>;
