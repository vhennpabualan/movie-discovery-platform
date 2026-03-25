# Test Failures Fix - Bugfix Design

## Overview

This design document addresses 9 failing tests caused by three distinct issues:

1. **Validation Schema Defect**: Zod schemas use `.default()` values on required fields, preventing rejection of missing or empty required fields
2. **MovieCard Component Defect**: The `handleClick` and `handleKeyDown` handlers don't invoke the `onClick` prop callback
3. **Test Utility Defect**: Test files use an undefined `fail()` function instead of throwing errors

The fix ensures validation properly rejects invalid data, the MovieCard component invokes callbacks correctly, and tests use proper error handling.

## Glossary

- **Bug_Condition (C)**: The condition that triggers the bug - when validation accepts invalid data, when onClick callback isn't invoked, or when fail() is called
- **Property (P)**: The desired behavior - validation rejects invalid data, onClick is invoked, tests throw errors
- **Preservation**: Existing behavior that must remain unchanged - valid data acceptance, non-buggy interactions, other test functionality
- **movieSchema**: Zod schema in `src/lib/validation/movie.schema.ts` that validates basic movie objects
- **movieDetailsSchema**: Zod schema in `src/lib/validation/movie-details.schema.ts` that extends movieSchema with additional fields
- **apiResponseSchema**: Zod schema in `src/lib/validation/api-response.schema.ts` that validates paginated API responses
- **MovieCard**: React component in `src/features/movies/components/MovieCard.tsx` that renders a movie poster card
- **handleClick/handleKeyDown**: Event handlers in MovieCard that should invoke the onClick callback

## Bug Details

### Bug Condition

The bugs manifest in three distinct scenarios:

**Scenario 1: Validation Schemas Accept Invalid Data**
When validation schemas have `.default()` or `.nullable().default()` on required fields, the system accepts missing or empty required fields instead of rejecting them. This occurs in:
- `movieSchema`: `release_date` has `.default('')` allowing empty strings
- `movieSchema`: `poster_path` has `.nullable().default(null)` allowing missing values
- `movieDetailsSchema`: `overview` has `.default('')` allowing empty strings
- `apiResponseSchema`: `results`, `page`, `total_pages` have `.default()` allowing missing values

**Scenario 2: MovieCard Component Doesn't Invoke onClick Callback**
When the MovieCard component's `handleClick` or `handleKeyDown` handlers are invoked, the system only calls `navigateWithTransition()` without invoking the `onClick` prop callback. This occurs in:
- `handleClick` handler: calls `navigateWithTransition()` but not `onClick(movie.id)`
- `handleKeyDown` handler: calls `navigateWithTransition()` on Enter key but not `onClick(movie.id)`

**Scenario 3: Test Files Use Undefined fail() Function**
When test files attempt to use `fail()` function, the system throws "fail is not defined" error because Jest doesn't provide this function. This occurs in:
- `src/lib/parsers/movie-parser.test.ts`: Two test cases use `fail('Should have thrown MovieParseError')`

### Formal Specification

```
FUNCTION isBugCondition(input)
  INPUT: input of type ValidationInput | ClickEvent | TestContext
  OUTPUT: boolean
  
  // Validation bug condition
  IF input.type == 'validation' THEN
    RETURN (input.data.release_date == '' OR input.data.release_date == undefined)
           OR (input.data.poster_path == '' OR input.data.poster_path == undefined)
           OR (input.data.overview == '' OR input.data.overview == undefined)
           OR (input.data.results == undefined)
  END IF
  
  // MovieCard onClick bug condition
  IF input.type == 'click' THEN
    RETURN (input.eventType == 'click' OR input.eventType == 'keydown:Enter')
           AND onClickCallback NOT invoked
  END IF
  
  // Test fail() bug condition
  IF input.type == 'test' THEN
    RETURN input.usesFailFunction == true
  END IF
  
  RETURN false
END FUNCTION
```

### Examples

**Validation Bug Examples:**
- Input: `{ id: 550, title: 'Fight Club' }` (missing poster_path, release_date)
  - Current: Accepted with defaults
  - Expected: Rejected with validation error
  
- Input: `{ id: 550, title: 'Fight Club', poster_path: '', release_date: '' }`
  - Current: Accepted with empty strings
  - Expected: Rejected with validation error

- Input: `{ results: undefined, page: 1, total_pages: 0 }`
  - Current: Accepted with default empty array
  - Expected: Rejected with validation error

**MovieCard onClick Bug Examples:**
- User clicks MovieCard with onClick callback
  - Current: Only navigates, callback not invoked
  - Expected: Both navigates AND invokes onClick(movieId)

- User presses Enter on focused MovieCard with onClick callback
  - Current: Only navigates, callback not invoked
  - Expected: Both navigates AND invokes onClick(movieId)

**Test fail() Bug Examples:**
- Test file calls `fail('Should have thrown MovieParseError')`
  - Current: Throws "fail is not defined" error
  - Expected: Test fails with proper error message

## Expected Behavior

### Preservation Requirements

