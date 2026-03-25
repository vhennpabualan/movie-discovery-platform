import { Movie } from '@/lib/validation/movie.schema';

/**
 * MovieDetails interface extending Movie with additional detailed information
 */
export interface MovieDetails extends Movie {
  overview?: string;
  genres: Array<{
    id: number;
    name: string;
  }>;
  runtime: number;
  vote_average: number;
}
