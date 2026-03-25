# View Transition Abort Error Bugfix Design

## Overview

The MovieCard component applies the same hardcoded `viewTransitionName: 'poster-image'` to every movie card in a list. When multiple elements share the same view transition name, the browser's View Transitions API aborts the transition with an "AbortError: Transition was skipped" error. This prevents smooth view transitions when navigating between movie cards and breaks the user experience.

The fix makes each movie card's viewTransitionName unique by appending the movie ID (e.g., `poster-image-${movie.id}`). This allows the View Transitions API to properly track and animate each card independently. The fix is minimal and surgical—only the viewTransitionName property changes, preserving all existing functionality including styling, hover effects, navigation, and watchlist badges.

## Glossary

- **Bug_Condition (C)**: The condition that triggers the bug—when multiple movie cards are rendered in a list, each with the same `viewTransitionName: 'poster-image'`
- **Property (P)**: The desired behavior when the bug condition is fixed—each movie card has a unique viewTransitionName derived from its movie ID, allowing smooth transitions
- **Preservation**: Existing functionality that must remain unchanged—styling, hover effects, navigation, watchlist badges, and fallback behavior for browsers without View Transitions API support
- **viewTransitionName**: A CSS property that identifies elements participating in a view transition; must be unique per element to avoid conflicts
- **View Transitions API**: Browser API that enables smooth visual transitions between DOM states; aborts if multiple elements share the same transition name
- **MovieCard**: React component in `src/features/movies/components/MovieCard.tsx` that renders individual movie poster cards
- **MovieCarousel**: React component in `src/features/movies/components/MovieCarousel.tsx` that renders multiple MovieCard components in a scrollable list
- **RelatedMovies**: Server component in `src/features/movies/components/RelatedMovies.tsx` that fetches and displays related movies via MovieCarousel
- **TrendingMovies**: Server component in `src/features/movies/components/TrendingMovies.tsx` that fetches and displays trending movies via MovieCarousel

## Bug Details

### Bug Condition

The bug manifests when multiple movie cards are rendered in a list (via MovieCarousel, RelatedMovies, or TrendingMovies). Each card applies the same hardcoded `viewTransitionName: 'poster-image'` CSS property. When a user navigates from one movie card to another, the browser's View Transitions API detects duplicate transition names and aborts the transition with an "AbortError: Transition was skipped" error.

**Formal Specification:**
```
FUNCTION isBugCondition(input)
  INPUT: input of type {
    componentType: 'MovieCard',
    renderContext: 'list' | 'carousel',
    movieCount: number,
    viewTransitionName: string
  }
  OUTPUT: boolean
  
  RETURN input.componentType = 'MovieCard'
         AND input.renderContext IN ['list', 'carousel']
         AND input.movieCount > 1
         AND input.viewTransitionName = 'poster-image'
         AND NOT isUniquePerMovie(input.viewTransitionName)
END FUNCTION
```

### Examples

**Example 1: TrendingMovies Carousel**
- Scenario: User views the homepage with a carousel of 10 trending movies
- Current behavior: All 10 MovieCard components have `viewTransitionName: 'poster-image'`
- Bug manifestation: When user clicks on any movie card, console shows "AbortError: Transition was skipped"
- Expected behavior: Each card should have unique names like `poster-image-550`, `poster-image-551`, etc.

**Example 2: RelatedMovies Carousel**
- Scenario: User is on a movie details page viewing 8 related movies
- Current behavior: All 8 MovieCard components have `viewTransitionName: 'poster-image'`
- Bug manifestation: Clicking a related movie shows abort error instead of smooth transition
- Expected behavior: Each card should have unique names like `poster-image-123`, `poster-image-456`, etc.

**Example 3: Search Results**
- Scenario: User searches for "action" and gets 20 results displayed in a grid
- Current behavior: All 20 MovieCard components have `viewTransitionName: 'poster-image'`
- Bug manifestation: Navigating to any movie shows abort error
- Expected behavior: Each card should have unique names based on its movie ID

**Edge Case: Single Movie Card**
- Scenario: User views a single movie card on a details page
- Current behavior: Single card has `viewTransitionName: 'poster-image'`
- Expected behavior: Should work fine (no duplicates), but will be updated to `poster-image-${movieId}` for consistency

