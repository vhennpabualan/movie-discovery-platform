# TMDb API Client - Caching and Error Handling Bugfix

## Introduction

The TMDb API client has caching and in-flight request deduplication implemented, but the implementation contains subtle bugs that cause excessive API calls and error handling failures. The exploration tests fail because the caching and deduplication logic is not working correctly, and preservation tests fail because error handling is incomplete.

## Bug Analysis

### Current Behavior (Defect)

1.1 WHEN a user searches for the same movie query twice THEN the API is called twice instead of returning cached results

1.2 WHEN a user makes concurrent requests for the same query THEN the API is called multiple times instead of deduplicating in-flight requests

1.3 WHEN the API returns an error (404, 401, etc.) THEN the error is not properly caught and thrown as APIResponseError

1.4 WHEN a network error occurs THEN the error is not properly wrapped as NetworkError

1.5 WHEN an error occurs THEN the cache may not be properly cleared, preventing successful retries

1.6 WHEN the cache is cleared between tests THEN the in-flight requests map may not be properly cleared, causing test failures

### Expected Behavior (Correct)

2.1 WHEN a user searches for the same movie query twice THEN only one API call is made and cached results are returned for the second search

2.2 WHEN a user makes concurrent requests for the same query THEN only one API call is made and both requests receive identical results

2.3 WHEN the API returns an error (404, 401, etc.) THEN the error is properly caught and thrown as APIResponseError with status code and message preserved

2.4 WHEN a network error occurs THEN the error is properly wrapped as NetworkError

2.5 WHEN an error occurs THEN the cache is properly managed to allow successful retries

2.6 WHEN the cache is cleared between tests THEN both the search cache and in-flight requests map are properly cleared

### Unchanged Behavior (Regression Prevention)

3.1 WHEN the API returns a successful response THEN the response is validated against the schema before returning

3.2 WHEN the API returns a successful response THEN the response is cached for future requests

3.3 WHEN retry logic is triggered THEN exponential backoff is applied with correct delays

3.4 WHEN the maximum retry count is exceeded THEN the error is thrown without further retries

3.5 WHEN different queries are searched THEN each query is cached separately and not confused with other queries

3.6 WHEN pagination is used THEN cache keys include the page number to prevent mixing results from different pages
