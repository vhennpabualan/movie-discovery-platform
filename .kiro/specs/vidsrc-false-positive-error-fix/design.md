# Vidsrc False Positive Error Fix - Design Document

## Overview

The Vidsrc streaming player displays a false positive "media not available" error message even when the iframe successfully loads and the movie can be watched. The bug is a UI state management issue where the error state is being set incorrectly despite successful URL generation. The Network tab confirms successful 200 responses for the embed URL, indicating the stream is working correctly. This fix will distinguish between actual errors (URL generation failure) and transient states, ensuring error messages only appear when legitimate failures occur.

## Glossary

- **Bug_Condition (C)**: The condition that triggers the bug - when a valid embed URL is generated successfully but the system still displays an error message
- **Property (P)**: The desired behavior when a valid URL is generated - the player should display without any error UI
- **Preservation**: Existing error handling for legitimate failures (invalid TMDB ID, all domains failed) that must remain unchanged
- **useVidsrcPlayer**: The custom React hook in `src/features/vidsrc-streaming/hooks/useVidsrcPlayer.ts` that manages URL generation and error state
- **VidsrcStreamingPlayer**: The component in `src/features/vidsrc-streaming/components/VidsrcStreamingPlayer.tsx` that renders the iframe and error UI
- **embedURL**: The generated Vidsrc embed URL that is passed to the iframe's src attribute
- **error state**: The `error` property in the hook's return value that triggers error UI display in the component

## Bug Details

### Bug Condition

The bug manifests when a valid embed URL is successfully generated and the iframe loads correctly, yet the system displays "media not available" error message with a "Try Again" button. The user can watch the movie despite the error message being displayed, indicating the iframe is functioning correctly but the error state is not being cleared.

**Formal Specification:**
```
FUNCTION isBugCondition(input)
  INPUT: input of type {tmdbId: number, contentType: 'movie' | 'tv', season?: number, episode?: number}
  OUTPUT: boolean
  
  RETURN validEmbedURLGenerated(input.tmdbId, input.contentType)
         AND iframeLoadsSuccessfully(input.tmdbId, input.contentType)
         AND errorStateIsDisplayed()
         AND userCanWatchContent()
END FUNCTION
```

### Examples

**Example 1: Movie with Valid TMDB ID**
- Input: `tmdbId=550, contentType='movie'`
- Expected: Player displays iframe without error message
- Actual (Bug): Player displays "media not available" error message while iframe loads successfully
- Network Response: 200 OK for embed URL

**Example 2: TV Show with Valid TMDB ID**
- Input: `tmdbId=1399, contentType='tv', season=1, episode=1`
- Expected: Player displays iframe without error message
- Actual (Bug): Player displays "media not available" error message while iframe loads successfully
- Network Response: 200 OK for embed URL

**Example 3: Valid URL with Subtitle Language**
- Input: `tmdbId=550, contentType='movie', subtitleLanguage='es'`
- Expected: Player displays iframe with Spanish subtitles, no error message
- Actual (Bug): Player displays error message despite successful URL generation and iframe load
- Network Response: 200 OK for embed URL

**Example 4: Edge Case - Out of Range TMDB ID (Should Still Show Error)**
- Input: `tmdbId=-1, contentType='movie'`
- Expected: Player displays "Invalid movie ID - streaming unavailable" error
- Actual: Player correctly displays error (this should NOT change)
- This is a legitimate error that should be preserved

## Expected Behavior

### Preservation Requirements

**Unchanged Behaviors:**
- When TMDB ID validation fails (invalid ID), the system SHALL CONTINUE TO display "Invalid movie ID - streaming unavailable" error
- When all domains are unavailable, the system SHALL CONTINUE TO display "Stream not available - please try again later" error
- When the user clicks "Try Again" after a legitimate error, the system SHALL CONTINUE TO retry URL generation and domain fallback
- When subtitle language is selected, the system SHALL CONTINUE TO update the embed URL with the selected language parameter
- When the player is loading, the system SHALL CONTINUE TO display the loading skeleton
- Mouse clicks on the "Try Again" button SHALL CONTINUE TO trigger the retry function

**Scope:**
All inputs that do NOT involve successful URL generation should be completely unaffected by this fix. This includes:
- Invalid TMDB IDs (negative, non-integer, out of range)
- All domains being unavailable
- URL generation failures
- Subtitle language changes (should continue to work)
- Retry functionality (should continue to work)

## Hypothesized Root Cause

Based on the bug description and code analysis, the most likely issues are:

1. **Missing Iframe Load/Error Event Handlers**: The component does not have event listeners on the iframe to detect when it successfully loads or fails to load. The hook only manages URL generation state, not iframe loading state. This means even if the URL is valid and the iframe loads successfully, there's no mechanism to clear the error state or confirm successful loading.

2. **Error State Not Cleared After Successful URL Generation**: The hook correctly sets `error: null` when URL generation succeeds, but if there's a timing issue or the component doesn't properly reflect this state change, the error UI might persist.

3. **Stale Closure in useEffect**: The `generateURL` callback has dependencies that might cause it to be recreated unnecessarily, potentially leading to race conditions where an old error state persists.

4. **Component Not Responding to State Changes**: The component might not be properly re-rendering when the hook's state changes from error to success.

## Correctness Properties

Property 1: Bug Condition - Valid URL Generation Clears Error State

_For any_ input where a valid embed URL is successfully generated (isBugCondition returns true), the fixed useVidsrcPlayer hook SHALL set `error: null` and `loading: false`, and the VidsrcStreamingPlayer component SHALL display the iframe without any error UI.

**Validates: Requirements 2.1, 2.2, 2.3**

Property 2: Preservation - Legitimate Errors Still Display

