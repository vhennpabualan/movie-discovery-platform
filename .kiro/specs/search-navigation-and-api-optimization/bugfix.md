# Search Navigation and API Optimization Bugfix

## Introduction

The movie discovery platform has two critical issues affecting the search feature:

1. **Search Navigation Broken**: Clicking on searched movies doesn't navigate to the detail page. The SearchResultsList component uses the useViewTransition hook to navigate, but navigation fails silently due to double navigation attempts.

2. **Excessive API Requests**: The search feature makes too many API calls to TMDb, causing performance degradation and potential rate limiting. The main search page lacks debouncing and caching mechanisms.

These bugs significantly impact user experience by preventing users from viewing movie details and causing unnecessary API load.

## Bug Analysis

### Current Behavior (Defect)

1.1 WHEN a user clicks on a movie in the search results list THEN the navigation to the movie detail page fails silently and the user remains on the search page

1.2 WHEN a user clicks on a movie in the search results list THEN the useViewTransition hook's startViewTransition is called twice, causing the transition to be interrupted or cancelled

1.3 WHEN a user performs a search query on the search page THEN the searchMovies API is called immediately without debouncing, causing multiple requests for the same query

1.4 WHEN a user performs the same search query multiple times THEN the API is called each time without caching, resulting in duplicate requests to TMDb

1.5 WHEN multiple search requests are in flight for the same query THEN both requests complete and both results are processed, causing unnecessary API usage

### Expected Behavior (Correct)

2.1 WHEN a user clicks on a movie in the search results list THEN the user is navigated to the movie detail page at /movies/[id] with a smooth view transition

2.2 WHEN a user clicks on a movie in the search results list THEN the useViewTransition hook's startViewTransition is called exactly once, allowing the transition to complete successfully

2.3 WHEN a user performs a search query on the search page THEN the searchMovies API call is debounced with a 300-500ms delay to prevent excessive requests during typing

2.4 WHEN a user performs the same search query multiple times THEN the cached results are returned without making a new API call to TMDb

2.5 WHEN multiple search requests are in flight for the same query THEN only the first request is made and subsequent identical requests wait for the first to complete, then use the cached result

### Unchanged Behavior (Regression Prevention)

3.1 WHEN a user clicks on a movie in the SearchBar dropdown THEN the user is navigated to the movie detail page and the search bar is cleared

3.2 WHEN a user uses keyboard navigation (arrow keys, Enter) in the SearchBar dropdown THEN the selected movie is navigated to correctly

3.3 WHEN a user performs a search with the SearchBar THEN the debouncing (300ms) continues to work as currently implemented

3.4 WHEN a user navigates to the search page with a query parameter THEN the search results are displayed correctly

3.5 WHEN a user clicks on a movie card in other parts of the application (trending, related movies) THEN the navigation continues to work correctly

3.6 WHEN the API returns an error THEN the error is handled gracefully and displayed to the user
