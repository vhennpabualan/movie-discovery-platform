# Component Reference Guide

Complete documentation for all Movie Discovery Platform components with examples and API details.

## Table of Contents

1. [Movie Components](#movie-components)
2. [Search Components](#search-components)
3. [Watchlist Components](#watchlist-components)
4. [UI Components](#ui-components)
5. [Server Components](#server-components)

---

## Movie Components

### MovieCard

A clickable movie poster card with hover effects, rating display, and watchlist indicator.

**File:** `src/features/movies/components/MovieCard.tsx`

**Type:** Client Component

**Props:**
```typescript
interface MovieCardProps {
  movie: Movie & { vote_average?: number };
  onClick: (movieId: number) => void;
  isInWatchlist?: boolean;
}
```

**Props Details:**
- `movie` - Movie object with optional vote_average for rating display
- `onClick` - Callback fired when card is clicked or Enter key pressed
- `isInWatchlist` - Shows watchlist badge when true (default: false)

**Example:**
```typescript
import { MovieCard } from '@/features/movies/components/MovieCard';
import { useRouter } from 'next/navigation';

export function MovieGrid({ movies, watchlistIds }) {
  const router = useRouter();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {movies.map((movie) => (
        <MovieCard
          key={movie.id}
          movie={movie}
          onClick={(id) => router.push(`/movies/${id}`)}
          isInWatchlist={watchlistIds.includes(movie.id)}
        />
      ))}
    </div>
  );
}
```

**Features:**
- **Keyboard Navigation:** Tab to focus, Enter to select
- **Hover Effects:** Brightened image, title and rating display
- **Accessibility:** aria-label with title and release year
- **View Transitions:** Smooth animation to details page
- **Watchlist Badge:** Red checkmark indicator when in watchlist

**Styling:**
- Dark background with Netflix red accents
- Hover scale effect (105%)
- Shadow effect on hover
- Smooth transitions (300ms)

---

### MovieCarousel

Horizontal scrollable carousel displaying multiple movie cards with navigation buttons.

**File:** `src/features/movies/components/MovieCarousel.tsx`

**Type:** Client Component

**Props:**
```typescript
interface MovieCarouselProps {
  movies: (Movie & { vote_average?: number })[];
  onMovieClick?: (movieId: number) => void;
  watchlistIds?: number[];
}
```

**Props Details:**
- `movies` - Array of movies to display
- `onMovieClick` - Callback when a movie card is clicked (default: no-op)
- `watchlistIds` - Array of movie IDs in watchlist (default: [])

**Example:**
```typescript
import { MovieCarousel } from '@/features/movies/components/MovieCarousel';

export function TrendingSection({ trendingMovies, watchlistIds }) {
  return (
    <section className="py-8">
      <h2 className="text-2xl font-bold mb-4">Trending Now</h2>
      <MovieCarousel
        movies={trendingMovies}
        onMovieClick={(id) => router.push(`/movies/${id}`)}
        watchlistIds={watchlistIds}
      />
    </section>
  );
}
```

**Features:**
- **Responsive Layout:** 1 column mobile, 2 tablet, 4 desktop
- **Smooth Scrolling:** 400px scroll per button click
- **Navigation Buttons:** Left/right arrows (hidden on mobile)
- **Empty State:** "No movies available" message
- **Keyboard Accessible:** Focus-visible ring on buttons

**Responsive Behavior:**
- Mobile (<640px): Full width, 1 column
- Tablet (640px-1024px): 50% width, 2 columns
- Desktop (>1024px): 25% width, 4 columns

---

### MoviePoster

Optimized image component for movie posters using Next.js Image.

**File:** `src/features/movies/components/MoviePoster.tsx`

**Type:** Client Component

**Props:**
```typescript
interface MoviePosterProps {
  posterPath: string;
  title: string;
  priority?: boolean;
}
```

**Props Details:**
- `posterPath` - TMDb poster path (e.g., "/path/to/poster.jpg")
- `title` - Movie title for alt text
- `priority` - Load image with priority (default: false)

**Example:**
```typescript
import { MoviePoster } from '@/features/movies/components/MoviePoster';

export function MovieDetailsHeader({ movie }) {
  return (
    <div className="flex gap-8">
      <MoviePoster
        posterPath={movie.poster_path}
        title={movie.title}
        priority={true}
      />
      <div>
        <h1>{movie.title}</h1>
        <p>{movie.overview}</p>
      </div>
    </div>
  );
}
```

**Features:**
- **Image Optimization:** Automatic format conversion and sizing
- **Responsive Sizing:** Adapts to container width
- **Priority Loading:** Use for above-the-fold images
- **Lazy Loading:** Default for below-the-fold images
- **Fallback:** Placeholder while loading

---

### RelatedMovies

Server component that fetches and displays related movies for a given movie ID.

**File:** `src/features/movies/components/RelatedMovies.tsx`

**Type:** Server Component

**Props:**
```typescript
interface RelatedMoviesProps {
  movieId: number;
}
```

**Example:**
```typescript
import { RelatedMovies } from '@/features/movies/components/RelatedMovies';
import { Suspense } from 'react';
import { LoadingSkeleton } from '@/features/ui/components/LoadingSkeleton';

export function MovieDetailsPage({ movieId }) {
  return (
    <div>
      {/* Main content */}
      
      <section className="mt-12">
        <h2 className="text-2xl font-bold mb-4">Related Movies</h2>
        <Suspense fallback={<LoadingSkeleton count={4} />}>
          <RelatedMovies movieId={movieId} />
        </Suspense>
      </section>
    </div>
  );
}
```

**Features:**
- **Server-Side Fetching:** No client-side data loading
- **ISR Support:** Revalidation tag 'movie-details-{id}'
- **Error Handling:** Graceful error display
- **Carousel Display:** Uses MovieCarousel for layout

---

### RelatedMoviesSuspense

Wrapper component combining RelatedMovies with Suspense boundary.

**File:** `src/features/movies/components/RelatedMoviesSuspense.tsx`

**Type:** Client Component

**Props:**
```typescript
interface RelatedMoviesSuspenseProps {
  movieId: number;
}
```

**Example:**
```typescript
import { RelatedMoviesSuspense } from '@/features/movies/components/RelatedMoviesSuspense';

export function MovieDetailsPage({ movieId }) {
  return (
    <div>
      {/* Main content */}
      <RelatedMoviesSuspense movieId={movieId} />
    </div>
  );
}
```

**Features:**
- **Built-in Suspense:** No need to wrap manually
- **Loading Skeleton:** Automatic fallback UI
- **Simplified Usage:** Single component instead of Suspense + RelatedMovies

---

### TrendingMovies

Server component that fetches trending movies from TMDb API.

**File:** `src/features/movies/components/TrendingMovies.tsx`

**Type:** Server Component

**Props:** None

**Example:**
```typescript
import { TrendingMovies } from '@/features/movies/components/TrendingMovies';

export function HomePage() {
  return (
    <section className="py-12">
      <h2 className="text-3xl font-bold mb-6">Trending Now</h2>
      <TrendingMovies />
    </section>
  );
}
```

**Features:**
- **Server-Side Fetching:** Fetches from /trending/movie/day endpoint
- **ISR:** 1-hour revalidation with 'trending-movies' tag
- **Type-Safe:** Returns fully typed APIResponse
- **Error Handling:** Throws descriptive errors

---

### TrendingMoviesSuspense

Wrapper combining TrendingMovies with Suspense boundary and loading skeleton.

**File:** `src/features/movies/components/TrendingMoviesSuspense.tsx`

**Type:** Client Component

**Props:** None

**Example:**
```typescript
import { TrendingMoviesSuspense } from '@/features/movies/components/TrendingMoviesSuspense';

export function HomePage() {
  return (
    <section className="py-12">
      <h2 className="text-3xl font-bold mb-6">Trending Now</h2>
      <TrendingMoviesSuspense />
    </section>
  );
}
```

**Features:**
- **Built-in Suspense:** Automatic loading state
- **Skeleton Fallback:** Matches carousel layout
- **Simplified Usage:** Single component for complete feature

---

## Search Components

### SearchBar

Client component with debounced search input, dropdown results, and keyboard navigation.

**File:** `src/features/search/components/SearchBar.tsx`

**Type:** Client Component

**Props:** None (uses hooks internally)

**Example:**
```typescript
import { SearchBar } from '@/features/search/components/SearchBar';

export function Header() {
  return (
    <header className="bg-netflix-dark p-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <h1>Movie Discovery</h1>
        <SearchBar />
      </div>
    </header>
  );
}
```

**Features:**
- **Debounced Search:** 300ms delay before API call
- **Dropdown Results:** Shows up to 20 results
- **Keyboard Navigation:** Arrow keys, Enter, Escape
- **URL State:** Updates ?q=query parameter
- **Accessibility:** Full ARIA support

**Keyboard Shortcuts:**
- `ArrowDown` - Move to next result
- `ArrowUp` - Move to previous result
- `Enter` - Navigate to selected movie
- `Escape` - Close dropdown

**Accessibility:**
- `aria-label` on input
- `aria-autocomplete="list"` for screen readers
- `aria-expanded` indicates dropdown state
- `role="listbox"` and `role="option"` for results

---

## Watchlist Components

### AddToWatchlistButton

Client component that calls server action to add/remove movies from watchlist.

**File:** `src/features/watchlist/components/AddToWatchlistButton.tsx`

**Type:** Client Component

**Props:**
```typescript
interface AddToWatchlistButtonProps {
  movieId: number;
  isInWatchlist?: boolean;
}
```

**Props Details:**
- `movieId` - ID of movie to add/remove
- `isInWatchlist` - Current watchlist status (default: false)

**Example:**
```typescript
import { AddToWatchlistButton } from '@/features/watchlist/components/AddToWatchlistButton';

export function MovieDetailsPage({ movie, isInWatchlist }) {
  return (
    <div>
      <h1>{movie.title}</h1>
      <AddToWatchlistButton
        movieId={movie.id}
        isInWatchlist={isInWatchlist}
      />
    </div>
  );
}
```

**Features:**
- **Server Action Integration:** Calls add-to-watchlist server action
- **Loading State:** Shows spinner during request
- **Optimistic Updates:** UI updates immediately
- **Error Handling:** Shows error message on failure
- **Accessibility:** aria-pressed attribute

**Button States:**
- Default: "Add to Watchlist"
- Loading: Spinner with disabled state
- Added: "Remove from Watchlist"
- Error: Shows error message with retry

---

### WatchlistItem

Displays a movie in the watchlist with remove button.

**File:** `src/features/watchlist/components/WatchlistItem.tsx`

**Type:** Client Component

**Props:**
```typescript
interface WatchlistItemProps {
  movie: Movie;
  onRemove: (movieId: number) => void;
}
```

**Example:**
```typescript
import { WatchlistItem } from '@/features/watchlist/components/WatchlistItem';

export function WatchlistPage({ movies }) {
  const handleRemove = async (movieId: number) => {
    // Call server action to remove
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {movies.map((movie) => (
        <WatchlistItem
          key={movie.id}
          movie={movie}
          onRemove={handleRemove}
        />
      ))}
    </div>
  );
}
```

**Features:**
- **Movie Display:** Shows poster and title
- **Remove Button:** Calls onRemove callback
- **Confirmation:** Optional confirmation before removal
- **Loading State:** Shows spinner during removal

---

### WatchlistContent

Server component that displays watchlist content.

**File:** `src/features/watchlist/components/WatchlistContent.tsx`

**Type:** Server Component

**Props:** None

**Example:**
```typescript
import { WatchlistContent } from '@/features/watchlist/components/WatchlistContent';

export function WatchlistPage() {
  return (
    <main>
      <h1>My Watchlist</h1>
      <WatchlistContent />
    </main>
  );
}
```

**Features:**
- **Server-Side Fetching:** Fetches user's watchlist
- **Empty State:** Shows message when empty
- **Grid Layout:** Responsive movie grid
- **Remove Integration:** Integrated remove functionality

---

## UI Components

### LoadingSkeleton

Animated placeholder component for loading states.

**File:** `src/features/ui/components/LoadingSkeleton.tsx`

**Type:** Client Component

**Props:**
```typescript
interface LoadingSkeletonProps {
  count?: number;
  width?: string;
  height?: string;
}
```

**Props Details:**
- `count` - Number of skeleton items (default: 4)
- `width` - Tailwind width class (default: "w-full")
- `height` - Tailwind height class (default: "h-64")

**Example:**
```typescript
import { LoadingSkeleton } from '@/features/ui/components/LoadingSkeleton';
import { Suspense } from 'react';

export function MovieGrid() {
  return (
    <Suspense fallback={<LoadingSkeleton count={8} width="w-full" height="h-80" />}>
      <MovieCarousel movies={movies} />
    </Suspense>
  );
}
```

**Features:**
- **Animated Pulse:** CSS animation indicates loading
- **Layout Prevention:** Matches final component dimensions
- **Customizable:** Adjust count, width, height
- **Responsive:** Adapts to container

---

### ErrorBoundary

Error boundary component that catches and displays errors from child components.

**File:** `src/features/ui/components/ErrorBoundary.tsx`

**Type:** Client Component

**Props:**
```typescript
interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}
```

**Props Details:**
- `children` - Child components to wrap
- `fallback` - Custom error UI (optional)

**Example:**
```typescript
import { ErrorBoundary } from '@/features/ui/components/ErrorBoundary';
import { TrendingMovies } from '@/features/movies/components/TrendingMovies';

export function HomePage() {
  return (
    <ErrorBoundary>
      <TrendingMovies />
    </ErrorBoundary>
  );
}
```

**Features:**
- **Error Catching:** Catches errors from child components
- **User-Friendly Messages:** Displays helpful error text
- **Retry Button:** Allows user to retry operation
- **Error Logging:** Sends errors to monitoring service
- **Fallback UI:** Custom error display option

**Default Error Message:**
"Something went wrong. Please try again."

---

### PerformanceDashboard

Development-only component displaying Core Web Vitals and API performance metrics.

**File:** `src/features/ui/components/PerformanceDashboard.tsx`

**Type:** Client Component

**Props:** None

**Example:**
```typescript
import { PerformanceDashboard } from '@/features/ui/components/PerformanceDashboard';

export function DebugPage() {
  return (
    <div>
      <h1>Performance Metrics</h1>
      <PerformanceDashboard />
    </div>
  );
}
```

**Features:**
- **Core Web Vitals:** LCP, FID, CLS metrics
- **API Performance:** Request times and status
- **Real-Time Updates:** Live metric tracking
- **Development Only:** Hidden in production

---

### MobileNav

Mobile navigation menu component.

**File:** `src/features/ui/components/MobileNav.tsx`

**Type:** Client Component

**Props:** None

**Example:**
```typescript
import { MobileNav } from '@/features/ui/components/MobileNav';

export function Header() {
  return (
    <header>
      <div className="hidden md:block">
        {/* Desktop navigation */}
      </div>
      <div className="md:hidden">
        <MobileNav />
      </div>
    </header>
  );
}
```

**Features:**
- **Hamburger Menu:** Toggle navigation
- **Mobile Optimized:** Touch-friendly
- **Responsive:** Hidden on desktop

---

### WebVitalsInitializer

Component that initializes Core Web Vitals tracking.

**File:** `src/features/ui/components/WebVitalsInitializer.tsx`

**Type:** Client Component

**Props:** None

**Example:**
```typescript
import { WebVitalsInitializer } from '@/features/ui/components/WebVitalsInitializer';

export function RootLayout({ children }) {
  return (
    <html>
      <body>
        <WebVitalsInitializer />
        {children}
      </body>
    </html>
  );
}
```

**Features:**
- **Automatic Tracking:** Initializes on mount
- **Metric Collection:** Gathers LCP, FID, CLS
- **Monitoring Integration:** Sends to monitoring service

---

## Server Components

### TrendingMovies

Fetches trending movies from TMDb API (Server Component).

**File:** `src/features/movies/components/TrendingMovies.tsx`

**Type:** Server Component

**Features:**
- Fetches from `/trending/movie/day` endpoint
- ISR with 1-hour revalidation
- Revalidation tag: 'trending-movies'
- Returns MovieCarousel with data

---

### RelatedMovies

Fetches related movies for a given movie ID (Server Component).

**File:** `src/features/movies/components/RelatedMovies.tsx`

**Type:** Server Component

**Features:**
- Fetches similar movies from TMDb
- ISR with revalidation tag
- Returns MovieCarousel with related movies

---

### WatchlistContent

Fetches and displays user's watchlist (Server Component).

**File:** `src/features/watchlist/components/WatchlistContent.tsx`

**Type:** Server Component

**Features:**
- Fetches user's watchlist
- Displays in responsive grid
- Integrated remove functionality

---

## Styling & Theming

### Color Palette

All components use the Netflix-inspired color scheme:

```typescript
// Tailwind config colors
{
  'netflix-dark': '#0f0f0f',           // Primary background
  'netflix-dark-secondary': '#1a1a1a', // Secondary background
  'netflix-red': '#e50914',            // Primary accent
  'netflix-gray': '#808080',           // Secondary text
}
```

### Responsive Breakpoints

```typescript
// Tailwind breakpoints
{
  'mobile': '0px',      // < 640px
  'sm': '640px',        // Tablet
  'md': '768px',
  'lg': '1024px',       // Desktop
  'xl': '1280px',
  '2xl': '1536px',
}
```

### Common Patterns

**Hover Effects:**
```typescript
className="hover:scale-105 hover:shadow-2xl hover:shadow-netflix-red/50 transition-all duration-300"
```

**Focus States:**
```typescript
className="focus:outline-none focus:ring-2 focus:ring-netflix-red"
```

**Dark Mode:**
```typescript
className="bg-netflix-dark text-white"
```

