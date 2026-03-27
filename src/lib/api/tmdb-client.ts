/**
 * TMDb API Client
 * Handles all communication with The Movie Database API
 * Uses native fetch API with proper error handling, retry logic, and logging
 */

import { APIResponse, Movie, MovieDetails } from '@/types';
import { TVShowDetails, TVSeasonDetails } from '@/types/tv-details';
import { apiResponseSchema, movieDetailsSchema } from '@/lib/validation';
import {
  APIResponseError,
  NetworkError,
  ValidationError,
  ConfigurationError,
  isRetryableError,
  getBackoffDelay,
} from '@/lib/api/errors';
import { logErrorToMonitoring, logAPIMetrics } from '@/lib/monitoring/error-logger';
import { logAPIRequest } from '@/lib/monitoring/api-logger';

// API Configuration
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const MAX_RETRIES = 3;
const BASE_BACKOFF_DELAY = 100; // milliseconds

// Cache for search results
const searchCache = new Map<string, APIResponse>();

// In-flight requests map to deduplicate concurrent requests
const inFlightRequests = new Map<string, Promise<APIResponse>>();

/**
 * Gets the API key from environment
 */
function getApiKey(): string {
  return process.env.NEXT_PUBLIC_TMDB_API_KEY || '';
}

/**
 * Clears the search cache and in-flight requests (for testing purposes)
 */
export function clearSearchCache(): void {
  searchCache.clear();
  inFlightRequests.clear();
}

/**
 * Re-export APIResponseError as TMDbAPIError for backward compatibility
 */
export const TMDbAPIError = APIResponseError;

/**
 * Validates that the API key is configured
 */
function validateApiKey(): void {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new ConfigurationError(
      'TMDb API key is not configured. Please set NEXT_PUBLIC_TMDB_API_KEY environment variable.'
    );
  }
}

/**
 * Logs request details for debugging
 */
function logRequest(method: string, url: string, headers: Record<string, string>): void {
  if (process.env.NODE_ENV === 'development') {
    console.log(`[TMDb API] ${method} ${url}`);
    console.log('[TMDb API] Headers:', {
      ...headers,
      Authorization: '***REDACTED***',
    });
  }
}

/**
 * Logs response details for debugging
 */
function logResponse(status: number, statusText: string, data: unknown): void {
  if (process.env.NODE_ENV === 'development') {
    console.log(`[TMDb API] Response: ${status} ${statusText}`);
    console.log('[TMDb API] Data:', data);
  }
}

/**
 * Logs error details for debugging and monitoring
 */
function logError(error: Error, endpoint?: string, retryAttempt?: number): void {
  console.error(`[TMDb API Error] ${error.name}: ${error.message}`);
  if (endpoint) {
    console.error(`[TMDb API Error] Endpoint: ${endpoint}`);
  }
  if (retryAttempt !== undefined) {
    console.error(`[TMDb API Error] Retry Attempt: ${retryAttempt}`);
  }

  // Send to monitoring service
  if (error instanceof APIResponseError || error instanceof NetworkError) {
    logErrorToMonitoring(error, { endpoint, retryAttempt });
  }
}

/**
 * Makes a request to the TMDb API with retry logic
 * @param endpoint - The API endpoint (e.g., '/trending/movie/day')
 * @param options - Additional fetch options
 * @param attemptNumber - Current attempt number (used internally for retries)
 * @returns The parsed JSON response
 */
