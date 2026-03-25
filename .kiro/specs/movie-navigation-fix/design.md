# Movie Navigation Fix - Design Document

## Overview

The movie navigation bug prevents users from accessing movie details by clicking on movie cards in the UI. While the movie details page exists at `/movies/[id]` and displays correctly when accessed directly, there's no functional navigation from the trending movies carousel or search results. This fix adds client-side navigation to MovieCard components using Next.js router, integrating with the existing useViewTransition hook for smooth page transitions. The solution maintains all existing visual states, hover effects, and keyboard navigation while enabling seamless navigation to movie details.

## Glossary

- **Bug_Condition (C)**: User clicks on a movie card in trending carousel or search results, but no navigation occurs
- **Property (P)**: When a movie card is clicked or Enter key is pressed, the application navigates to `/movies/[movieId]` with a smooth view transition
- **Preservation**: All existing visual states (hover effects, watchlist badges), keyboard navigation (Enter key), and component hierarchy remain unchanged
- **MovieCard**: Client component in `src/features/movies/components/MovieCard.tsx` that displays individual movie posters with interactive states
- **MovieCarousel**: Client component in `src/features/movies/components/MovieCarousel.tsx` that renders a scrollable list of MovieCard components
- **SearchResultsList**: Client component in `src/features/search/components/SearchResultsList.tsx` that renders search results as a grid of MovieCard components
- **useViewTransition**: Custom hook in `src/lib/hooks/useViewTransition.ts` that wraps router.push with View Transitions API for smooth animations
- **onClick Handler**: Function passed to MovieCard that receives movieId and triggers navigation

## Bug Details

### Bug Condition

The bug manifests when a user interacts with a movie card (click or Enter key) in either the trending movies carousel or search results. The MovieCard component has an onClick handler defined but it's not being utilized to navigate to the movie details page. The component receives an onClick prop but the parent components (MovieCarousel and SearchResultsList) are not providing a navigation handler.

**Formal Specification:**
```
FUNCTION isBugCondition(input)
  INPUT: input of type UserInteraction (click or keypress)
  OUTPUT: boolean
  
  RETURN (input.type IN ['click', 'keydown:Enter'])
         AND (input.target IN ['MovieCard in trending carousel', 'MovieCard in search results'])
         AND (navigationToMovieDetails NOT triggered)
END FUNCTION
```

### Examples

**Example 1: Trending Movies Carousel Click**
- User views home page with trending movies carousel
- User clicks on a movie card (e.g., "Inception")
- **Current behavior**: Nothing happens, page remains on home page
- **Expected behavior**: Page navigates to `/movies/550` with smooth view transition

**Example 2: Search Results Click**
- User searches for "Matrix" and views search results
- User clicks on a movie card in the results grid
- **Current behavior**: Nothing happens, page remains on search results
- **Expected behavior**: Page navigates to `/movies/603` with smooth view transition

**Example 3: Keyboard Navigation (Enter Key)**
- User tabs to focus a movie card in trending carousel
- User presses Enter key
- **Current behavior**: Nothing happens, card remains focused
- **Expected behavior**: Page navigates to `/movies/[movieId]` with smooth view transition

**Example 4: Watchlist Badge Preservation**
- Movie card displays watchlist badge (✓) in top-right corner
- User clicks on card
- **Expected behavior**: Navigation occurs AND watchlist badge remains visible during transition

## Expected Behavior

### Preservation Requirements

**Unchanged Behaviors:**
- Movie cards continue to display poster images with correct TMDb URLs
- Hover state displays movie title and rating overlay with gradient background
- Watchlist badges (✓) display correctly in top-right corner when isInWatchlist is true
- Focus ring (Netflix red) displays when card is keyboard-focused
- Scale and shadow hover effects continue to work
- Carousel scroll buttons (left/right) continue to function
- Search results grid layout remains unchanged
- All accessibility attributes (role, tabindex, aria-label) remain intact
- View transition animation applies smoothly to navigation

