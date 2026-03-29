# TMDb API Client - Caching and Error Handling Fix - Design Document

## Overview

The TMDb API client has caching and in-flight request deduplication implemented, but the implementation contains subtle bugs. The cache key generation, promise handling, error propagation, and cleanup logic need to be fixed to ensure:
1. Duplicate queries return cached results
2. Concurrent requests are deduplicated
3. Errors are properly caught and thrown
4. Cache is properly managed on errors

## Glossary

- **Bug_Condition (C)**: The condition that triggers the bug - when caching/deduplication logic fails to prevent duplicate API calls or when error handling doesn't properly catch/throw errors
- **Property (P)**: The desired behavior - only one API call per unique query, proper error handling with correct error types
- **Cache Key**: The string used to identify cached results (format: `query:page`)
- **In-Flight Map**: Map storing promises for requests currently in progress to deduplicate concurrent requests
- **APIResponseError**: Custom error class for API response errors (4xx, 5xx status codes)
- **NetworkError**: Custom error class for network-level errors (fetch failures)
- **searchCache**: Map storing cached API responses by cache key
- **inFlightRequests**: Map storing in-flight request promises by cache key

## Bug Details

### Bug Condition

The bug manifests when:
1. A user searches for the same query twice - the cache check fails or cache is not being set/retrieved correctly
2. A user makes concurrent requests for the same query - the in-flight deduplication doesn't return the same promise
3. An API error occurs - the error is not properly caught and thrown as the correct error type
4. A network error occurs - the error is not properly wrapped as NetworkError

**Formal Specification:**
```
FUNCTION isBugCondition(input)
  INPUT: input of type SearchRequest or APICall
  OUTPUT: boolean
  
  RETURN (input.isDuplicateQuery AND cache.get(cacheKey) == null)
         OR (input.isConcurrentRequest AND inFlightRequests.get(cacheKey) == null)
         OR (input.isAPIError AND errorType != APIResponseError)
         OR (input.isNetworkError AND errorType != NetworkError)
END FUNCTION
```

### Examples

- **Example 1 - Duplicate Query**: User searches for "inception", gets results. User searches for "inception" again. API is called twice instead of returning cached results.

- **Example 2 - Concurrent Requests**: User's search component makes two concurrent requests for "inception" before the first completes. API is called twice instead of deduplicating to one call.

- **Example 3 - Typing Simulation**: User types "inception" character by character. API is called 9 times (once per character) instead of only for the final complete query.

- **Example 4 - API Error**: API returns 404 Not Found. Error is not thrown as APIResponseError, causing error handling to fail.

- **Example 5 - Network Error**: Network request fails. Error is not wrapped as NetworkError, causing error handling to fail.

## Expected Behavior

### Preservation Requirements

**Unchanged Behaviors:**
- Schema validation must continue to work for all API responses
- Exponential backoff retry logic must continue to work
- Different queries must be cached separately
- Pagination must work correctly with cache keys including page numbers
- All API functions (searchMovies, getMovieDetails, getSimilarMovies, getMoviesByTrending) must continue to work

**Scope:**
All inputs that do NOT involve caching/deduplication/error handling should be completely unaffected by this fix.

## Hypothesized Root Cause

Based on the test failures and code analysis:

1. **Cache Key Issue**: Cache key generation may be inconsistent or incorrect, causing cache misses
2. **In-Flight Deduplication Issue**: The in-flight map may not be properly storing/retrieving promises, or the cleanup logic may be interfering
3. **Error Handling Issue**: Error catching may be incomplete, with ZodError or network errors not being properly handled
4. **Promise Handling Issue**: The promise returned from in-flight map may not be properly awaited or may be resolved before being stored

## Correctness Properties

Property 1: Bug Condition - Caching Works Correctly

_For any_ duplicate search query (same query searched twice), the fixed searchMovies function SHALL make only one API call and return cached results for the second call.

**Validates: Requirements 2.1, 2.3**

Property 2: Bug Condition - In-Flight Deduplication Works

