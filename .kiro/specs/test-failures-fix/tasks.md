# Implementation Plan

## Phase 1: Exploration - Surface the Bugs

- [x] 1. Write bug condition exploration test for validation schemas
  - **Property 1: Bug Condition** - Validation Schemas Accept Invalid Data
  - **CRITICAL**: This test MUST FAIL on unfixed code - failure confirms the bug exists
  - **DO NOT attempt to fix the test or the code when it fails**
  - **NOTE**: This test encodes the expected behavior - it will validate the fix when it passes after implementation
  - **GOAL**: Surface counterexamples that demonstrate validation accepts missing/empty required fields
  - **Scoped PBT Approach**: For deterministic bugs, scope the property to concrete failing cases:
    - Missing poster_path and release_date
    - Empty string for release_date
    - Undefined results array in API response
  - Test implementation details from Bug Condition in design:
    - Validate movie data missing poster_path (should reject, currently accepts)
    - Validate movie data missing release_date (should reject, currently accepts)
    - Validate movie data with empty release_date string (should reject, currently accepts)
    - Validate API response with undefined results array (should reject, currently accepts)
  - The test assertions should match the Expected Behavior Properties from design
  - Run test on UNFIXED code
  - **EXPECTED OUTCOME**: Test FAILS (this is correct - it proves the bug exists)
  - Document counterexamples found to understand root cause:
    - "movieSchema accepts data with missing poster_path instead of rejecting"
    - "movieSchema accepts data with empty release_date string instead of rejecting"
    - "apiResponseSchema accepts undefined results array instead of rejecting"
  - Mark task complete when test is written, run, and failure is documented
  - _Requirements: 1.1, 1.5_

- [x] 2. Write bug condition exploration test for MovieCard onClick callback
  - **Property 1: Bug Condition** - MovieCard Component Doesn't Invoke onClick Callback
  - **CRITICAL**: This test MUST FAIL on unfixed code - failure confirms the bug exists
  - **DO NOT attempt to fix the test or the code when it fails**
  - **NOTE**: This test encodes the expected behavior - it will validate the fix when it passes after implementation
  - **GOAL**: Surface counterexamples that demonstrate MovieCard doesn't invoke onClick callback
  - **Scoped PBT Approach**: For deterministic bugs, scope the property to concrete failing cases:
    - Click event on MovieCard with onClick callback
    - Enter key press on MovieCard with onClick callback
  - Test implementation details from Bug Condition in design:
    - Render MovieCard with onClick callback
    - Simulate click event and assert onClick callback is invoked with movie ID
    - Render MovieCard with onClick callback
    - Simulate Enter key press and assert onClick callback is invoked with movie ID
  - The test assertions should match the Expected Behavior Properties from design
  - Run test on UNFIXED code
  - **EXPECTED OUTCOME**: Test FAILS (this is correct - it proves the bug exists)
  - Document counterexamples found to understand root cause:
    - "MovieCard click handler doesn't invoke onClick callback"
    - "MovieCard Enter key handler doesn't invoke onClick callback"
  - Mark task complete when test is written, run, and failure is documented
  - _Requirements: 1.2, 1.3_

- [x] 3. Write bug condition exploration test for test fail() function
  - **Property 1: Bug Condition** - Test Files Use Undefined fail() Function
  - **CRITICAL**: This test MUST FAIL on unfixed code - failure confirms the bug exists
  - **DO NOT attempt to fix the test or the code when it fails**
  - **NOTE**: This test encodes the expected behavior - it will validate the fix when it passes after implementation
  - **GOAL**: Surface counterexamples that demonstrate fail() function is undefined
  - **Scoped PBT Approach**: For deterministic bugs, scope the property to concrete failing case:
    - Test file attempting to use fail() function
  - Test implementation details from Bug Condition in design:
    - Examine movie-parser.test.ts for fail() function usage
    - Verify that fail() is not defined in Jest
    - Confirm that tests using fail() throw "fail is not defined" error
  - The test assertions should match the Expected Behavior Properties from design
  - Run test on UNFIXED code
  - **EXPECTED OUTCOME**: Test FAILS (this is correct - it proves the bug exists)
  - Document counterexamples found to understand root cause:
    - "movie-parser.test.ts uses undefined fail() function"
    - "Jest doesn't provide global fail() function"
  - Mark task complete when test is written, run, and failure is documented
  - _Requirements: 1.4_

## Phase 2: Preservation - Verify Existing Behavior

