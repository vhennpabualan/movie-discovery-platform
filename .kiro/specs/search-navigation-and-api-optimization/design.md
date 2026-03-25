# Search Navigation and API Optimization Bugfix Design

## Overview

This bugfix addresses two critical issues in the search feature:

1. **Search Navigation Broken**: Double navigation attempts cause the View Transitions API to fail silently. The fix removes the redundant navigation call from SearchResultsList, allowing MovieCard to handle navigation exclusively.

2. **Excessive API Requests**: The search page lacks debouncing and caching. The fix implements a request cache with deduplication to prevent duplicate API calls and reduce TMDb API usage.

The fix approach is minimal and targeted: remove the double navigation in SearchResultsList, and add a simple cache layer to the searchMovies function.

## Glossary

- **Bug_Condition_Navigation (C1)**: User clicks on a movie in SearchResultsList - the double navigation attempt interrupts the View Transition
- **Bug_Condition_API (C2)**: User performs a search query - the API is called without debouncing or caching
- **Property_Navigation (P1)**: Navigation to /movies/[id] completes successfully with a smooth view transition
- **Property_API (P2)**: Search queries are debounced and cached, preventing duplicate API calls
- **Preservation**: SearchBar navigation, keyboard navigation, error handling, and other movie card navigation continue to work
- **SearchResultsList**: Component at src/features/search/components/SearchResultsList.tsx that displays search results
- **MovieCard**: Component at src/features/movies/components/MovieCard.tsx that handles movie click navigation
- **useViewTransition**: Hook at src/lib/hooks/useViewTransition.ts that enables smooth page transitions
- **searchMovies**: Function at src/lib/api/tmdb-client.ts that fetches search results from TMDb

## Bug Details

### Bug Condition 1: Navigation Double Call

The bug manifests when a user clicks on a movie in the search results list. The SearchResultsList component calls `navigateWithTransition` in its `handleMovieClick` callback, AND the MovieCard component also calls `navigateWithTransition` in its `handleClick` handler. This double navigation attempt causes the View Transitions API's `startViewTransition` to be called twice, interrupting the first transition and causing navigation to fail silently.

**Formal Specification:**
```
FUNCTION isBugCondition_Navigation(input)
  INPUT: input of type ClickEvent on MovieCard in SearchResultsList
  OUTPUT: boolean
  
  RETURN input.source = "SearchResultsList"
         AND MovieCard.handleClick calls navigateWithTransition
         AND SearchResultsList.handleMovieClick calls navigateWithTransition
         AND both are executed in sequence
END FUNCTION
```

### Bug Condition 2: Excessive API Requests

The bug manifests when a user performs a search query on the search page. The searchMovies function is called immediately without debouncing, and there is no caching mechanism. This causes:
- Multiple API calls for the same query if the user types quickly
- Duplicate requests if the same query is searched multiple times
- No deduplication of in-flight requests

**Formal Specification:**
```
FUNCTION isBugCondition_API(input)
  INPUT: input of type SearchQuery
  OUTPUT: boolean
  
  RETURN input.source = "SearchPage"
         AND (input.isDuplicate OR input.isInFlight OR input.isTyping)
         AND NO caching exists
         AND NO debouncing exists
END FUNCTION
```

### Examples

**Navigation Bug Example:**
1. User is on /search?q=inception
2. User clicks on "Inception" movie card in search results
3. SearchResultsList.handleMovieClick calls navigateWithTransition("/movies/550")
4. MovieCard.handleClick ALSO calls navigateWithTransition("/movies/550")
5. View Transitions API receives two startViewTransition calls
6. First transition is interrupted by second call
7. Navigation fails silently, user remains on search page

**API Bug Example 1 - Typing:**
1. User types "i" in search input → API call for "i"
2. User types "n" → API call for "in"
3. User types "c" → API call for "inc"
4. User types "e" → API call for "ince"
5. User types "p" → API call for "incep"
6. User types "t" → API call for "incept"
7. User types "i" → API call for "incepti"
8. User types "o" → API call for "inceptio"
9. User types "n" → API call for "inception"
Result: 9 API calls for a single search query

**API Bug Example 2 - Duplicate Query:**
1. User searches for "inception" → API call
2. User clears search and searches for "inception" again → API call
3. Same query made twice, no cache used

