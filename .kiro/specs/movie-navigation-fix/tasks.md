# Implementation Plan

## Movie Navigation Fix - Task List

- [x] 1. Write bug condition exploration test
  - **Property 1: Bug Condition** - Movie Card Navigation Triggers on Click and Enter
  - **CRITICAL**: This test MUST FAIL on unfixed code - failure confirms the bug exists
  - **DO NOT attempt to fix the test or the code when it fails**
  - **NOTE**: This test encodes the expected behavior - it will validate the fix when it passes after implementation
  - **GOAL**: Surface counterexamples that demonstrate the bug exists
  - **Scoped PBT Approach**: For deterministic bugs, scope the property to concrete failing cases to ensure reproducibility
  - Test implementation details from Bug Condition in design:
    - When a user clicks on a MovieCard in MovieCarousel context, navigation to `/movies/[movieId]` should be triggered
    - When a user clicks on a MovieCard in SearchResultsList context, navigation to `/movies/[movieId]` should be triggered
    - When a user presses Enter on a focused MovieCard, navigation to `/movies/[movieId]` should be triggered
  - The test assertions should match the Expected Behavior Properties from design:
    - Navigation occurs to the correct movie details page
    - View transition is applied for smooth animation
  - Run test on UNFIXED code
  - **EXPECTED OUTCOME**: Test FAILS (this is correct - it proves the bug exists)
  - Document counterexamples found to understand root cause:
    - MovieCarousel provides empty onClick handler instead of navigation logic
    - MovieCard onClick handler is not integrated with useViewTransition
    - SearchResultsList may not properly pass navigation handler to MovieCard
  - Mark task complete when test is written, run, and failure is documented
  - _Requirements: 1.1, 1.2, 1.3_

- [x] 2. Write preservation property tests (BEFORE implementing fix)
  - **Property 2: Preservation** - Non-Navigation Interactions Remain Unchanged
  - **IMPORTANT**: Follow observation-first methodology
  - Observe behavior on UNFIXED code for non-buggy inputs:
    - Carousel scroll buttons (left/right) continue to function
    - Hover state displays movie title and rating overlay
    - Watchlist badges (✓) display correctly in top-right corner
    - Focus ring (Netflix red) displays when card is keyboard-focused
    - Scale and shadow hover effects work correctly
    - Search results grid layout remains unchanged
    - Poster images display correctly with TMDb URLs
  - Write property-based tests capturing observed behavior patterns from Preservation Requirements:
    - For all carousel scroll interactions, scroll position changes correctly
    - For all hover interactions on non-focused cards, overlay displays with title and rating
    - For all watchlist states, badge displays or hides correctly
    - For all keyboard inputs except Enter, no navigation occurs
    - For all non-click interactions, component state remains unchanged
  - Property-based testing generates many test cases for stronger guarantees
  - Run tests on UNFIXED code
  - **EXPECTED OUTCOME**: Tests PASS (this confirms baseline behavior to preserve)
  - Mark task complete when tests are written, run, and passing on unfixed code
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [x] 3. Fix movie navigation across components

  - [x] 3.1 Implement MovieCarousel default navigation handler
    - Import `useRouter` from 'next/navigation' in MovieCarousel
    - Create a default navigation handler that uses `router.push(`/movies/${movieId}`)` when onMovieClick is not provided
    - Replace the empty default `onMovieClick = () => {}` with actual navigation logic
    - Ensure the handler is passed to each MovieCard component
    - _Bug_Condition: isBugCondition(input) where user clicks MovieCard in carousel but no navigation occurs_
    - _Expected_Behavior: expectedBehavior(result) - navigation to `/movies/[movieId]` with view transition_
    - _Preservation: Carousel scroll buttons continue to work, hover states unchanged, watchlist badges preserved_
    - _Requirements: 2.1, 3.1, 3.2, 3.4_

  - [x] 3.2 Implement MovieCard onClick integration with useViewTransition
    - Modify MovieCard to use `navigateWithTransition` from the useViewTransition hook
    - Update the onClick handler to call `navigateWithTransition` with the movie ID
    - Ensure keyboard Enter key also triggers navigation through the same path
    - Verify that the onClick callback receives the movieId and triggers navigation
    - _Bug_Condition: isBugCondition(input) where MovieCard onClick is not integrated with view transitions_
    - _Expected_Behavior: expectedBehavior(result) - smooth view transition animation during navigation_
    - _Preservation: Hover effects, watchlist badges, focus ring, and keyboard focus remain unchanged_
    - _Requirements: 2.1, 2.2, 2.3, 3.2, 3.5_

  - [x] 3.3 Verify SearchResultsList navigation integration
    - Confirm SearchResultsList imports and uses useRouter correctly
    - Update handleMovieClick to use `navigateWithTransition` for consistency with MovieCarousel
    - Verify the onClick handler is properly passed to MovieCard components
    - Test that search results navigation works with smooth view transitions
    - _Bug_Condition: isBugCondition(input) where user clicks MovieCard in search results but no navigation occurs_
    - _Expected_Behavior: expectedBehavior(result) - navigation to `/movies/[movieId]` with view transition_
    - _Preservation: Search results grid layout unchanged, all search functionality preserved_
    - _Requirements: 2.2, 3.3_

  - [x] 3.4 Verify bug condition exploration test now passes
    - **Property 1: Expected Behavior** - Movie Card Navigation Triggers on Click and Enter
    - **IMPORTANT**: Re-run the SAME test from task 1 - do NOT write a new test
    - The test from task 1 encodes the expected behavior
    - When this test passes, it confirms the expected behavior is satisfied
    - Run bug condition exploration test from step 1
    - Verify that clicking MovieCard in both carousel and search results triggers navigation
    - Verify that pressing Enter on focused MovieCard triggers navigation
    - Verify that view transitions are applied during navigation
    - **EXPECTED OUTCOME**: Test PASSES (confirms bug is fixed)
    - _Requirements: 2.1, 2.2, 2.3_

  - [x] 3.5 Verify preservation tests still pass
    - **Property 2: Preservation** - Non-Navigation Interactions Remain Unchanged
    - **IMPORTANT**: Re-run the SAME tests from task 2 - do NOT write new tests
    - Run preservation property tests from step 2
    - Verify carousel scroll buttons still work correctly
    - Verify hover states display correctly with title and rating
    - Verify watchlist badges display correctly
    - Verify focus ring displays correctly
    - Verify keyboard inputs other than Enter don't trigger navigation
    - **EXPECTED OUTCOME**: Tests PASS (confirms no regressions)
    - Confirm all tests still pass after fix (no regressions)
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [x] 4. Checkpoint - Ensure all tests pass
  - Verify all exploration and preservation tests pass
  - Verify no regressions in existing functionality
  - Confirm navigation works from both trending carousel and search results
  - Confirm view transitions animate smoothly during navigation
  - Confirm all visual states (hover, watchlist badge, focus ring) work correctly
  - Ensure all tests pass, ask the user if questions arise