- [x] 4. Write preservation property tests for validation schemas
  - **Property 2: Preservation** - Validation Schemas Accept Valid Data
  - **IMPORTANT**: Follow observation-first methodology
  - Observe behavior on UNFIXED code for valid movie data:
    - Valid movie with all required fields: `{ id: 550, title: 'Fight Club', poster_path: '/path.jpg', release_date: '1999-10-15' }`
    - Valid API response with results array: `{ results: [...], page: 1, total_pages: 10 }`
  - Write property-based tests capturing observed behavior patterns from Preservation Requirements:
    - For all valid movie data with all required fields present, validation accepts the data
    - For all valid API responses with results array, validation accepts the data
    - For all valid optional fields, validation applies defaults correctly
  - Property-based testing generates many test cases for stronger guarantees
  - Run tests on UNFIXED code
  - **EXPECTED OUTCOME**: Tests PASS (this confirms baseline behavior to preserve)
  - Mark task complete when tests are written, run, and passing on unfixed code
  - _Requirements: 3.5, 3.6_

- [x] 5. Write preservation property tests for MovieCard component
  - **Property 2: Preservation** - MovieCard Component Non-Click Interactions
  - **IMPORTANT**: Follow observation-first methodology
  - Observe behavior on UNFIXED code for non-click MovieCard interactions:
    - Hover state displays overlay with title and rating
    - Watchlist badge displays correctly
    - Keyboard input other than Enter doesn't trigger navigation
    - Non-click mouse interactions work correctly
  - Write property-based tests capturing observed behavior patterns from Preservation Requirements:
    - For all hover events, overlay displays correctly
    - For all watchlist status values, badge displays correctly
    - For all non-Enter keyboard events, no navigation occurs
    - For all non-click mouse events, no onClick callback is invoked
  - Property-based testing generates many test cases for stronger guarantees
  - Run tests on UNFIXED code
  - **EXPECTED OUTCOME**: Tests PASS (this confirms baseline behavior to preserve)
  - Mark task complete when tests are written, run, and passing on unfixed code
  - _Requirements: 3.1, 3.2, 3.3, 3.4_

## Phase 3: Implementation - Apply the Fixes

- [x] 6. Fix validation schemas to reject missing/empty required fields

  - [x] 6.1 Fix movieSchema in src/lib/validation/movie.schema.ts
    - Remove `.default('')` from release_date field and add `.min(1, 'Release date is required')` to require non-empty strings
    - Remove `.nullable().default(null)` from poster_path field and add `.min(1, 'Poster path is required')` to require non-empty strings
    - Ensure title validation includes `.min(1)` to reject empty strings
    - _Bug_Condition: isBugCondition(input) where input.release_date == '' OR input.poster_path == undefined_
    - _Expected_Behavior: Validation rejects missing/empty required fields with validation error_
    - _Preservation: Valid movie data with all required fields continues to be accepted_
    - _Requirements: 1.1, 1.5, 2.1, 2.5, 3.5_

  - [x] 6.2 Fix movieDetailsSchema in src/lib/validation/movie-details.schema.ts
    - Remove `.default('')` from overview field (keep as optional without default)
    - Keep genres, runtime, vote_average defaults as they are truly optional fields
    - _Bug_Condition: isBugCondition(input) where input.overview == ''_
    - _Expected_Behavior: Validation rejects empty overview strings_
    - _Preservation: Optional fields with defaults continue to work correctly_
    - _Requirements: 1.1, 2.1, 3.6_

  - [x] 6.3 Fix apiResponseSchema in src/lib/validation/api-response.schema.ts
    - Remove `.default([])` from results field to require the results array
    - Remove `.default(1)` from page field to require page number
    - Remove `.default(0)` from total_pages field to require total_pages
    - _Bug_Condition: isBugCondition(input) where input.results == undefined_
    - _Expected_Behavior: Validation rejects undefined required fields_
    - _Preservation: Valid API responses continue to be accepted_
    - _Requirements: 1.1, 2.1, 3.5_