_For any_ concurrent requests with the same query, the fixed searchMovies function SHALL make only one API call and return identical results for both requests.

**Validates: Requirements 2.2**

Property 3: Bug Condition - Error Handling Works

_For any_ API error response (4xx, 5xx status codes), the fixed makeRequest function SHALL throw an APIResponseError with the correct status code and message preserved.

**Validates: Requirements 2.4**

Property 4: Bug Condition - Network Error Handling Works

_For any_ network-level error (fetch failure), the fixed makeRequest function SHALL throw a NetworkError.

**Validates: Requirements 2.5**

Property 5: Preservation - Schema Validation Preserved

_For any_ successful API response, the fixed code SHALL validate the response against the schema before returning, exactly as the original code does.

**Validates: Requirements 3.1**

Property 6: Preservation - Retry Logic Preserved

_For any_ retryable error, the fixed code SHALL apply exponential backoff and retry up to MAX_RETRIES times, exactly as the original code does.

**Validates: Requirements 3.3, 3.4**

## Fix Implementation

### Changes Required

**File**: `src/lib/api/tmdb-client.ts`

**Specific Changes**:

1. **Verify Cache Key Generation**: Ensure cache key is consistently generated as `query:page` format
2. **Fix In-Flight Deduplication**: Ensure in-flight promises are properly stored and retrieved before making new requests
3. **Fix Error Handling**: Ensure all error types (APIResponseError, NetworkError, ValidationError) are properly caught and thrown
4. **Fix Promise Cleanup**: Ensure in-flight map entries are properly cleaned up after request completes or fails
5. **Fix Cache Management**: Ensure cache is properly set after successful response and not corrupted by errors

### Testing Strategy

### Exploratory Bug Condition Checking

**Goal**: Surface counterexamples that demonstrate the bug BEFORE implementing the fix.

**Test Cases**:
1. **Duplicate Query Caching**: Verify that duplicate queries return cached results (will fail on unfixed code)
2. **In-Flight Deduplication**: Verify that concurrent requests are deduplicated (will fail on unfixed code)
3. **Typing Simulation**: Verify that typing character by character doesn't cause multiple API calls (will fail on unfixed code)

**Expected Counterexamples**:
- Multiple API calls for duplicate queries
- Multiple API calls for concurrent requests
- Multiple API calls for typing simulation

### Fix Checking

**Goal**: Verify that for all inputs where the bug condition holds, the fixed function produces the expected behavior.

**Pseudocode:**
```
FOR ALL searchRequest WHERE isDuplicateQuery(searchRequest) DO
  result1 := searchMovies(query)
  result2 := searchMovies(query)
  ASSERT apiCallCount == 1
  ASSERT result1 == result2
END FOR

FOR ALL searchRequest WHERE isConcurrentRequest(searchRequest) DO
  promise1 := searchMovies(query)
  promise2 := searchMovies(query)
  result1 := await promise1
  result2 := await promise2
  ASSERT apiCallCount == 1
  ASSERT result1 == result2
END FOR

FOR ALL apiError WHERE isAPIError(apiError) DO
  ASSERT error instanceof APIResponseError
  ASSERT error.statusCode == apiError.status
END FOR
```

### Preservation Checking

**Goal**: Verify that for all inputs where the bug condition does NOT hold, the fixed function produces the same result as the original function.

**Test Cases**:
1. **Schema Validation Preservation**: Verify that responses are still validated
2. **Retry Logic Preservation**: Verify that retry logic still works with exponential backoff
3. **Different Query Caching**: Verify that different queries are cached separately
4. **Pagination Preservation**: Verify that pagination works correctly

## Unit Tests

- Test that duplicate queries return cached results
- Test that concurrent requests are deduplicated
- Test that typing simulation doesn't cause multiple API calls
- Test that APIResponseError is thrown with correct status code
- Test that NetworkError is thrown for network failures
- Test that error messages are preserved
- Test that cache is properly cleared on errors
- Test that retry logic works after errors
- Test that different queries are cached separately
- Test that pagination works correctly with cache keys
