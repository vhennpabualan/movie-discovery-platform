# Implementation Plan

- [x] 1. Write bug condition exploration test - Navigation
  - **Property 1: Bug Condition** - Search Navigation Double Call
  - **CRITICAL**: This test MUST FAIL on unfixed code - failure confirms the bug exists
  - **DO NOT attempt to fix the test or the code when it fails**
  - **NOTE**: This test encodes the expected behavior - it will validate the fix when it passes after implementation
  - **GOAL**: Surface counterexamples that demonstrate the navigation bug exists
  - **Scoped PBT Approach**: Scope the property to the concrete failing case: clicking on a movie in SearchResultsList
  - Test that clicking a movie in SearchResultsList navigates to /movies/[id] with a completed view transition (from Bug Condition in design)
  - The test assertions should verify:
    - Navigation to /movies/[id] completes successfully
    - View transition completes without interruption
    - startViewTransition is called exactly once
  - Run test on UNFIXED code
  - **EXPECTED OUTCOME**: Test FAILS (this is correct - it proves the bug exists)
  - Document counterexamples found to understand root cause (e.g., "startViewTransition called twice, navigation fails")
  - Mark task complete when test is written, run, and failure is documented
  - _Requirements: 1.1, 1.2_

- [x] 2. Write bug condition exploration test - API Requests
  - **Property 3: Bug Condition** - Excessive API Requests
  - **CRITICAL**: This test MUST FAIL on unfixed code - failure confirms the bug exists
  - **DO NOT attempt to fix the test or the code when it fails**
  - **NOTE**: This test encodes the expected behavior - it will validate the fix when it passes after implementation
  - **GOAL**: Surface counterexamples that demonstrate the API bug exists
  - **Scoped PBT Approach**: Scope the property to concrete failing cases:
    - Duplicate query: search for "inception" twice
    - In-flight requests: search for "inception" twice rapidly
    - Typing: simulate typing "inception" character by character
  - Test that searchMovies makes only one API call per unique query (from Bug Condition in design)
  - The test assertions should verify:
    - Only one API call is made for duplicate queries
    - In-flight requests are deduplicated
    - Results are cached and reused
  - Run test on UNFIXED code
  - **EXPECTED OUTCOME**: Test FAILS (this is correct - it proves the bug exists)
  - Document counterexamples found (e.g., "searchMovies called 9 times for typing 'inception'")
  - Mark task complete when test is written, run, and failure is documented
  - _Requirements: 1.3, 1.4, 1.5_

- [x] 3. Write preservation property tests (BEFORE implementing fix)
  - **Property 2: Preservation** - Non-Search Navigation Behavior
  - **IMPORTANT**: Follow observation-first methodology
  - Observe: SearchBar dropdown clicks navigate correctly on unfixed code
  - Observe: Keyboard navigation in SearchBar works on unfixed code
  - Observe: Movie cards in trending/related sections navigate correctly on unfixed code
  - Observe: Error handling displays errors correctly on unfixed code
  - Write property-based tests capturing observed behavior patterns from Preservation Requirements
  - Property-based testing generates many test cases for stronger guarantees
  - The test assertions should verify:
    - SearchBar navigation continues to work
    - Keyboard navigation continues to work
    - Other movie card navigation continues to work
    - Error handling continues to work
  - Run tests on UNFIXED code
  - **EXPECTED OUTCOME**: Tests PASS (this confirms baseline behavior to preserve)
  - Mark task complete when tests are written, run, and passing on unfixed code
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6_

- [x] 4. Write preservation property tests - API Error Handling
  - **Property 4: Preservation** - API Error Handling
  - **IMPORTANT**: Follow observation-first methodology
  - Observe: API errors are handled and displayed correctly on unfixed code
  - Observe: Error messages are shown to user on unfixed code
  - Observe: Search continues to work after error on unfixed code
  - Write property-based tests capturing observed error handling behavior
  - The test assertions should verify:
    - Errors are caught and handled
    - Error messages are displayed
    - Search can recover from errors
  - Run tests on UNFIXED code
  - **EXPECTED OUTCOME**: Tests PASS (this confirms baseline error handling to preserve)
  - Mark task complete when tests are written, run, and passing on unfixed code
  - _Requirements: 3.6_

