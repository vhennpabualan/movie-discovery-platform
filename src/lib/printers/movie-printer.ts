/**
 * Movie Data Pretty Printer
 * Formats Movie objects to JSON matching TMDb API response structure
 * Ensures round-trip property: parse → print → parse produces equivalent object
 */

import { Movie, MovieDetails } from '@/types';

/**
 * Formatting options for pretty-printing
 */
export interface PrinterOptions {
  /**
   * Number of spaces for indentation (0 for compact, 2 for pretty)
   * @default 2
   */
  indent?: number;

  /**
   * Whether to include null values in output
   * @default false
   */
  includeNulls?: boolean;
}

/**
 * Formats a Movie object to JSON string matching TMDb API structure
 * @param movie - Movie object to format
 * @param options - Formatting options
 * @returns JSON string representation of the movie
 */
export function printMovie(movie: Movie, options: PrinterOptions = {}): string {
  const { indent = 2 } = options;
  const movieData = movieToJSON(movie);
  return JSON.stringify(movieData, null, indent);
}

/**
 * Formats a MovieDetails object to JSON string matching TMDb API structure
 * @param movie - MovieDetails object to format
 * @param options - Formatting options
 * @returns JSON string representation of the movie details
 */
export function printMovieDetails(
  movie: MovieDetails,
  options: PrinterOptions = {}
): string {
  const { indent = 2 } = options;
  const movieData = movieDetailsToJSON(movie);
  return JSON.stringify(movieData, null, indent);
}

/**
 * Converts a Movie object to a plain object matching TMDb API structure
 * @param movie - Movie object to convert
 * @returns Plain object representation
 */
export function movieToJSON(movie: Movie): Record<string, unknown> {
  return {
    id: movie.id,
    title: movie.title,
    poster_path: movie.poster_path,
    release_date: movie.release_date,
  };
}

/**
 * Converts a MovieDetails object to a plain object matching TMDb API structure
 * @param movie - MovieDetails object to convert
 * @returns Plain object representation
 */
export function movieDetailsToJSON(movie: MovieDetails): Record<string, unknown> {
  return {
    id: movie.id,
    title: movie.title,
    poster_path: movie.poster_path,
    release_date: movie.release_date,
    overview: movie.overview,
    genres: movie.genres.map((genre) => ({
      id: genre.id,
      name: genre.name,
    })),
    runtime: movie.runtime,
    vote_average: movie.vote_average,
  };
}

/**
 * Formats a Movie object to a compact JSON string (no indentation)
 * @param movie - Movie object to format
 * @returns Compact JSON string representation
 */
export function printMovieCompact(movie: Movie): string {
  return JSON.stringify(movieToJSON(movie));
}

/**
 * Formats a MovieDetails object to a compact JSON string (no indentation)
 * @param movie - MovieDetails object to format
 * @returns Compact JSON string representation
 */
export function printMovieDetailsCompact(movie: MovieDetails): string {
  return JSON.stringify(movieDetailsToJSON(movie));
}