async function makeRequest<T>(
  endpoint: string,
  options: RequestInit = {},
  attemptNumber: number = 0
): Promise<T> {
  validateApiKey();

  const apiKey = getApiKey();
  const separator = endpoint.includes('?') ? '&' : '?';
  const url = `${TMDB_BASE_URL}${endpoint}${separator}api_key=${apiKey}`;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...options.headers,
  } as Record<string, string>;

  logRequest(options.method || 'GET', url, headers);

  const startTime = Date.now();

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    const duration = Date.now() - startTime;
    const data = await response.json();

    // Log metrics
    logAPIMetrics(endpoint, duration, response.status);
    logAPIRequest(endpoint, options.method || 'GET', response.status, duration);

    if (!response.ok) {
      const errorMessage =
        data?.status_message ||
        data?.message ||
        `HTTP ${response.status}: ${response.statusText}`;

      const error = new APIResponseError(response.status, errorMessage, data);
      logError(error, endpoint, attemptNumber);

      // Retry if error is retryable and we haven't exceeded max retries
      if (isRetryableError(error) && attemptNumber < MAX_RETRIES) {
        const delay = getBackoffDelay(attemptNumber, BASE_BACKOFF_DELAY);
        console.log(
          `[TMDb API] Retrying after ${delay}ms (attempt ${attemptNumber + 1}/${MAX_RETRIES})`
        );
        await new Promise((resolve) => setTimeout(resolve, delay));
        return makeRequest<T>(endpoint, options, attemptNumber + 1);
      }

      throw error;
    }

    logResponse(response.status, response.statusText, data);
    return data as T;
  } catch (error) {
    const duration = Date.now() - startTime;

    if (error instanceof APIResponseError) {
      throw error;
    }

    if (error instanceof ValidationError) {
      throw error;
    }

    // Handle network errors with retry logic
    const networkError = new NetworkError(
      `Network error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      error
    );

    logError(networkError, endpoint, attemptNumber);

    // Retry network errors
    if (attemptNumber < MAX_RETRIES) {
      const delay = getBackoffDelay(attemptNumber, BASE_BACKOFF_DELAY);
      console.log(
        `[TMDb API] Retrying after ${delay}ms (attempt ${attemptNumber + 1}/${MAX_RETRIES})`
      );
      await new Promise((resolve) => setTimeout(resolve, delay));
      return makeRequest<T>(endpoint, options, attemptNumber + 1);
    }

    throw networkError;
  }
}

/**
 * Fetches trending movies for a given time window
 * @param timeWindow - 'day' or 'week' (default: 'day')
 * @param page - Page number for pagination (default: 1)
 * @returns APIResponse containing trending movies
 */
export async function getMoviesByTrending(
  timeWindow: 'day' | 'week' = 'day',
  page: number = 1
): Promise<APIResponse> {
  const endpoint = `/trending/movie/${timeWindow}?page=${page}`;
  try {
    const data = await makeRequest<APIResponse>(endpoint, {
      next: { revalidate: 3600, tags: ['trending-movies'] },
    });

    // Validate response against schema before returning
    const validatedData = apiResponseSchema.parse(data) as APIResponse;
    return validatedData;
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      const validationError = new ValidationError(
        `Invalid API response format: ${error.message}`,
        error
      );
      logError(validationError, endpoint);
      throw validationError;
    }
    throw error;
  }
}

/**
 * Searches for movies by query string
 * @param query - The search query
 * @param page - Page number for pagination (default: 1)
 * @returns APIResponse containing search results
 */
export async function searchMovies(
  query: string,
  page: number = 1
): Promise<APIResponse> {
  const encodedQuery = encodeURIComponent(query);
  const cacheKey = `${query}:${page}`;
  const endpoint = `/search/movie?query=${encodedQuery}&page=${page}`;

  // Check if result is in cache
  if (searchCache.has(cacheKey)) {
    return searchCache.get(cacheKey)!;
  }

  // Check if request is in-flight
  if (inFlightRequests.has(cacheKey)) {
    return inFlightRequests.get(cacheKey)!;
  }

  // Create new request and store in in-flight map
  const requestPromise = (async () => {
    try {
      const data = await makeRequest<APIResponse>(endpoint, {
        next: { revalidate: 3600, tags: [`search-results-${query}`] },
      });

      // Validate response against schema before returning
      const validatedData = apiResponseSchema.parse(data) as APIResponse;

      // Cache the result
      searchCache.set(cacheKey, validatedData);

      return validatedData;
    } catch (error) {
      if (error instanceof Error && error.name === 'ZodError') {
        const validationError = new ValidationError(
          `Invalid API response format: ${error.message}`,
          error
        );
        logError(validationError, endpoint);
        throw validationError;
      }
      throw error;
    } finally {
      // Clean up in-flight map entry
      inFlightRequests.delete(cacheKey);
    }
  })();

  // Store in-flight request
  inFlightRequests.set(cacheKey, requestPromise);

  return requestPromise;
}

/**
 * Fetches detailed information for a specific movie
 * @param movieId - The TMDb movie ID
 * @returns MovieDetails object with full movie information
 */
export async function getMovieDetails(movieId: number): Promise<MovieDetails> {
  const endpoint = `/movie/${movieId}`;
  try {
    const data = await makeRequest<MovieDetails>(endpoint, {
      next: { revalidate: 86400, tags: [`movie-details-${movieId}`] },
    });

    // Validate response against schema before returning
    const validatedData = movieDetailsSchema.parse(data);
    return validatedData;
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      const validationError = new ValidationError(
        `Invalid API response format: ${error.message}`,
        error
      );
      logError(validationError, endpoint);
      throw validationError;
    }
    throw error;
  }
}

/**
 * Fetches similar/related movies for a specific movie
 * @param movieId - The TMDb movie ID
 * @param page - Page number for pagination (default: 1)
 * @returns APIResponse containing similar movies
 */
export async function getSimilarMovies(
  movieId: number,
  page: number = 1
): Promise<APIResponse> {
  const endpoint = `/movie/${movieId}/similar?page=${page}`;
  try {
    const data = await makeRequest<APIResponse>(endpoint, {
      next: { revalidate: 86400, tags: [`similar-movies-${movieId}`] },
    });

    // Validate response against schema before returning
    const validatedData = apiResponseSchema.parse(data) as APIResponse;
    return validatedData;
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      const validationError = new ValidationError(
        `Invalid API response format: ${error.message}`,
        error
      );
      logError(validationError, endpoint);
      throw validationError;
    }
    throw error;
  }
}

/**
 * Fetches the list of official genres from TMDb
 * @returns Array of genre objects with id and name
 */
export async function getGenres(): Promise<Array<{ id: number; name: string }>> {
  const endpoint = '/genre/movie/list';
  try {
    const data = await makeRequest<{ genres: Array<{ id: number; name: string }> }>(endpoint, {
      next: { revalidate: 86400, tags: ['genres'] },
    });
    return data.genres || [];
  } catch (error) {
    logError(error as Error, endpoint);
    throw error;
  }
}

/**
 * Fetches movies by genre
 * @param genreId - The genre ID
 * @param page - Page number for pagination (default: 1)
 * @returns APIResponse containing movies in the specified genre
 */
export async function getMoviesByGenre(
  genreId: number,
  page: number = 1
): Promise<APIResponse> {
  const cacheKey = `genre-${genreId}:${page}`;
  const endpoint = `/discover/movie?with_genres=${genreId}&page=${page}&sort_by=popularity.desc`;

  // Check if result is in cache
  if (searchCache.has(cacheKey)) {
    return searchCache.get(cacheKey)!;
  }

  // Check if request is in-flight
  if (inFlightRequests.has(cacheKey)) {
    return inFlightRequests.get(cacheKey)!;
  }

  // Create new request and store in in-flight map
  const requestPromise = (async () => {
    try {
      const data = await makeRequest<APIResponse>(endpoint, {
        next: { revalidate: 3600, tags: [`genre-movies-${genreId}`] },
      });

      // Validate response against schema before returning
      const validatedData = apiResponseSchema.parse(data) as APIResponse;

      // Cache the result
      searchCache.set(cacheKey, validatedData);

      return validatedData;
    } catch (error) {
      if (error instanceof Error && error.name === 'ZodError') {
        const validationError = new ValidationError(
          `Invalid API response format: ${error.message}`,
          error
        );
        logError(validationError, endpoint);
        throw validationError;
      }
      throw error;
    } finally {
      // Clean up in-flight map entry
      inFlightRequests.delete(cacheKey);
    }
  })();

  // Store in-flight request
  inFlightRequests.set(cacheKey, requestPromise);

  return requestPromise;
}

/**
 * Fetches detailed information for a specific TV show
 * @param tvId - The TMDb TV show ID
 * @returns TVShowDetails object with full TV show information
 */
export async function getTVShowDetails(tvId: number): Promise<TVShowDetails> {
  const endpoint = `/tv/${tvId}`;
  try {
    const data = await makeRequest<TVShowDetails>(endpoint, {
      next: { revalidate: 86400, tags: [`tv-details-${tvId}`] },
    });
    return data;
  } catch (error) {
    logError(error as Error, endpoint);
    throw error;
  }
}

/**
 * Fetches detailed information for a specific season of a TV show
 * @param tvId - The TMDb TV show ID
 * @param seasonNumber - The season number
 * @returns TVSeasonDetails object with season and episode information
 */
export async function getTVSeasonDetails(
  tvId: number,
  seasonNumber: number
): Promise<TVSeasonDetails> {
  const endpoint = `/tv/${tvId}/season/${seasonNumber}`;
  try {
    const data = await makeRequest<TVSeasonDetails>(endpoint, {
      next: { revalidate: 86400, tags: [`tv-season-${tvId}-${seasonNumber}`] },
    });
    return data;
  } catch (error) {
    logError(error as Error, endpoint);
    throw error;
  }
}

/**
 * Fetches similar/related TV shows for a specific TV show
 * @param tvId - The TMDb TV show ID
 * @param page - Page number for pagination (default: 1)
 * @returns APIResponse containing similar TV shows
 */
export async function getSimilarTVShows(
  tvId: number,
  page: number = 1
): Promise<APIResponse> {
  const endpoint = `/tv/${tvId}/similar?page=${page}`;
  try {
    const data = await makeRequest<APIResponse>(endpoint, {
      next: { revalidate: 86400, tags: [`similar-tv-${tvId}`] },
    });
    const validatedData = apiResponseSchema.parse(data) as APIResponse;
    return validatedData;
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      const validationError = new ValidationError(
        `Invalid API response format: ${error.message}`,
        error
      );
      logError(validationError, endpoint);
      throw validationError;
    }
    throw error;
  }
}

/**
 * Searches for TV shows by query string
 * @param query - The search query
 * @param page - Page number for pagination (default: 1)
 * @returns APIResponse containing search results
 */
export async function searchTVShows(
  query: string,
  page: number = 1
): Promise<APIResponse> {
  const encodedQuery = encodeURIComponent(query);
  const cacheKey = `tv-${query}:${page}`;
  const endpoint = `/search/tv?query=${encodedQuery}&page=${page}`;

  if (searchCache.has(cacheKey)) {
    return searchCache.get(cacheKey)!;
  }

  if (inFlightRequests.has(cacheKey)) {
    return inFlightRequests.get(cacheKey)!;
  }

  const requestPromise = (async () => {
    try {
      const data = await makeRequest<any>(endpoint, {
        next: { revalidate: 3600, tags: [`search-tv-${query}`] },
      });

      // Normalize TV show data to match Movie schema
      const normalizedData = {
        ...data,
        results: (data.results || []).map((show: any) => ({
          id: show.id,
          title: show.name, // Map name to title
          poster_path: show.poster_path,
          release_date: show.first_air_date, // Map first_air_date to release_date
          vote_average: show.vote_average,
          overview: show.overview,
          // Keep original fields for reference
          name: show.name,
          first_air_date: show.first_air_date,
        })),
      };

      const validatedData = apiResponseSchema.parse(normalizedData) as APIResponse;
      searchCache.set(cacheKey, validatedData);
      return validatedData;
    } catch (error) {
      if (error instanceof Error && error.name === 'ZodError') {
        const validationError = new ValidationError(
          `Invalid API response format: ${error.message}`,
          error
        );
        logError(validationError, endpoint);
        throw validationError;
      }
      throw error;
    } finally {
      inFlightRequests.delete(cacheKey);
    }
  })();

  inFlightRequests.set(cacheKey, requestPromise);
  return requestPromise;
}