_For any_ input where URL generation fails (isBugCondition returns false), the fixed code SHALL produce exactly the same behavior as the original code, preserving all error handling for invalid TMDB IDs, all domains failed, and other legitimate failures.

**Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5**

## Fix Implementation

### Changes Required

Assuming our root cause analysis is correct, the fix involves two main components:

**File 1**: `src/features/vidsrc-streaming/hooks/useVidsrcPlayer.ts`

**Issue**: The hook's `generateURL` callback has a complex dependency array that might cause unnecessary re-renders or race conditions. The callback is marked as `async` but doesn't actually use `await`, which could cause timing issues.

**Specific Changes**:
1. **Remove async keyword**: The `generateURL` function is marked as `async` but doesn't use `await`. This should be removed to avoid confusion and potential timing issues.
2. **Simplify dependency array**: Review the dependency array to ensure it only includes values that actually affect URL generation logic.
3. **Ensure state is set correctly**: Verify that when URL generation succeeds, `error: null` is explicitly set.

**File 2**: `src/features/vidsrc-streaming/components/VidsrcStreamingPlayer.tsx`

**Issue**: The component does not have iframe load/error event handlers to detect real iframe failures. It only displays the iframe when `embedURL` is set and `error` is null, but there's no mechanism to detect if the iframe itself fails to load.

**Specific Changes**:
1. **Add iframe ref**: Create a ref to access the iframe element directly.
2. **Add load event handler**: Attach an `onLoad` event handler to the iframe to confirm successful loading.
3. **Add error event handler**: Attach an `onError` event handler to the iframe to detect iframe-level failures.
4. **Update state on iframe events**: When iframe loads successfully, ensure error state is cleared. When iframe fails, set an appropriate error state.
5. **Handle iframe load failures**: If the iframe fails to load (404, CORS error, etc.), display an error message distinct from URL generation errors.

## Testing Strategy

### Validation Approach

The testing strategy follows a two-phase approach: first, surface counterexamples that demonstrate the bug on unfixed code, then verify the fix works correctly and preserves existing behavior.

### Exploratory Bug Condition Checking

**Goal**: Surface counterexamples that demonstrate the bug BEFORE implementing the fix. Confirm or refute the root cause analysis. If we refute, we will need to re-hypothesize.

**Test Plan**: Write tests that simulate successful URL generation and verify that the error state is NOT set. Run these tests on the UNFIXED code to observe failures and understand the root cause.

**Test Cases**:
1. **Valid Movie URL Test**: Generate URL for valid movie TMDB ID (will pass on unfixed code, but error state might persist)
2. **Valid TV URL Test**: Generate URL for valid TV TMDB ID with season/episode (will pass on unfixed code, but error state might persist)
3. **URL with Subtitle Language Test**: Generate URL with subtitle language parameter (will pass on unfixed code, but error state might persist)
4. **Iframe Load Success Test**: Simulate iframe load event and verify error state is cleared (will fail on unfixed code)

**Expected Counterexamples**:
- Error state persists even though URL generation succeeds
- Iframe load events are not handled, so there's no confirmation of successful loading
- Component displays error UI despite valid URL and successful iframe load

### Fix Checking

**Goal**: Verify that for all inputs where the bug condition holds, the fixed function produces the expected behavior.

**Pseudocode:**
```
FOR ALL input WHERE isBugCondition(input) DO
  result := useVidsrcPlayer_fixed(input)
  ASSERT result.error == null
  ASSERT result.embedURL != null
  ASSERT result.loading == false
  
  // Simulate iframe load event
  iframeElement.dispatchEvent(new Event('load'))
  
  // Verify component displays player without error
  ASSERT errorUINotDisplayed()
  ASSERT iframeDisplayed()
END FOR
```

### Preservation Checking

**Goal**: Verify that for all inputs where the bug condition does NOT hold, the fixed function produces the same result as the original function.

**Pseudocode:**
```
FOR ALL input WHERE NOT isBugCondition(input) DO
  ASSERT useVidsrcPlayer_original(input) = useVidsrcPlayer_fixed(input)
END FOR
```

**Testing Approach**: Property-based testing is recommended for preservation checking because:
- It generates many test cases automatically across the input domain
- It catches edge cases that manual unit tests might miss
- It provides strong guarantees that behavior is unchanged for all non-buggy inputs

**Test Plan**: Observe behavior on UNFIXED code first for invalid TMDB IDs and domain failures, then write property-based tests capturing that behavior.

**Test Cases**:
1. **Invalid TMDB ID Preservation**: Verify invalid TMDB IDs continue to show error message
2. **All Domains Failed Preservation**: Verify all domains failed error continues to display
3. **Retry Functionality Preservation**: Verify retry button continues to work after legitimate errors
4. **Subtitle Language Preservation**: Verify subtitle language changes continue to work
5. **Loading State Preservation**: Verify loading skeleton continues to display during URL generation

### Unit Tests

- Test that valid URL generation sets `error: null` and `loading: false`
- Test that invalid TMDB ID still sets appropriate error state
- Test that all domains failed still sets appropriate error state
- Test that iframe load event is handled correctly
- Test that iframe error event is handled correctly
- Test that retry function resets state correctly

### Property-Based Tests

- Generate random valid TMDB IDs and verify no error state is set
- Generate random invalid TMDB IDs and verify error state is set
- Generate random subtitle languages and verify URL is generated correctly
- Test that all non-buggy inputs produce same behavior as original code

### Integration Tests

- Test full flow: valid TMDB ID → URL generation → iframe load → player displays
- Test error flow: invalid TMDB ID → error message displays → retry → success
- Test subtitle language change: select language → URL updates → iframe reloads
- Test iframe failure: URL valid → iframe fails to load → error message displays
