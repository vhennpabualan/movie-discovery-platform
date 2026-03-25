# TMDb API Client

A clean, type-safe API client for The Movie Database (TMDb) API using native fetch.

## Features

- **Native Fetch**: Uses browser's native fetch API without external HTTP libraries
- **Type Safety**: Full TypeScript support with strict types
- **Error Handling**: Descriptive error messages with HTTP status codes
- **Request/Response Logging**: Debug-friendly logging in development mode
- **API Key Management**: Secure environment variable-based configuration
- **Authorization Headers**: Automatic Bearer token configuration
- **Revalidation Tags**: Built-in Next.js ISR support with revalidation tags
- **Pagination Support**: Built-in page parameter support for all endpoints

## Configuration

Set the following environment variable in your `.env.local`:

```env
NEXT_PUBLIC_TMDB_API_KEY=your_tmdb_api_key_here
```

Get your API key from [TMDb API](https://www.themoviedb.org/settings/api)

## Usage

### Fetch Trending Movies

```typescript
import { getMoviesByTrending } from '@/lib/api/tmdb-client';

// Fetch trending movies for today
const response = await getMoviesByTrending();

// Fetch trending movies for the week
const weeklyTrending = await getMoviesByTrending('week');

// Fetch with pagination
const page2 = await getMoviesByTrending('day', 2);
```

### Search Movies

```typescript
import { searchMovies } from '@/lib/api/tmdb-client';

// Search for movies
const results = await searchMovies('Inception');

// Search with pagination
const page2 = await searchMovies('Inception', 2);
```

### Get Movie Details

```typescript
import { getMovieDetails } from '@/lib/api/tmdb-client';

// Fetch detailed information for a specific movie
const details = await getMovieDetails(550); // Fight Club
```

## Error Handling

The client throws `TMDbAPIError` for all error conditions:

```typescript
import { getMoviesByTrending, TMDbAPIError } from '@/lib/api/tmdb-client';

try {
  const movies = await getMoviesByTrending();
} catch (error) {
  if (error instanceof TMDbAPIError) {
    console.error(`API Error (${error.statusCode}): ${error.message}`);
  }
}
```

### Error Types

- **401 Unauthorized**: Invalid or missing API key
- **404 Not Found**: Resource not found
- **429 Too Many Requests**: Rate limit exceeded
- **500 Server Error**: TMDb server error
- **0 Network Error**: Network connectivity issue

## Logging

In development mode, the client logs:

- Request method, URL, and headers (with API key redacted)
- Response status and data
- Error details with status codes

Logging is automatically disabled in production.

## Revalidation Tags

The client automatically attaches revalidation tags for Next.js ISR:

- `trending-movies`: For trending movies endpoint (1 hour revalidation)
- `search-results-{query}`: For search results (1 hour revalidation)
- `movie-details-{id}`: For movie details (24 hour revalidation)

Use these tags with `revalidateTag()` for on-demand revalidation:

```typescript
import { revalidateTag } from 'next/cache';

// Revalidate trending movies cache
revalidateTag('trending-movies');

// Revalidate specific search results
revalidateTag('search-results-inception');

// Revalidate specific movie details
revalidateTag('movie-details-550');
```

## Type Safety

All responses are fully typed:

```typescript
import { APIResponse, MovieDetails } from '@/types';

const response: APIResponse = await getMoviesByTrending();
const details: MovieDetails = await getMovieDetails(550);
```

## Response Types

### APIResponse

```typescript
interface APIResponse {
  results: Movie[];
  page: number;
  total_pages: number;
}
```

### Movie

```typescript
interface Movie {
  id: number;
  title: string;
  poster_path: string;
  release_date: string;
}
```

### MovieDetails

```typescript
interface MovieDetails extends Movie {
  overview: string;
  genres: Array<{
    id: number;
    name: string;
  }>;
  runtime: number;
  vote_average: number;
}
```