**API Bug Example 3 - In-Flight Requests:**
1. User searches for "inception" → API call starts (slow network)
2. User searches for "inception" again before first completes → Second API call starts
3. Both requests complete, both results processed
4. Wasted API quota and bandwidth

**Edge Case - Empty Query:**
1. User clears search input → Should not make API call
2. User types space character → Should not make API call

## Expected Behavior

### Preservation Requirements

**Unchanged Behaviors:**
- SearchBar dropdown navigation must continue to work (already has debouncing)
- Keyboard navigation in SearchBar (arrow keys, Enter) must work
- Movie cards in other parts of the app (trending, related movies) must navigate correctly
- Error handling and display must work as before
- Search page with query parameter must display results correctly
- View transitions for other navigation must continue to work

**Scope:**
All inputs that do NOT involve clicking on movies in SearchResultsList should be completely unaffected by this fix. This includes:
- SearchBar dropdown interactions
- Keyboard navigation
- Movie cards in trending/related sections
- Error scenarios
- Other navigation paths

## Hypothesized Root Cause

Based on the bug description, the most likely issues are:

1. **Double Navigation in SearchResultsList**: The SearchResultsList component calls `navigateWithTransition` in its callback, but MovieCard ALSO calls `navigateWithTransition` in its click handler. This creates two sequential calls to the View Transitions API, which interrupts the first transition.

2. **No Caching Layer**: The searchMovies function has no caching mechanism. Each call to searchMovies makes a fresh API request, even for identical queries.

3. **No Request Deduplication**: There is no mechanism to detect and prevent duplicate in-flight requests for the same query.

4. **No Debouncing on Search Page**: While SearchBar has debouncing, the search page itself (when navigated to with a query parameter) doesn't debounce subsequent searches.

## Correctness Properties

Property 1: Bug Condition - Search Navigation Success

_For any_ click event on a movie in the SearchResultsList component, the fixed code SHALL navigate to /movies/[id] with a smooth view transition that completes successfully without being interrupted.

**Validates: Requirements 2.1, 2.2**

Property 2: Preservation - Non-Search Navigation Behavior

_For any_ navigation that does NOT involve clicking on movies in SearchResultsList (SearchBar clicks, keyboard navigation, other movie cards, error scenarios), the fixed code SHALL produce exactly the same behavior as the original code, preserving all existing functionality.

**Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5, 3.6**

Property 3: Bug Condition - API Request Optimization

_For any_ search query on the search page, the fixed code SHALL debounce the API call by 300-500ms, cache results for identical queries, and deduplicate in-flight requests for the same query.

**Validates: Requirements 2.3, 2.4, 2.5**

Property 4: Preservation - API Error Handling

_For any_ API error scenario, the fixed code SHALL handle and display errors exactly as the original code does, preserving error handling behavior.

**Validates: Requirements 3.6**

## Fix Implementation

### Changes Required

Assuming our root cause analysis is correct:

**File 1**: `src/features/search/components/SearchResultsList.tsx`

**Change 1**: Remove the redundant navigation call
- Remove the `navigateWithTransition` import
- Remove the `handleMovieClick` function that calls `navigateWithTransition`
- Pass the movie ID directly to MovieCard's onClick without calling navigate
- Let MovieCard handle all navigation exclusively

**File 2**: `src/lib/api/tmdb-client.ts`

**Change 2**: Add request caching and deduplication
- Create a cache Map to store search results by query
- Create an in-flight requests Map to track pending requests
- Modify searchMovies function to:
  1. Check if result is in cache → return cached result
  2. Check if request is in-flight → wait for in-flight request to complete
  3. If neither, make new request and store in in-flight map
  4. Cache result when complete
  5. Clean up in-flight map entry

**File 3**: `src/features/search/components/SearchBar.tsx` (Optional - verify debouncing works)

**Change 3**: Verify debouncing is working correctly
- Confirm 300ms debounce delay is applied
- Confirm debounce timer is cleared on unmount

## Testing Strategy

### Validation Approach

The testing strategy follows a two-phase approach: first, surface counterexamples that demonstrate the bugs on unfixed code, then verify the fixes work correctly and preserve existing behavior.

### Exploratory Bug Condition Checking - Navigation

**Goal**: Surface counterexamples that demonstrate the navigation bug BEFORE implementing the fix. Confirm that double navigation attempts interrupt the View Transition.