**Scope:**
All inputs that do NOT involve clicking or pressing Enter on a movie card should be completely unaffected by this fix. This includes:
- Carousel scroll button clicks
- Search bar interactions
- Pagination controls
- Watchlist button interactions
- Other page navigation

## Hypothesized Root Cause

Based on the bug description and code analysis, the root causes are:

1. **Missing Navigation Handler in MovieCarousel**: The MovieCarousel component passes an empty default onClick handler (`onMovieClick = () => {}`) instead of providing actual navigation logic. The component receives an optional `onMovieClick` prop but parent components don't provide it.

2. **Missing Navigation Handler in SearchResultsList**: While SearchResultsList already has a router.push implementation, it's calling `handleMovieClick` which passes the movieId to the onClick handler. However, the MovieCard component's onClick handler is not being utilized for navigation.

3. **Unused useViewTransition Hook**: The MovieCard component imports and destructures `navigateWithTransition` from useViewTransition but never uses it. The onClick handler should use this hook for smooth transitions.

4. **No Navigation Integration**: The MovieCard component receives an onClick callback but doesn't integrate it with the useViewTransition hook to provide smooth page transitions with the View Transitions API.

## Correctness Properties

Property 1: Bug Condition - Movie Card Navigation

_For any_ user interaction where a movie card is clicked or Enter key is pressed in the trending carousel or search results, the fixed MovieCard component SHALL trigger navigation to `/movies/[movieId]` using the useViewTransition hook, resulting in a smooth page transition to the movie details page.

**Validates: Requirements 2.1, 2.2, 2.3**

Property 2: Preservation - Non-Navigation Interactions

_For any_ user interaction that is NOT a click or Enter key press on a movie card (carousel scrolling, search interactions, watchlist operations, other keyboard inputs), the fixed code SHALL produce exactly the same behavior as the original code, preserving all existing functionality and visual states.

**Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5**

## Fix Implementation

### Changes Required

Assuming our root cause analysis is correct:

**File 1**: `src/features/movies/components/MovieCard.tsx`

**Function**: `MovieCard` component

**Specific Changes**:
1. **Integrate useViewTransition with onClick**: Modify the onClick handler to use `navigateWithTransition` instead of just calling the onClick prop directly. The onClick prop should be called with the movieId, and that handler should trigger navigation.

2. **Update onClick Handler Logic**: The current onClick handler calls `onClick(movie.id)` directly. This should remain the same - the parent component (SearchResultsList or MovieCarousel) will be responsible for providing a navigation handler.

3. **Ensure Keyboard Navigation Uses Same Path**: The handleKeyDown function already calls `onClick(movie.id)` for Enter key, which is correct and will work once parent components provide navigation handlers.

**File 2**: `src/features/movies/components/MovieCarousel.tsx`

**Function**: `MovieCarousel` component

**Specific Changes**:
1. **Provide Default Navigation Handler**: Instead of defaulting `onMovieClick` to an empty function, provide a default handler that uses router.push to navigate to `/movies/[movieId]`.

2. **Import useRouter**: Add `'use client'` directive (already present) and import `useRouter` from 'next/navigation'.

3. **Create Navigation Handler**: Create a handler that calls `router.push(`/movies/${movieId}`)` for each movie click.

**File 3**: `src/features/search/components/SearchResultsList.tsx`

**Function**: `SearchResultsList` component

**Specific Changes**:
1. **Verify Navigation Implementation**: The current implementation already has the correct pattern - it imports useRouter and calls `router.push` in the handleMovieClick function. Verify this is working correctly by ensuring the onClick handler is properly passed to MovieCard.

2. **Integrate useViewTransition**: Update to use the useViewTransition hook's `navigateWithTransition` function instead of direct router.push for consistency with smooth transitions.

## Testing Strategy

### Validation Approach

The testing strategy follows a two-phase approach: first, surface counterexamples that demonstrate the bug on unfixed code, then verify the fix works correctly and preserves existing behavior.