**Unchanged Behaviors:**
- Valid movie data with all required fields present must continue to be accepted
- Optional fields with default values must continue to work correctly
- MovieCard rendering with valid data must continue to display correctly
- MovieCard hover state must continue to display overlay with title and rating
- MovieCard watchlist badge must continue to display correctly
- MovieCard keyboard navigation (non-Enter keys) must continue to not trigger navigation
- MovieCard mouse interactions (non-click) must continue to work correctly
- Tests that don't use fail() must continue to pass

**Scope:**
All inputs that do NOT involve the bug conditions should be completely unaffected by this fix. This includes:
- Valid movie data with all required fields
- MovieCard interactions other than click/Enter key
- Test cases that use proper error handling (expect().toThrow())
- Non-validation code paths

## Hypothesized Root Cause

Based on the bug description, the most likely issues are:

1. **Zod Schema Default Values**: The schemas use `.default()` to provide fallback values for missing fields, but this prevents validation from rejecting missing required fields. The `.default()` method makes fields optional by providing a default value when the field is missing.

2. **MovieCard Event Handler Implementation**: The `handleClick` and `handleKeyDown` handlers only call `navigateWithTransition()` without also invoking the `onClick` prop callback. The component receives the callback but doesn't use it in the event handlers.

3. **Jest fail() Function Unavailability**: Jest doesn't provide a global `fail()` function. Tests should use `throw new Error()` or Jest's `expect().toThrow()` pattern instead.

## Correctness Properties

Property 1: Bug Condition - Validation Rejects Invalid Data

_For any_ input where the bug condition holds (missing required fields, empty required strings, or undefined required arrays), the fixed validation schemas SHALL reject the input with a validation error and NOT accept it with default values.

**Validates: Requirements 2.1, 2.5**

Property 2: Bug Condition - MovieCard Invokes onClick Callback

_For any_ click event or Enter key press on the MovieCard component, the fixed component SHALL invoke the `onClick` prop callback with the movie ID AND also call `navigateWithTransition()`.

**Validates: Requirements 2.2, 2.3**

Property 3: Bug Condition - Tests Use Proper Error Throwing

_For any_ test case that needs to fail, the fixed test files SHALL use `throw new Error()` instead of calling an undefined `fail()` function.

**Validates: Requirements 2.4**

Property 4: Preservation - Valid Data Acceptance

_For any_ input where the bug condition does NOT hold (valid data with all required fields present and non-empty), the fixed validation schemas SHALL accept the data and return it correctly.

**Validates: Requirements 3.5, 3.6**

Property 5: Preservation - MovieCard Non-Navigation Interactions

_For any_ MovieCard interaction that is NOT a click or Enter key press (hover, other keyboard keys, watchlist status), the fixed component SHALL produce the same result as the original component, preserving all existing functionality.

**Validates: Requirements 3.1, 3.2, 3.3, 3.4**

Property 6: Preservation - Test Functionality

_For any_ test case that uses proper error handling (expect().toThrow()), the fixed test files SHALL continue to pass and maintain the same behavior as before.

**Validates: Requirements 3.1, 3.2, 3.3**

## Fix Implementation

### Changes Required

Assuming our root cause analysis is correct:

**File 1**: `src/lib/validation/movie.schema.ts`

**Function**: `movieSchema` object definition

**Specific Changes**:
1. **Remove default from release_date**: Change `z.string().default('')` to `z.string().min(1, 'Release date is required')` to require non-empty strings
2. **Remove nullable and default from poster_path**: Change `z.string().min(1, 'Poster path is required').nullable().default(null)` to `z.string().min(1, 'Poster path is required')` to require non-empty strings
3. **Add title validation**: Ensure title validation includes `.min(1)` to reject empty strings

**File 2**: `src/lib/validation/movie-details.schema.ts`

**Function**: `movieDetailsSchema` object definition

**Specific Changes**:
1. **Remove default from overview**: Change `z.string().default('')` to `z.string()` (optional but no default) or keep as optional with `.optional()` if overview can be missing
2. **Keep genres, runtime, vote_average defaults**: These are truly optional fields that should have defaults

**File 3**: `src/lib/validation/api-response.schema.ts`

**Function**: `apiResponseSchema` object definition

**Specific Changes**:
1. **Remove default from results**: Change `z.array(movieSchema).default([])` to `z.array(movieSchema)` to require the results array
2. **Remove default from page**: Change `z.number().int().positive('Page must be a positive integer').default(1)` to `z.number().int().positive('Page must be a positive integer')` to require page number
3. **Remove default from total_pages**: Change `z.number().int().nonnegative('Total pages must be non-negative').default(0)` to `z.number().int().nonnegative('Total pages must be non-negative')` to require total_pages

**File 4**: `src/features/movies/components/MovieCard.tsx`

**Function**: `handleClick` and `handleKeyDown` event handlers

**Specific Changes**:
1. **Update handleClick**: Add `onClick(movie.id);` before or after `navigateWithTransition()` call
2. **Update handleKeyDown**: Add `onClick(movie.id);` before or after `navigateWithTransition()` call when Enter key is detected

