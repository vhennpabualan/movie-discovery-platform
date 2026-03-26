import { getMoviesByGenre } from '@/lib/api/tmdb-client';
import { MovieCarousel } from './MovieCarousel';
import { ErrorBoundary } from '@/features/ui/components/ErrorBoundary';

interface GenreMoviesProps {
  genreId: number;
  genreName: string;
}

export async function GenreMovies({ genreId, genreName }: GenreMoviesProps) {
  try {
    const response = await getMoviesByGenre(genreId, 1);
    // Filter out movies without poster images for better UX
    const movies = (response.results || []).filter(movie => movie.poster_path);

    if (movies.length === 0) {
      return (
        <div className="flex items-center justify-center py-12">
          <p className="text-netflix-gray text-lg">No movies found for {genreName}</p>
        </div>
      );
    }

    return (
      <ErrorBoundary>
        <MovieCarousel movies={movies} />
      </ErrorBoundary>
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error(`[GenreMovies] Failed to fetch movies for genre ${genreId}:`, errorMessage);

    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-red-500 text-lg">
          Failed to load {genreName} movies. Please try again later.
        </p>
      </div>
    );
  }
}
