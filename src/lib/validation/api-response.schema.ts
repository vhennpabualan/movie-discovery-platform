import { z } from 'zod';
import { movieSchema } from './movie.schema';

/**
 * Zod schema for APIResponse validation
 * Validates paginated API responses from TMDb
 * Coerces types and provides defaults for optional fields
 */
export const apiResponseSchema = z.object({
  results: z.array(movieSchema),
  page: z.number().int().positive('Page must be a positive integer'),
  total_pages: z.number().int().nonnegative('Total pages must be non-negative'),
});

export type APIResponse = z.infer<typeof apiResponseSchema>;