### Exploratory Bug Condition Checking

**Goal**: Surface counterexamples that demonstrate the bug BEFORE implementing the fix. Confirm or refute the root cause analysis. If we refute, we will need to re-hypothesize.

**Test Plan**: Write tests that simulate click and keyboard events on MovieCard components in both carousel and search results contexts. Run these tests on the UNFIXED code to observe failures and understand the root cause.

**Test Cases**:
1. **Trending Carousel Click Test**: Simulate clicking a MovieCard in MovieCarousel context (will fail on unfixed code - no navigation occurs)
2. **Search Results Click Test**: Simulate clicking a MovieCard in SearchResultsList context (may pass if SearchResultsList already has navigation, but MovieCarousel won't)
3. **Keyboard Enter Test**: Simulate pressing Enter on focused MovieCard (will fail on unfixed code - no navigation occurs)
4. **Carousel Scroll Preservation Test**: Verify carousel scroll buttons still work after fix (should pass on both fixed and unfixed code)

**Expected Counterexamples**:
- MovieCard onClick handlers are not invoked with navigation logic
- Possible causes: MovieCarousel provides empty onClick handler, MovieCard doesn't use useViewTransition, SearchResultsList may not be properly integrated

### Fix Checking

**Goal**: Verify that for all inputs where the bug condition holds, the fixed function produces the expected behavior.

**Pseudocode:**
```
FOR ALL input WHERE isBugCondition(input) DO
  result := MovieCard_fixed(input)
  ASSERT navigationToMovieDetails(result)
  ASSERT viewTransitionApplied(result)
END FOR
```

### Preservation Checking

**Goal**: Verify that for all inputs where the bug condition does NOT hold, the fixed function produces the same result as the original function.

**Pseudocode:**
```
FOR ALL input WHERE NOT isBugCondition(input) DO
  ASSERT MovieCard_original(input) = MovieCard_fixed(input)
END FOR
```

**Testing Approach**: Property-based testing is recommended for preservation checking because:
- It generates many test cases automatically across the input domain
- It catches edge cases that manual unit tests might miss
- It provides strong guarantees that behavior is unchanged for all non-buggy inputs

**Test Plan**: Observe behavior on UNFIXED code first for carousel scrolling and other interactions, then write property-based tests capturing that behavior.

**Test Cases**:
1. **Hover State Preservation**: Verify hover overlay with title and rating displays correctly after fix
2. **Watchlist Badge Preservation**: Verify watchlist badge (✓) displays correctly after fix
3. **Carousel Scroll Preservation**: Verify left/right scroll buttons continue to work after fix
4. **Keyboard Focus Preservation**: Verify focus ring displays correctly after fix
5. **Image Display Preservation**: Verify poster images display correctly after fix

### Unit Tests

- Test MovieCard onClick handler is called with correct movieId when clicked
- Test MovieCard keyboard Enter handler is called with correct movieId
- Test MovieCarousel provides navigation handler to MovieCard
- Test SearchResultsList provides navigation handler to MovieCard
- Test navigation uses useViewTransition for smooth transitions
- Test that other keyboard inputs (Space, Arrow keys) don't trigger navigation
- Test watchlist badge displays correctly alongside navigation functionality

### Property-Based Tests

- Generate random movie data and verify MovieCard renders correctly with navigation
- Generate random click/keyboard events and verify only click and Enter trigger navigation
- Generate random carousel states and verify scroll buttons work independently of navigation
- Test that navigation doesn't interfere with hover state display
- Test that navigation doesn't interfere with watchlist badge display

### Integration Tests

- Test full flow: user clicks movie in trending carousel → navigates to movie details page
- Test full flow: user searches for movie → clicks result → navigates to movie details page
- Test full flow: user tabs to movie card → presses Enter → navigates to movie details page
- Test that view transition animation plays during navigation
- Test that movie details page loads correctly after navigation from both carousel and search
- Test that back button returns to previous page with correct scroll position