- [x] 7. Fix MovieCard component to invoke onClick callback

  - [x] 7.1 Update handleClick handler in src/features/movies/components/MovieCard.tsx
    - Add `onClick(movie.id);` call before or after `navigateWithTransition()` call
    - Ensure onClick callback is invoked with the movie ID
    - _Bug_Condition: isBugCondition(input) where input.eventType == 'click' AND onClickCallback NOT invoked_
    - _Expected_Behavior: handleClick invokes onClick callback with movie ID and calls navigateWithTransition_
    - _Preservation: navigateWithTransition continues to be called on click_
    - _Requirements: 1.2, 2.2, 3.1_

  - [x] 7.2 Update handleKeyDown handler in src/features/movies/components/MovieCard.tsx
    - Add `onClick(movie.id);` call when Enter key is detected, before or after `navigateWithTransition()` call
    - Ensure onClick callback is invoked with the movie ID on Enter key
    - Ensure other keyboard keys don't invoke onClick callback
    - _Bug_Condition: isBugCondition(input) where input.eventType == 'keydown:Enter' AND onClickCallback NOT invoked_
    - _Expected_Behavior: handleKeyDown invokes onClick callback with movie ID on Enter key and calls navigateWithTransition_
    - _Preservation: Other keyboard keys don't trigger navigation or onClick callback_
    - _Requirements: 1.3, 2.3, 3.4_

- [x] 8. Fix test files to use proper error throwing

  - [x] 8.1 Replace fail() function with throw new Error() in src/lib/parsers/movie-parser.test.ts
    - Replace `fail('Should have thrown MovieParseError')` with `throw new Error('Should have thrown MovieParseError')` in first test case
    - Replace `fail('Should have thrown MovieParseError')` with `throw new Error('Should have thrown MovieParseError')` in second test case
    - _Bug_Condition: isBugCondition(input) where input.usesFailFunction == true_
    - _Expected_Behavior: Tests use throw new Error() instead of undefined fail() function_
    - _Preservation: Test error handling continues to work correctly_
    - _Requirements: 1.4, 2.4_

## Phase 4: Validation - Verify Fixes

- [x] 9. Verify bug condition exploration tests now pass

  - [x] 9.1 Re-run validation schemas bug condition test
    - **Property 1: Expected Behavior** - Validation Schemas Reject Invalid Data
    - **IMPORTANT**: Re-run the SAME test from task 1 - do NOT write a new test
    - The test from task 1 encodes the expected behavior
    - When this test passes, it confirms the expected behavior is satisfied
    - Run bug condition exploration test from step 1
    - **EXPECTED OUTCOME**: Test PASSES (confirms bug is fixed)
    - _Requirements: 2.1, 2.5_

  - [x] 9.2 Re-run MovieCard onClick bug condition test
    - **Property 1: Expected Behavior** - MovieCard Component Invokes onClick Callback
    - **IMPORTANT**: Re-run the SAME test from task 2 - do NOT write a new test
    - The test from task 2 encodes the expected behavior
    - When this test passes, it confirms the expected behavior is satisfied
    - Run bug condition exploration test from step 2
    - **EXPECTED OUTCOME**: Test PASSES (confirms bug is fixed)
    - _Requirements: 2.2, 2.3_

  - [x] 9.3 Re-run test fail() bug condition test
    - **Property 1: Expected Behavior** - Test Files Use Proper Error Throwing
    - **IMPORTANT**: Re-run the SAME test from task 3 - do NOT write a new test
    - The test from task 3 encodes the expected behavior
    - When this test passes, it confirms the expected behavior is satisfied
    - Run bug condition exploration test from step 3
    - **EXPECTED OUTCOME**: Test PASSES (confirms bug is fixed)
    - _Requirements: 2.4_

- [x] 10. Verify preservation tests still pass

  - [x] 10.1 Re-run validation schemas preservation test
    - **Property 2: Preservation** - Validation Schemas Accept Valid Data
    - **IMPORTANT**: Re-run the SAME tests from task 4 - do NOT write new tests
    - Run preservation property tests from step 4
    - **EXPECTED OUTCOME**: Tests PASS (confirms no regressions)
    - Confirm all tests still pass after fix (no regressions)
    - _Requirements: 3.5, 3.6_

  - [x] 10.2 Re-run MovieCard component preservation test
    - **Property 2: Preservation** - MovieCard Component Non-Click Interactions
    - **IMPORTANT**: Re-run the SAME tests from task 5 - do NOT write new tests
    - Run preservation property tests from step 5
    - **EXPECTED OUTCOME**: Tests PASS (confirms no regressions)
    - Confirm all tests still pass after fix (no regressions)
    - _Requirements: 3.1, 3.2, 3.3, 3.4_

- [x] 11. Checkpoint - Ensure all tests pass
  - Run full test suite to verify all 9 failing tests now pass
  - Verify no new test failures were introduced
  - Confirm all exploration tests pass (bugs are fixed)
  - Confirm all preservation tests pass (no regressions)
  - Ensure all tests pass, ask the user if questions arise
