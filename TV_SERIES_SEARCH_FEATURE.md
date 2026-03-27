# TV Series Search Feature - Implementation Guide

## Overview
The application now supports searching for both movies and TV shows. When users search, they get combined results from both TMDB movie and TV show databases.

## What Changed

### 1. Search Page (`src/app/search/page.tsx`)
**Before:** Only searched movies using `searchMovies()`
**After:** Searches both movies and TV shows in parallel using `Promise.all()`

```typescript
const [movieResults, tvResults] = await Promise.all([
  searchMovies(query, page),
  searchTVShows(query, page),
]);
```

**Features:**
- Combines results from both APIs
- Normalizes TV show data (maps `name` to `title`)
- Adds `media_type` field to distinguish between movies and TV shows
- Shows total result count instead of pagination

### 2. Search Results List (`src/features/search/components/SearchResultsList.tsx`)
**Before:** Only displayed movies
**After:** Displays both movies and TV shows

**Changes:**
- Accepts `SearchResult` type that includes `media_type` field
- Uses unique keys combining media type and ID: `${media_type}-${id}`
- Normalizes TV show names to title field for MovieCard compatibility

### 3. Search Bar (`src/features/search/components/SearchBar.tsx`)
**Before:** Only searched movies in dropdown
**After:** Searches both movies and TV shows with visual indicators

**New Features:**
- Searches both APIs in parallel
- Shows media type badge (Movie/TV) for each result
- Displays first air date for TV shows, release date for movies
- Updated placeholder text: "Search movies and TV shows..."
- Handles navigation to both `/movies/{id}` and `/tv/{id}` routes

**Dropdown Result Display:**
```
[Poster] Title                    [TV]
         2024
```

### 4. Movie Card (`src/features/movies/components/MovieCard.tsx`)
**Before:** Always navigated to `/movies/{id}`
**After:** Navigates based on media type

**Changes:**
- Added `media_type` prop to component interface
- Routes to `/tv/{id}` for TV shows
- Routes to `/movies/{id}` for movies
- Maintains all existing functionality (hover effects, loading states, etc.)

## How It Works

### Search Flow
1. User types in search bar
2. Query is debounced (300ms)
3. Both `searchMovies()` and `searchTVShows()` are called in parallel
4. Results are combined and normalized
5. Dropdown shows all results with media type badges
6. User clicks result → navigates to appropriate detail page

### Search Results Page Flow
1. User submits search query
2. Page fetches both movie and TV show results
3. Results are combined and displayed in grid
4. Clicking any result navigates to detail page

### Navigation
- **Movies:** `/movies/{tmdbId}`
- **TV Shows:** `/tv/{tmdbId}`

## Data Normalization

### Movie Result
```typescript
{
  id: 550,
  title: "Fight Club",
  poster_path: "/...",
  release_date: "1999-10-15",
  vote_average: 8.8,
  media_type: "movie"
}
```

### TV Show Result (Normalized)
```typescript
{
  id: 1399,
  title: "Game of Thrones",  // Mapped from 'name'
  name: "Game of Thrones",   // Original field
  poster_path: "/...",
  first_air_date: "2011-04-17",
  vote_average: 9.2,
  media_type: "tv"
}
```

## User Experience

### Search Bar Dropdown
- Shows up to 20 combined results
- Each result displays:
  - Poster image
  - Title
  - Media type badge (Movie/TV)
  - Release/Air date
- Keyboard navigation works for all results
- Click or press Enter to navigate

### Search Results Page
- Grid layout with 2-5 columns (responsive)
- Shows total number of results
- Each card is clickable
- Smooth navigation with loading states

### TV Show Detail Page
- Displays season/episode selector
- Allows streaming with VidSrc player
- Shows all TV show information

## Technical Details

### API Calls
- `searchMovies(query, page)` - Returns movies
- `searchTVShows(query, page)` - Returns TV shows
- Both use TMDB API with caching

### Type Definitions
```typescript
interface SearchResult extends Movie {
  media_type?: 'movie' | 'tv';
  name?: string;
  first_air_date?: string;
  release_date?: string;
}
```

### Performance
- Parallel API calls reduce latency
- Results are cached by TMDB client
- Debounced search input (300ms)
- Lazy loading of images

## Testing

### Search Bar Tests
- Searches both movies and TV shows
- Displays correct media type badges
- Navigates to correct routes
- Handles keyboard navigation

### Search Results Page Tests
- Combines results from both APIs
- Displays all results in grid
- Handles empty results
- Handles errors gracefully

## Future Enhancements

1. **Separate Tabs** - Show Movies and TV Shows in separate tabs
2. **Advanced Filters** - Filter by genre, year, rating
3. **Browse TV Shows** - Add TV show browsing by genre
4. **Trending TV Shows** - Display trending TV shows on home page
5. **TV Show Recommendations** - Show related TV shows on detail page

## Troubleshooting

### No TV Shows in Results
- Verify `searchTVShows()` is being called
- Check TMDB API key has TV search permissions
- Check network tab for API errors

### Wrong Navigation
- Verify `media_type` field is set correctly
- Check route paths are correct (`/tv/` vs `/movies/`)
- Verify TV show detail page exists at `/tv/[id]`

### Missing Data
- TV shows use `name` instead of `title`
- TV shows use `first_air_date` instead of `release_date`
- Ensure normalization is happening in SearchResultsList
