import { Movie } from '@/lib/validation/movie.schema';

/**
 * APIResponse interface for TMDb API responses containing paginated movie results
 */
export interface APIResponse {
  results: Movie[];
  page: number;
  total_pages: number;
}
