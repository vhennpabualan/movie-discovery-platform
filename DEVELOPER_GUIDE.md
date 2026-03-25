# Movie Discovery Platform - Developer Guide

Welcome to the Movie Discovery Platform! This guide covers everything you need to know to develop, test, and deploy the application.

## Table of Contents

1. [Project Overview](#project-overview)
2. [Setup Instructions](#setup-instructions)
3. [Project Structure](#project-structure)
4. [API Client Usage](#api-client-usage)
5. [Component Documentation](#component-documentation)
6. [Development Workflow](#development-workflow)
7. [Testing](#testing)
8. [Performance Monitoring](#performance-monitoring)

---

## Project Overview

The Movie Discovery Platform is a Next.js 16 application that enables users to discover, search, and manage movies using the TMDb API. Built with TypeScript, Tailwind CSS, and React Server Components, it prioritizes type safety, performance, and accessibility.

### Key Technologies

- **Next.js 16** with App Router for server-side rendering and static generation
- **TypeScript** with strict mode for type safety
- **Tailwind CSS** for styling with dark-mode Netflix aesthetic
- **React Server Components** for efficient data fetching
- **Zod** for runtime validation of API responses
- **Jest & React Testing Library** for testing

### Architecture Highlights

- **Feature-based folder structure** for scalability and maintainability
- **Server components** for data fetching and static generation
- **Client components** for interactivity and browser APIs
- **Incremental Static Regeneration (ISR)** for fresh content without rebuilds
- **Revalidation tags** for on-demand cache invalidation
- **Image optimization** with Next.js Image component

---

## Setup Instructions

### Prerequisites

- Node.js 18+ and npm/yarn
- TMDb API key (free account at https://www.themoviedb.org/settings/api)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd movie-discovery-platform
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   
   Create a `.env.local` file in the project root:
   ```env
   NEXT_PUBLIC_TMDB_API_KEY=your_tmdb_api_key_here
   ```

   Get your API key from [TMDb API Settings](https://www.themoviedb.org/settings/api)

4. **Run the development server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

### Available Scripts

```bash
# Development server with hot reload
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run tests
npm test

# Run tests in watch mode
npm run test:watch
```

---

## Project Structure

```
movie-discovery-platform/
├── src/
│   ├── app/                          # Next.js App Router pages
│   │   ├── layout.tsx               # Root layout with navigation
│   │   ├── page.tsx                 # Homepage with trending movies
│   │   ├── movies/[id]/page.tsx     # Movie details page
│   │   ├── search/page.tsx          # Search results page
│   │   └── watchlist/page.tsx       # Watchlist page
│   │
│   ├── features/                     # Feature-based modules
│   │   ├── movies/                  # Movie discovery feature
│   │   │   ├── components/          # Movie-related components
│   │   │   ├── hooks/               # Movie-specific hooks
│   │   │   ├── types/               # Movie type definitions
│   │   │   └── utils/               # Movie utilities
│   │   │
│   │   ├── search/                  # Search feature
│   │   │   ├── components/          # SearchBar component
│   │   │   ├── hooks/               # useSearchParams hook
│   │   │   ├── types/               # Search types
│   │   │   └── utils/               # Search utilities
│   │   │
│   │   ├── watchlist/               # Watchlist feature
│   │   │   ├── actions/             # Server actions
│   │   │   ├── components/          # Watchlist components
│   │   │   ├── hooks/               # Watchlist hooks
│   │   │   └── types/               # Watchlist types
│   │   │
│   │   └── ui/                      # Shared UI components
│   │       ├── components/          # ErrorBoundary, LoadingSkeleton, etc.
│   │       ├── hooks/               # UI-related hooks
│   │       └── types/               # UI types
│   │
│   ├── lib/                          # Shared utilities and services
│   │   ├── api/                     # TMDb API client
│   │   ├── validation/              # Zod schemas
│   │   ├── parsers/                 # Data parsing utilities
│   │   ├── printers/                # Data serialization
│   │   ├── monitoring/              # Performance & error tracking
│   │   ├── hooks/                   # Shared hooks
│   │   └── revalidation.ts          # ISR revalidation helpers
│   │
│   └── types/                        # Global TypeScript types
│       ├── movie.ts
│       ├── movie-details.ts
│       ├── api-response.ts
│       └── index.ts
│
├── public/                           # Static assets
├── jest.config.js                   # Jest configuration
├── jest.setup.js                    # Jest setup file
├── next.config.ts                   # Next.js configuration
├── tailwind.config.ts               # Tailwind CSS configuration
├── tsconfig.json                    # TypeScript configuration
└── package.json                     # Dependencies and scripts
```

### Folder Organization Conventions

**Features** are organized by domain (movies, search, watchlist, ui):
- Each feature has `components/`, `hooks/`, `types/`, and `utils/` subdirectories
- Components are co-located with their tests (`.test.tsx` suffix)
- Hooks are isolated and reusable within the feature

**Lib** contains shared utilities:
- `api/` - API client and error handling
- `validation/` - Zod schemas for runtime validation
- `monitoring/` - Performance and error tracking
- `hooks/` - Shared hooks used across features

**Types** are global TypeScript interfaces:
- Centralized type definitions for consistency
- Exported from `types/index.ts` for easy importing

---

## API Client Usage

The TMDb API client is located at `src/lib/api/tmdb-client.ts` and provides a clean, type-safe interface for fetching movie data.

### Configuration

Set your TMDb API key in `.env.local`:
```env
NEXT_PUBLIC_TMDB_API_KEY=your_api_key_here
```

### Available Functions

#### `getMoviesByTrending(timeWindow?: 'day' | 'week', page?: number)`

Fetch trending movies for a given time window.

```typescript
import { getMoviesByTrending } from '@/lib/api/tmdb-client';

// Fetch today's trending movies
const response = await getMoviesByTrending();

// Fetch this week's trending movies
const weeklyTrending = await getMoviesByTrending('week');

// Fetch with pagination
const page2 = await getMoviesByTrending('day', 2);
```

**Returns:** `APIResponse` with trending movies array

#### `searchMovies(query: string, page?: number)`

Search for movies by title.

```typescript
import { searchMovies } from '@/lib/api/tmdb-client';

// Search for movies
const results = await searchMovies('Inception');

// Search with pagination
const page2 = await searchMovies('Inception', 2);
```

**Returns:** `APIResponse` with search results

#### `getMovieDetails(movieId: number)`

Fetch detailed information for a specific movie.

```typescript
import { getMovieDetails } from '@/lib/api/tmdb-client';

// Fetch movie details
const details = await getMovieDetails(550); // Fight Club
```

**Returns:** `MovieDetails` object with full movie information

### Error Handling

All API functions throw `TMDbAPIError` on failure:

```typescript
import { getMoviesByTrending, TMDbAPIError } from '@/lib/api/tmdb-client';

try {
  const movies = await getMoviesByTrending();
} catch (error) {
  if (error instanceof TMDbAPIError) {
    console.error(`API Error (${error.statusCode}): ${error.message}`);
    // Handle specific error codes
    if (error.statusCode === 401) {
      // Invalid API key
    } else if (error.statusCode === 429) {
      // Rate limit exceeded
    }
  }
}
```

### Response Types

All responses are fully typed:

```typescript
import { APIResponse, MovieDetails } from '@/types';

const response: APIResponse = await getMoviesByTrending();
// response.results: Movie[]
// response.page: number
// response.total_pages: number

const details: MovieDetails = await getMovieDetails(550);
// details.id, title, poster_path, release_date (from Movie)
// details.overview, genres, runtime, vote_average (from MovieDetails)
```

### Revalidation Tags

The API client automatically attaches revalidation tags for ISR:

```typescript
import { revalidateTag } from 'next/cache';

// Revalidate trending movies cache
revalidateTag('trending-movies');

// Revalidate specific search results
revalidateTag('search-results-inception');

// Revalidate specific movie details
revalidateTag('movie-details-550');
```

---

## Component Documentation

### Core Components

#### MovieCard

Displays a single movie poster with hover effects and watchlist status.

**Location:** `src/features/movies/components/MovieCard.tsx`

**Props:**
```typescript
interface MovieCardProps {
  movie: Movie & { vote_average?: number };
  onClick: (movieId: number) => void;
  isInWatchlist?: boolean;
}
```

**Usage:**
```typescript
import { MovieCard } from '@/features/movies/components/MovieCard';

<MovieCard
  movie={movieData}
  onClick={(id) => router.push(`/movies/${id}`)}
  isInWatchlist={true}
/>
```

**Features:**
- Keyboard navigation (Tab, Enter)
- Hover effects with title and rating display
- Watchlist badge indicator
- View Transitions API support
- Accessibility: aria-label, tabindex, keyboard support

#### MovieCarousel

Displays a horizontal scrollable carousel of movie cards.

**Location:** `src/features/movies/components/MovieCarousel.tsx`

**Props:**
```typescript
interface MovieCarouselProps {
  movies: (Movie & { vote_average?: number })[];
  onMovieClick?: (movieId: number) => void;
  watchlistIds?: number[];
}
```

**Usage:**
```typescript
import { MovieCarousel } from '@/features/movies/components/MovieCarousel';

<MovieCarousel
  movies={trendingMovies}
  onMovieClick={(id) => router.push(`/movies/${id}`)}
  watchlistIds={[1, 2, 3]}
/>
```

**Features:**
- Responsive layout: 1 column mobile, 2 tablet, 4 desktop
- Smooth horizontal scrolling
- Left/right navigation buttons
- Keyboard accessible scroll buttons

#### SearchBar

Search input with debouncing and dropdown results.

**Location:** `src/features/search/components/SearchBar.tsx`

**Props:** None (uses hooks internally)

**Usage:**
```typescript
import { SearchBar } from '@/features/search/components/SearchBar';

<SearchBar />
```

**Features:**
- 300ms debounce on input
- Dropdown results with keyboard navigation
- URL state management (?q=query)
- Keyboard support: Arrow keys, Enter, Escape
- Accessibility: aria-label, aria-autocomplete, aria-expanded

#### LoadingSkeleton

Placeholder component for loading states.

**Location:** `src/features/ui/components/LoadingSkeleton.tsx`

**Props:**
```typescript
interface LoadingSkeletonProps {
  count?: number;
  width?: string;
  height?: string;
}
```

**Usage:**
```typescript
import { LoadingSkeleton } from '@/features/ui/components/LoadingSkeleton';

<LoadingSkeleton count={4} width="w-full" height="h-64" />
```

**Features:**
- Animated placeholder cards
- Prevents layout shift
- Customizable dimensions

#### ErrorBoundary

Catches and displays errors from child components.

**Location:** `src/features/ui/components/ErrorBoundary.tsx`

**Props:**
```typescript
interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}
```

**Usage:**
```typescript
import { ErrorBoundary } from '@/features/ui/components/ErrorBoundary';

<ErrorBoundary>
  <TrendingMovies />
</ErrorBoundary>
```

**Features:**
- Error catching and logging
- User-friendly error messages
- Retry button
- Monitoring service integration

#### MoviePoster

Optimized image component for movie posters.

**Location:** `src/features/movies/components/MoviePoster.tsx`

**Props:**
```typescript
interface MoviePosterProps {
  posterPath: string;
  title: string;
  priority?: boolean;
}
```

**Usage:**
```typescript
import { MoviePoster } from '@/features/movies/components/MoviePoster';

<MoviePoster
  posterPath="/path/to/poster.jpg"
  title="Movie Title"
  priority={true}
/>
```

**Features:**
- Next.js Image optimization
- Responsive sizing
- Priority loading for above-the-fold images

### Server Components

#### TrendingMovies

Fetches and displays trending movies (Server Component).

**Location:** `src/features/movies/components/TrendingMovies.tsx`

**Usage:**
```typescript
import { TrendingMovies } from '@/features/movies/components/TrendingMovies';

<TrendingMovies />
```

**Features:**
- Server-side data fetching
- ISR with 1-hour revalidation
- Revalidation tag: 'trending-movies'

#### TrendingMoviesSuspense

Wraps TrendingMovies with Suspense boundary.

**Location:** `src/features/movies/components/TrendingMoviesSuspense.tsx`

**Usage:**
```typescript
import { TrendingMoviesSuspense } from '@/features/movies/components/TrendingMoviesSuspense';

<TrendingMoviesSuspense />
```

**Features:**
- Loading skeleton fallback
- Suspense boundary for streaming

#### RelatedMovies

Fetches and displays related movies for a given movie ID (Server Component).

**Location:** `src/features/movies/components/RelatedMovies.tsx`

**Props:**
```typescript
interface RelatedMoviesProps {
  movieId: number;
}
```

**Usage:**
```typescript
import { RelatedMovies } from '@/features/movies/components/RelatedMovies';

<RelatedMovies movieId={550} />
```

### Watchlist Components

#### AddToWatchlistButton

Client component that calls a server action to add/remove movies from watchlist.

**Location:** `src/features/watchlist/components/AddToWatchlistButton.tsx`

**Props:**
```typescript
interface AddToWatchlistButtonProps {
  movieId: number;
  isInWatchlist?: boolean;
}
```

**Usage:**
```typescript
import { AddToWatchlistButton } from '@/features/watchlist/components/AddToWatchlistButton';

<AddToWatchlistButton movieId={550} isInWatchlist={false} />
```

**Features:**
- Server action integration
- Loading state handling
- Optimistic UI updates
- Error handling with user feedback

#### WatchlistItem

Displays a movie in the watchlist with remove button.

**Location:** `src/features/watchlist/components/WatchlistItem.tsx`

**Props:**
```typescript
interface WatchlistItemProps {
  movie: Movie;
  onRemove: (movieId: number) => void;
}
```

---

## Development Workflow

### Creating a New Component

1. **Create the component file** in the appropriate feature directory:
   ```
   src/features/[feature]/components/MyComponent.tsx
   ```

2. **Add TypeScript types** for props:
   ```typescript
   interface MyComponentProps {
     title: string;
     onClick: () => void;
   }
   ```

3. **Implement the component**:
   ```typescript
   'use client'; // if client component

   export function MyComponent({ title, onClick }: MyComponentProps) {
     return <button onClick={onClick}>{title}</button>;
   }
   ```

4. **Create tests** in the same directory:
   ```
   src/features/[feature]/components/MyComponent.test.tsx
   ```

5. **Export from index** (if needed):
   ```typescript
   // src/features/[feature]/components/index.ts
   export { MyComponent } from './MyComponent';
   ```

### Using Absolute Imports

All imports use the `@/` alias configured in `tsconfig.json`:

```typescript
// ✅ Good
import { MovieCard } from '@/features/movies/components/MovieCard';
import { APIResponse } from '@/types';

// ❌ Avoid
import { MovieCard } from '../../../features/movies/components/MovieCard';
```

### Adding Environment Variables

1. Add to `.env.local`:
   ```env
   NEXT_PUBLIC_TMDB_API_KEY=your_key
   ```

2. Access in code:
   ```typescript
   const apiKey = process.env.NEXT_PUBLIC_TMDB_API_KEY;
   ```

**Note:** Variables prefixed with `NEXT_PUBLIC_` are exposed to the browser.

---

## Testing

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run specific test file
npm test MovieCard.test.tsx
```

### Writing Unit Tests

Tests are co-located with components using `.test.tsx` suffix:

```typescript
// src/features/movies/components/MovieCard.test.tsx
import { render, screen } from '@testing-library/react';
import { MovieCard } from './MovieCard';

describe('MovieCard', () => {
  it('renders movie title', () => {
    const movie = {
      id: 1,
      title: 'Test Movie',
      poster_path: '/path.jpg',
      release_date: '2024-01-01',
    };

    render(
      <MovieCard
        movie={movie}
        onClick={jest.fn()}
      />
    );

    expect(screen.getByText('Test Movie')).toBeInTheDocument();
  });
});
```

### Test Structure

- **Unit tests** verify individual components and functions
- **Integration tests** verify feature workflows
- **Property-based tests** verify universal properties across inputs

### Testing Best Practices

1. Test user interactions, not implementation details
2. Use semantic queries: `getByRole`, `getByLabelText`
3. Avoid mocking unless necessary
4. Test accessibility features (keyboard, ARIA labels)
5. Keep tests focused and readable

---

## Performance Monitoring

### Core Web Vitals

The application tracks Core Web Vitals (LCP, FID, CLS):

```typescript
import { trackWebVitals } from '@/lib/monitoring/web-vitals';

trackWebVitals((metric) => {
  console.log(metric);
  // Send to monitoring service
});
```

### API Performance Logging

API response times are logged automatically:

```typescript
import { logApiRequest } from '@/lib/monitoring/api-logger';

// Logs are created automatically by the API client
// Check console in development for request details
```

### Performance Dashboard

View performance metrics at `/performance` (development only):

```typescript
import { PerformanceDashboard } from '@/features/ui/components/PerformanceDashboard';

<PerformanceDashboard />
```

### Monitoring Best Practices

1. Monitor Core Web Vitals regularly
2. Flag API requests taking > 2 seconds
3. Track error rates and types
4. Use performance dashboard for analysis
5. Optimize based on real user metrics

---

## Troubleshooting

### API Key Issues

**Error:** "401 Unauthorized"
- Verify API key in `.env.local`
- Check key is valid at https://www.themoviedb.org/settings/api
- Ensure `NEXT_PUBLIC_TMDB_API_KEY` is set correctly

### Build Errors

**Error:** "TypeScript compilation failed"
- Run `npm run build` to see full error
- Check for `any` types (not allowed in strict mode)
- Verify all imports resolve correctly

### Test Failures

**Error:** "Tests failing after changes"
- Run `npm test` to see detailed error messages
- Check component props match test expectations
- Verify mocks are set up correctly

---

## Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [TMDb API Documentation](https://developer.themoviedb.org/docs)
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)