## Expected Behavior

### Preservation Requirements

**Unchanged Behaviors:**
- Mouse clicks on movie cards must continue to navigate to the movie details page
- Hover effects (scale, shadow, brightness) must remain unchanged
- Watchlist badges must display correctly on cards in the watchlist
- Button display with title and rating overlay must remain unchanged
- Keyboard navigation (Enter key) must continue to work
- Accessibility features (ARIA labels, focus rings) must remain unchanged
- Fallback behavior for browsers without View Transitions API support must continue to work

**Scope:**
All inputs that do NOT involve rendering multiple movie cards with the same viewTransitionName should be completely unaffected by this fix. This includes:
- Single movie card displays
- Mouse click navigation
- Keyboard navigation
- Hover state interactions
- Watchlist badge display
- Browser fallback behavior

## Hypothesized Root Cause

Based on the bug description, the root cause is:

1. **Hardcoded viewTransitionName**: The MovieCard component uses a hardcoded string `'poster-image'` for the viewTransitionName CSS property instead of deriving it from the movie's unique identifier (ID)

2. **Duplicate Transition Names**: When multiple MovieCard components are rendered in a list (MovieCarousel, RelatedMovies, TrendingMovies), they all have the same viewTransitionName value, violating the View Transitions API requirement that transition names be unique per element

3. **API Abort Behavior**: The browser's View Transitions API detects this violation and aborts the transition, logging "AbortError: Transition was skipped" to the console

4. **No Fallback Handling**: While the useViewTransition hook has a fallback for browsers without View Transitions API support, it doesn't handle the abort error case for browsers that do support it

## Correctness Properties

Property 1: Bug Condition - Unique View Transition Names

_For any_ movie card rendered in a list context where multiple cards are present, the fixed MovieCard component SHALL assign a unique `viewTransitionName` derived from the movie ID (format: `poster-image-${movie.id}`), enabling the View Transitions API to execute smooth transitions without aborting.

**Validates: Requirements 2.1, 2.2, 2.3**

Property 2: Preservation - Existing Functionality

_For any_ input that does NOT involve rendering multiple movie cards with duplicate transition names (single card displays, mouse clicks, keyboard navigation, hover effects, watchlist badges), the fixed code SHALL produce exactly the same behavior as the original code, preserving all existing functionality for styling, navigation, accessibility, and browser fallback support.

**Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5**

## Fix Implementation

### Changes Required

Assuming our root cause analysis is correct:

**File**: `src/features/movies/components/MovieCard.tsx`

**Component**: `MovieCard`

**Specific Changes**:

1. **Update viewTransitionName Property**: Replace the hardcoded `'poster-image'` with a dynamic value that includes the movie ID
   - Current: `style={{ viewTransitionName: 'poster-image' } as any}`
   - Fixed: `style={{ viewTransitionName: `poster-image-${movie.id}` } as any}`
   - This ensures each card has a unique transition name based on its movie ID

2. **Verify No Other Changes Needed**: The MovieCard component only applies viewTransitionName to the root div element, so this single change fixes the issue

3. **No Changes to MovieCarousel**: MovieCarousel simply renders MovieCard components and doesn't apply viewTransitionName itself, so no changes needed

4. **No Changes to RelatedMovies**: RelatedMovies is a server component that fetches data and passes it to MovieCarousel, so no changes needed

5. **No Changes to TrendingMovies**: TrendingMovies is a server component that fetches data and passes it to MovieCarousel, so no changes needed

6. **Verify useViewTransition Hook**: The hook already has proper fallback for browsers without View Transitions API support, so no changes needed

## Testing Strategy

### Validation Approach

The testing strategy follows a two-phase approach: first, surface counterexamples that demonstrate the bug on unfixed code, then verify the fix works correctly and preserves existing behavior.

### Exploratory Bug Condition Checking

**Goal**: Surface counterexamples that demonstrate the bug BEFORE implementing the fix. Confirm that duplicate viewTransitionNames cause abort errors. If we refute, we will need to re-hypothesize.

**Test Plan**: Write tests that render multiple MovieCard components with the same movie data (or different movies) and simulate navigation clicks. Run these tests on the UNFIXED code to observe abort errors in the console and understand the root cause.

