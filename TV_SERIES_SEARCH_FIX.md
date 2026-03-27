# TV Series Search - Validation Error Fix

## Problem
When searching for TV shows, the API returned validation errors because TV show data from TMDB uses different field names than movies:

**TV Show Fields:**
- `name` (instead of `title`)
- `first_air_date` (instead of `release_date`)

**Error:**
```
ValidationError: Invalid API response format: [
  {"expected": "string", "code": "invalid_type", "path": ["results", 0, "title"], ...},
  {"expected": "string", "code": "invalid_type", "path": ["results", 0, "release_date"], ...}
]
```

## Solution
Normalize TV show data in the `searchTVShows()` function before validation.

### Changes Made

#### 1. Updated `searchTVShows()` in `src/lib/api/tmdb-client.ts`

**Before:**
```typescript
const data = await makeRequest<APIResponse>(endpoint, {...});
const validatedData = apiResponseSchema.parse(data) as APIResponse;
```

**After:**
```typescript
const data = await makeRequest<any>(endpoint, {...});

// Normalize TV show data to match Movie schema
const normalizedData = {
  ...data,
  results: (data.results || []).map((show: any) => ({
    id: show.id,
    title: show.name,                    // Map name → title
    poster_path: show.poster_path,
    release_date: show.first_air_date,   // Map first_air_date → release_date
    vote_average: show.vote_average,
    overview: show.overview,
    // Keep original fields for reference
    name: show.name,
    first_air_date: show.first_air_date,
  })),
};

const validatedData = apiResponseSchema.parse(normalizedData) as APIResponse;
```

**Benefits:**
- TV show results now pass validation
- Original fields preserved for reference
- Consistent data structure across movies and TV shows
- No need for manual normalization in components

#### 2. Simplified Search Page (`src/app/search/page.tsx`)

**Before:**
```typescript
...(tvResults.results || []).map((item: any) => ({
  ...item,
  media_type: 'tv',
  title: item.name, // Manual normalization
})),
```

**After:**
```typescript
...(tvResults.results || []).map((item: any) => ({
  ...item,
  media_type: 'tv',
  // No manual normalization needed
})),
```

#### 3. Simplified Search Bar (`src/features/search/components/SearchBar.tsx`)

**Before:**
```typescript
...(tvResponse.results || []).map((item: any) => ({
  ...item,
  media_type: 'tv',
  title: item.name, // Manual normalization
})),
```

**After:**
```typescript
...(tvResponse.results || []).map((item: any) => ({
  ...item,
  media_type: 'tv',
  // No manual normalization needed
})),
```

Also simplified display logic:
```typescript
// Before
{item.title || item.name}
{item.media_type === 'tv'
  ? item.first_air_date?.split('-')[0]
  : item.release_date?.split('-')[0]}

// After
{item.title}
{item.release_date?.split('-')[0]}
```

#### 4. Simplified Search Results List (`src/features/search/components/SearchResultsList.tsx`)

**Before:**
```typescript
movie={{
  ...item,
  title: item.title || item.name || 'Unknown',
}}
```

**After:**
```typescript
movie={item}
```

## Data Flow

### Before Fix
```
TMDB API (TV)
    ↓
searchTVShows() → Validation Error ❌
    ↓
Search Page (manual normalization)
    ↓
SearchBar (manual normalization)
    ↓
Components (conditional field access)
```

### After Fix
```
TMDB API (TV)
    ↓
searchTVShows() → Normalize → Validate ✓
    ↓
Search Page (no normalization needed)
    ↓
SearchBar (no normalization needed)
    ↓
Components (consistent field access)
```

## Normalized Data Structure

All search results now have consistent structure:

```typescript
{
  id: number;
  title: string;              // Normalized from 'name' for TV
  poster_path: string | null;
  release_date: string;       // Normalized from 'first_air_date' for TV
  vote_average: number;
  overview: string;
  media_type: 'movie' | 'tv'; // Added by search page/bar
  
  // Original fields preserved for reference
  name?: string;              // Original TV show name
  first_air_date?: string;    // Original TV show air date
}
```

## Testing

### Search Bar
✓ Search for TV shows (e.g., "Game of Thrones")
✓ Results display with TV badge
✓ Click result navigates to `/tv/{id}`
✓ No validation errors in console

### Search Results Page
✓ Search for TV shows
✓ Results display in grid
✓ Click result navigates to `/tv/{id}`
✓ No validation errors in console

### TV Show Detail Page
✓ Page loads correctly
✓ Season/episode selector displays
✓ Streaming player works
✓ All TV show information displays

## Benefits

1. **Single Source of Truth** - Normalization happens in API layer
2. **Cleaner Components** - No conditional field access needed
3. **Better Maintainability** - Changes to normalization only in one place
4. **Consistent Data** - All results have same structure
5. **Preserved Original Data** - Original fields kept for reference
6. **No Breaking Changes** - Existing movie search still works

## Future Improvements

1. Create separate `TVShow` type extending `Movie`
2. Add `media_type` to API response schema
3. Create `TVCard` component for TV-specific display
4. Add TV show genres browsing
5. Add trending TV shows to home page

## Troubleshooting

### Still Getting Validation Errors?
- Clear browser cache
- Restart dev server
- Check TMDB API response format hasn't changed

### TV Shows Not Showing in Results?
- Verify `searchTVShows()` is being called
- Check network tab for API errors
- Verify TMDB API key has TV search permissions

### Wrong Navigation?
- Verify `media_type` is set to 'tv'
- Check `/tv/[id]` route exists
- Verify TV show detail page loads correctly
