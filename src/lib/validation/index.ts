/**
 * Central export point for all Zod validation schemas
 * Used to validate API responses at runtime before they reach the UI
 */

export { movieSchema, type Movie } from './movie.schema';
export { movieDetailsSchema, genreSchema, type MovieDetails, type Genre } from './movie-details.schema';
export { apiResponseSchema, type APIResponse } from './api-response.schema';