**Test Cases**:
1. **Multiple Cards Same Transition Name**: Render 5 MovieCard components and verify they all have `viewTransitionName: 'poster-image'` (will show duplicate names on unfixed code)
2. **Navigation Triggers Abort**: Click on a movie card in a list and verify the console shows "AbortError: Transition was skipped" (will fail on unfixed code)
3. **Carousel Context**: Render MovieCarousel with 10 movies and verify all cards have the same transition name (will show duplicates on unfixed code)
4. **Related Movies Context**: Render RelatedMovies component and verify all related movie cards have the same transition name (will show duplicates on unfixed code)

**Expected Counterexamples**:
- Multiple MovieCard elements have identical `viewTransitionName: 'poster-image'` values
- Browser console shows "AbortError: Transition was skipped" when navigating from a movie card in a list
- Possible causes: hardcoded transition name, no movie ID included in the name

### Fix Checking

**Goal**: Verify that for all inputs where the bug condition holds (multiple movie cards in a list), the fixed function produces the expected behavior (unique transition names, no abort errors).

**Pseudocode:**
```
FOR ALL movieList WHERE movieList.length > 1 DO
  FOR ALL movie IN movieList DO
    card := renderMovieCard(movie)
    ASSERT card.viewTransitionName = `poster-image-${movie.id}`
    ASSERT card.viewTransitionName IS UNIQUE in movieList
  END FOR
  
  result := navigateFromCard(movieList[0])
  ASSERT result.noAbortError = true
  ASSERT result.transitionExecuted = true
END FOR
```

### Preservation Checking

**Goal**: Verify that for all inputs where the bug condition does NOT hold (single cards, non-navigation interactions), the fixed function produces the same result as the original function.

**Pseudocode:**
```
FOR ALL input WHERE NOT isBugCondition(input) DO
  ASSERT originalMovieCard(input) = fixedMovieCard(input)
END FOR
```

**Testing Approach**: Property-based testing is recommended for preservation checking because:
- It generates many test cases automatically across different movie data
- It catches edge cases that manual unit tests might miss
- It provides strong guarantees that styling, navigation, and accessibility are unchanged

**Test Plan**: Observe behavior on UNFIXED code first for mouse clicks, keyboard navigation, hover effects, and watchlist badges, then write property-based tests capturing that behavior.

**Test Cases**:
1. **Mouse Click Navigation**: Verify clicking a movie card navigates to the correct URL with the same behavior as before
2. **Keyboard Navigation**: Verify pressing Enter on a focused card navigates correctly
3. **Hover Effects**: Verify hover state shows overlay with title and rating
4. **Watchlist Badge**: Verify watchlist badge displays correctly when isInWatchlist is true
5. **Styling Preservation**: Verify all CSS classes and styles remain unchanged
6. **Accessibility**: Verify ARIA labels and focus rings work correctly
7. **Browser Fallback**: Verify navigation works in browsers without View Transitions API support

### Unit Tests

- Test that MovieCard renders with unique viewTransitionName based on movie ID
- Test that viewTransitionName format is correct: `poster-image-${movieId}`
- Test that MovieCard still renders with all styling classes intact
- Test that hover state still shows overlay with title and rating
- Test that watchlist badge displays when isInWatchlist is true
- Test that keyboard navigation (Enter key) still works
- Test that ARIA labels are still present and correct

### Property-Based Tests

- Generate random movie objects and verify each produces a unique viewTransitionName
- Generate random lists of movies and verify all transition names are unique within the list
- Generate random movie IDs and verify viewTransitionName format is always `poster-image-${id}`
- Generate random combinations of isInWatchlist and priority flags and verify styling is preserved
- Test that navigation behavior is identical before and after fix for non-buggy inputs

### Integration Tests

- Test full flow: render MovieCarousel with 10 movies, click on each card, verify no abort errors
- Test RelatedMovies component: fetch related movies, render carousel, click cards, verify smooth transitions
- Test TrendingMovies component: fetch trending movies, render carousel, click cards, verify smooth transitions
- Test search results: search for movies, render results, click cards, verify transitions work
- Test that switching between different carousels (trending, related, search) maintains smooth transitions
- Test that visual feedback (hover, click) occurs correctly when transitions execute