**Test Plan**: Write tests that simulate clicking on a movie in SearchResultsList and assert that navigation completes successfully. Run these tests on the UNFIXED code to observe failures and understand the root cause.

**Test Cases**:
1. **SearchResultsList Click Test**: Simulate clicking on a movie in SearchResultsList and verify navigation to /movies/[id] completes (will fail on unfixed code due to double navigation)
2. **View Transition Completion Test**: Verify that startViewTransition is called exactly once (will fail on unfixed code - called twice)
3. **Navigation Timing Test**: Verify navigation completes within expected time (may timeout on unfixed code)

**Expected Counterexamples**:
- Navigation fails silently or times out
- startViewTransition is called twice
- User remains on search page after clicking movie

### Exploratory Bug Condition Checking - API

**Goal**: Surface counterexamples that demonstrate the API bug BEFORE implementing the fix. Confirm that duplicate requests are made.

**Test Plan**: Write tests that simulate typing a search query and assert that only one API call is made per unique query. Run these tests on the UNFIXED code to observe failures.

**Test Cases**:
1. **Duplicate Query Test**: Search for "inception" twice and verify only one API call is made (will fail on unfixed code - two calls made)
2. **In-Flight Request Test**: Search for "inception" twice rapidly and verify only one API call is made (will fail on unfixed code - two calls made)
3. **Cache Test**: Search for "inception", then search for "inception" again and verify cached result is used (will fail on unfixed code - new API call made)

**Expected Counterexamples**:
- Multiple API calls for same query
- No caching of results
- Duplicate in-flight requests

### Fix Checking

**Goal**: Verify that for all inputs where the bug condition holds, the fixed function produces the expected behavior.

**Pseudocode:**
```
FOR ALL input WHERE isBugCondition_Navigation(input) DO
  result := SearchResultsList_fixed(input)
  ASSERT result.navigatedTo = "/movies/[id]"
  ASSERT result.viewTransitionCompleted = true
  ASSERT result.startViewTransitionCallCount = 1
END FOR

FOR ALL input WHERE isBugCondition_API(input) DO
  result := searchMovies_fixed(input)
  ASSERT result.apiCallCount = 1 OR result.usedCache = true
  ASSERT result.inFlightDeduplication = true
END FOR
```

### Preservation Checking

**Goal**: Verify that for all inputs where the bug condition does NOT hold, the fixed function produces the same result as the original function.

**Pseudocode:**
```
FOR ALL input WHERE NOT isBugCondition_Navigation(input) DO
  ASSERT SearchResultsList_original(input) = SearchResultsList_fixed(input)
END FOR

FOR ALL input WHERE NOT isBugCondition_API(input) DO
  ASSERT searchMovies_original(input) = searchMovies_fixed(input)
END FOR
```

**Testing Approach**: Property-based testing is recommended for preservation checking because:
- It generates many test cases automatically across the input domain
- It catches edge cases that manual unit tests might miss
- It provides strong guarantees that behavior is unchanged for all non-buggy inputs

**Test Plan**: Observe behavior on UNFIXED code first for non-bug scenarios, then write property-based tests capturing that behavior.

**Test Cases**:
1. **SearchBar Navigation Preservation**: Verify clicking movies in SearchBar dropdown continues to work
2. **Keyboard Navigation Preservation**: Verify keyboard navigation in SearchBar continues to work
3. **Other Movie Card Navigation Preservation**: Verify movie cards in trending/related sections continue to work
4. **Error Handling Preservation**: Verify API errors are handled and displayed correctly
5. **Search Page Query Parameter Preservation**: Verify search page with query parameter displays results correctly

### Unit Tests

- Test SearchResultsList no longer calls navigateWithTransition
- Test MovieCard handles navigation exclusively
- Test searchMovies cache returns cached results
- Test searchMovies deduplicates in-flight requests
- Test searchMovies makes new request when cache is empty
- Test error scenarios continue to work

### Property-Based Tests

- Generate random movie IDs and verify SearchResultsList navigation works
- Generate random search queries and verify caching works
- Generate random duplicate queries and verify deduplication works
- Generate random non-buggy inputs and verify preservation

### Integration Tests

- Test full search flow: type query → see results → click movie → navigate to detail page
- Test search with query parameter: navigate to /search?q=inception → see results → click movie → navigate
- Test SearchBar: type query → see dropdown → click result → navigate
- Test keyboard navigation: type query → arrow keys → Enter → navigate
