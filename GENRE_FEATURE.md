# Genre Browsing Feature

## Overview
Added comprehensive genre browsing functionality to the movie discovery platform, allowing users to filter and browse movies by genre.

## New Features

### 1. Genre API Functions
Added to `src/lib/api/tmdb-client.ts`:
- `getGenres()` - Fetches all available movie genres from TMDb
- `getMoviesByGenre(genreId, page)` - Fetches movies filtered by genre with pagination

### 2. Genre Components

#### GenreFilter (`src/features/movies/components/GenreFilter.tsx`)
- Displays genre buttons in a responsive grid
- Supports both callback and client-side navigation modes
- Mobile-friendly with collapsible genre list
- Highlights selected genre

#### GenreMovies (`src/features/movies/components/GenreMovies.tsx`)
- Server component that fetches and displays movies for a specific genre
- Uses MovieCarousel for consistent display
- Includes error handling

#### GenreBrowser (`src/features/movies/components/GenreBrowser.tsx`)
- Client component that combines GenreFilter and GenreMovies
- Manages genre selection state
- Dynamic loading with suspense

### 3. Browse Page (`src/app/browse/page.tsx`)
- Dedicated page for browsing movies by genre
- URL-based genre selection (`/browse?genre=28`)
- Pagination support
- Grid layout for movie results (1 col mobile, 2 col tablet, 4 col desktop)

### 4. Navigation Updates
- Added "Browse" link to desktop navigation in layout
- Added "Browse" link to mobile navigation menu
- Added "Browse by Genre" button on home page

### 5. Home Page Enhancement
- Added genre browser section to home page
- Users can explore genres directly from the homepage

## Usage

### Browse Page
Navigate to `/browse` to see all genres. Click a genre to filter movies:
- `/browse?genre=28` - Action movies
- `/browse?genre=35` - Comedy movies
- etc.

### Home Page
Scroll down to the "Browse by Genre" section to explore genres inline.

## Technical Details

- All genre data is cached with 24-hour revalidation
- Genre movie results are cached with 1-hour revalidation
- Responsive design with mobile-first approach
- Accessible with proper ARIA labels
- Error boundaries for graceful error handling
- Loading skeletons for better UX

## Search Functionality
The search feature should work correctly - clicking on movie cards navigates to the movie detail page using the `useViewTransition` hook for smooth transitions.