- [-] 5. Fix for Search Navigation and API Optimization

  - [x] 5.1 Fix SearchResultsList navigation double call
    - Remove navigateWithTransition import from SearchResultsList
    - Remove handleMovieClick function that calls navigateWithTransition
    - Modify SearchResultsList to pass movie ID to MovieCard's onClick without calling navigate
    - Let MovieCard handle all navigation exclusively
    - _Bug_Condition: isBugCondition_Navigation(input) where user clicks movie in SearchResultsList_
    - _Expected_Behavior: Navigation to /movies/[id] completes with single View Transition_
    - _Preservation: SearchBar and other movie card navigation continue to work_
    - _Requirements: 2.1, 2.2, 3.1, 3.2, 3.3, 3.4, 3.5_

  - [x] 5.2 Add caching and deduplication to searchMovies
    - Create cache Map to store search results by query
    - Create in-flight requests Map to track pending requests
    - Modify searchMovies to:
      1. Check if result is in cache → return cached result
      2. Check if request is in-flight → wait for in-flight request to complete
      3. If neither, make new request and store in in-flight map
      4. Cache result when complete
      5. Clean up in-flight map entry
    - _Bug_Condition: isBugCondition_API(input) where search query is made_
    - _Expected_Behavior: API calls are debounced, cached, and deduplicated_
    - _Preservation: Error handling and API behavior continue to work_
    - _Requirements: 2.3, 2.4, 2.5, 3.6_

  - [x] 5.3 Verify bug condition exploration test - Navigation now passes
    - **Property 1: Expected Behavior** - Search Navigation Success
    - **IMPORTANT**: Re-run the SAME test from task 1 - do NOT write a new test
    - The test from task 1 encodes the expected behavior
    - When this test passes, it confirms the navigation bug is fixed
    - Run bug condition exploration test from step 1
    - **EXPECTED OUTCOME**: Test PASSES (confirms navigation bug is fixed)
    - _Requirements: 2.1, 2.2_

  - [x] 5.4 Verify bug condition exploration test - API now passes
    - **Property 3: Expected Behavior** - API Request Optimization
    - **IMPORTANT**: Re-run the SAME test from task 2 - do NOT write a new test
    - The test from task 2 encodes the expected behavior
    - When this test passes, it confirms the API bug is fixed
    - Run bug condition exploration test from step 2
    - **EXPECTED OUTCOME**: Test PASSES (confirms API bug is fixed)
    - _Requirements: 2.3, 2.4, 2.5_

  - [x] 5.5 Verify preservation tests still pass
    - **Property 2: Preservation** - Non-Search Navigation Behavior
    - **IMPORTANT**: Re-run the SAME tests from task 3 - do NOT write new tests
    - Run preservation property tests from step 3
    - **EXPECTED OUTCOME**: Tests PASS (confirms no regressions in navigation)
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

  - [x] 5.6 Verify preservation tests - API Error Handling still pass
    - **Property 4: Preservation** - API Error Handling
    - **IMPORTANT**: Re-run the SAME tests from task 4 - do NOT write new tests
    - Run preservation property tests from step 4
    - **EXPECTED OUTCOME**: Tests PASS (confirms no regressions in error handling)
    - _Requirements: 3.6_

- [x] 6. Checkpoint - Ensure all tests pass
  - Ensure all exploration tests pass (tasks 1, 2)
  - Ensure all preservation tests pass (tasks 3, 4)
  - Ensure all verification tests pass (tasks 5.3, 5.4, 5.5, 5.6)
  - Confirm no regressions in other parts of the application
  - Ask the user if questions arise