**File 5**: `src/lib/parsers/movie-parser.test.ts`

**Function**: Test cases using `fail()`

**Specific Changes**:
1. **Replace fail() in test case 1**: Change `fail('Should have thrown MovieParseError')` to `throw new Error('Should have thrown MovieParseError')`
2. **Replace fail() in test case 2**: Change `fail('Should have thrown MovieParseError')` to `throw new Error('Should have thrown MovieParseError')`

## Testing Strategy

### Validation Approach

The testing strategy follows a two-phase approach: first, surface counterexamples that demonstrate the bugs on unfixed code, then verify the fixes work correctly and preserve existing behavior.

### Exploratory Bug Condition Checking

**Goal**: Surface counterexamples that demonstrate the bugs BEFORE implementing the fix. Confirm or refute the root cause analysis.

**Test Plan**: 
- Write tests that validate schemas with missing required fields and assert they are rejected
- Write tests that click MovieCard and assert onClick callback is invoked
- Write tests that use fail() function and observe the error

**Test Cases**:
1. **Validation Missing Fields Test**: Validate movie data missing poster_path and release_date (will fail on unfixed code - data accepted instead of rejected)
2. **Validation Empty String Test**: Validate movie data with empty release_date string (will fail on unfixed code - empty string accepted instead of rejected)
3. **MovieCard Click Test**: Click MovieCard and assert onClick callback is invoked (will fail on unfixed code - callback not invoked)
4. **MovieCard Enter Key Test**: Press Enter on MovieCard and assert onClick callback is invoked (will fail on unfixed code - callback not invoked)
5. **Test fail() Function Test**: Observe "fail is not defined" error when test runs (will fail on unfixed code)

**Expected Counterexamples**:
- Validation accepts data with missing required fields instead of rejecting
- Validation accepts data with empty required strings instead of rejecting
- MovieCard click handler doesn't invoke onClick callback
- MovieCard Enter key handler doesn't invoke onClick callback
- Test files throw "fail is not defined" error

### Fix Checking

**Goal**: Verify that for all inputs where the bug condition holds, the fixed code produces the expected behavior.

**Pseudocode:**
```
FOR ALL input WHERE isBugCondition(input) DO
  IF input.type == 'validation' THEN
    result := schema.parse(input.data)
    ASSERT result throws ValidationError
  END IF
  
  IF input.type == 'click' THEN
    result := handleClick()
    ASSERT onClick callback invoked
    ASSERT navigateWithTransition called
  END IF
  
  IF input.type == 'test' THEN
    result := test execution
    ASSERT test throws proper error
  END IF
END FOR
```

### Preservation Checking

**Goal**: Verify that for all inputs where the bug condition does NOT hold, the fixed code produces the same result as the original code.

**Pseudocode:**
```
FOR ALL input WHERE NOT isBugCondition(input) DO
  ASSERT original_code(input) = fixed_code(input)
END FOR
```

**Testing Approach**: Property-based testing is recommended for preservation checking because:
- It generates many test cases automatically across the input domain
- It catches edge cases that manual unit tests might miss
- It provides strong guarantees that behavior is unchanged for all non-buggy inputs

**Test Plan**: 
- Observe behavior on UNFIXED code for valid movie data, then write tests to verify this continues after fix
- Observe behavior on UNFIXED code for MovieCard non-click interactions, then write tests to verify this continues after fix
- Observe behavior on UNFIXED code for tests using proper error handling, then verify they continue to pass

**Test Cases**:
1. **Valid Movie Data Preservation**: Verify valid movie data with all required fields is accepted after fix
2. **Optional Fields Preservation**: Verify optional fields with defaults continue to work correctly
3. **MovieCard Hover Preservation**: Verify hover state displays overlay correctly after fix
4. **MovieCard Watchlist Preservation**: Verify watchlist badge displays correctly after fix
5. **MovieCard Non-Click Preservation**: Verify non-click interactions don't trigger navigation after fix
6. **Test Error Handling Preservation**: Verify tests using expect().toThrow() continue to pass after fix

### Unit Tests

- Test validation schemas reject missing required fields
- Test validation schemas reject empty required strings
- Test validation schemas accept valid data with all required fields
- Test MovieCard onClick callback is invoked on click
- Test MovieCard onClick callback is invoked on Enter key
- Test MovieCard onClick callback is not invoked on other keys
- Test movie-parser.test.ts uses proper error throwing instead of fail()

### Property-Based Tests

- Generate random movie data and verify validation accepts valid data and rejects invalid data
- Generate random click events and verify onClick callback is invoked
- Generate random keyboard events and verify only Enter key invokes onClick callback
- Generate random hover/non-click interactions and verify they don't invoke onClick callback

### Integration Tests

- Test full movie validation flow with valid and invalid data
- Test MovieCard component with valid data and verify all interactions work correctly
- Test movie-parser with various data inputs and verify proper error handling
- Test that validation errors are properly propagated through the application
