# Vidsrc iframe Sandbox Fix - Design Document

## Overview

The Vidsrc streaming player iframe is missing the `allow-popups` sandbox permission, which prevents video playback. The player loads successfully but videos fail to play because the iframe cannot open popups needed for player controls, ads, and other functionality. This fix adds `allow-popups` to the sandbox attribute while maintaining all existing security constraints. The iframe remains restricted to whitelisted domains only, with strict referrer policy enforcement.

## Glossary

- **Bug_Condition (C)**: The condition that triggers the bug - when the iframe sandbox attribute lacks `allow-popups` permission, blocking popup requests from the player
- **Property (P)**: The desired behavior when popups are requested - the iframe should allow popup requests without blocking them
- **Preservation**: Existing security constraints and non-popup functionality that must remain unchanged by the fix
- **VidsrcStreamingPlayer**: The React component in `src/features/vidsrc-streaming/components/VidsrcStreamingPlayer.tsx` that renders the iframe
- **sandbox attribute**: The HTML iframe attribute that restricts iframe capabilities for security
- **allow-popups**: The sandbox permission that allows the iframe to open new windows/tabs
- **Whitelisted domains**: The set of approved Vidsrc domains (vidsrc.to, vidsrc.xyz, vidsrc.net, vidsrc.pm, vidsrc.icu) from which embed URLs are generated

## Bug Details

### Bug Condition

The bug manifests when a user attempts to play a video in the Vidsrc streaming player. The iframe's sandbox attribute is missing the `allow-popups` permission, which causes the browser to block popup requests from the embedded player. This prevents the player from opening necessary popups for controls, ads, or other player features.

**Formal Specification:**
```
FUNCTION isBugCondition(input)
  INPUT: input of type IframeElement
  OUTPUT: boolean
  
  RETURN input.sandbox.includes('allow-scripts')
         AND input.sandbox.includes('allow-same-origin')
         AND input.sandbox.includes('allow-presentation')
         AND NOT input.sandbox.includes('allow-popups')
         AND input.src.startsWith('https://')
         AND isWhitelistedDomain(input.src)
END FUNCTION
```

### Examples

- **Example 1 - Popup Blocking Error**: User clicks play on a movie. The player attempts to open a popup for video controls. Browser console shows: "Blocked opening 'about:blank' in a new window because the request was made in a sandboxed frame whose 'allow-popups' permission is not set". Video fails to play.

- **Example 2 - External Popup Blocking**: User clicks play on a TV episode. The player attempts to open an external popup for ads or analytics. Browser console shows: "Blocked opening 'https://invl.io/...' in a new window because the request was made in a sandboxed frame whose 'allow-popups' permission is not set". Video fails to play.

- **Example 3 - Player Initialization Failure**: User attempts to play content in any UI context (movie, TV show, etc.). The player's initialization script tries to open popups but is blocked. The player fails to initialize video playback functionality.

- **Edge Case - Whitelisted Domain**: The bug occurs regardless of which whitelisted domain is used (vidsrc.to, vidsrc.xyz, vidsrc.net, vidsrc.pm, vidsrc.icu). All domains are affected equally because the sandbox attribute is set at the component level.

## Expected Behavior

### Preservation Requirements

**Unchanged Behaviors:**
- Mouse clicks on action buttons must continue to work exactly as before
- Button display with numbered shortcuts must remain unchanged
- Game state transitions between UI contexts must remain unchanged
- The iframe must continue to enforce all other sandbox restrictions (no allow-top-navigation, no allow-same-origin-by-default)
- The referrer policy must remain set to `no-referrer` to prevent referrer leakage
- HTTPS URLs only from whitelisted domains must continue to be enforced
- The `allow-scripts`, `allow-same-origin`, and `allow-presentation` permissions must remain in place

**Scope:**
All inputs that do NOT involve popup requests should be completely unaffected by this fix. This includes:
- Mouse clicks on buttons and player controls
- Other keyboard inputs (arrow keys, Enter, Escape, etc.)
- Touch inputs (if applicable)
- Non-popup player functionality (video playback, subtitle selection, fullscreen mode)
- Domain fallback logic and health checks
- Subtitle preference persistence

## Hypothesized Root Cause

Based on the bug description, the root cause is clear:

1. **Missing Sandbox Permission**: The iframe's sandbox attribute is missing the `allow-popups` permission. The current attribute is `sandbox="allow-scripts allow-same-origin allow-presentation"`, which explicitly does not include `allow-popups`. This causes the browser to block all popup requests from the iframe.

2. **Player Dependency on Popups**: The Vidsrc player implementation requires the ability to open popups for various functionality including player controls, ads, analytics, or other features. Without this permission, the player cannot initialize or function properly.

3. **Security Trade-off**: The `allow-popups` permission was likely omitted due to security concerns, but the player cannot function without it. The fix adds this permission while maintaining other security constraints.

## Correctness Properties

Property 1: Bug Condition - Iframe Allows Popup Requests

_For any_ iframe element where the bug condition holds (sandbox attribute lacks `allow-popups`), the fixed iframe SHALL include `allow-popups` in its sandbox attribute, allowing the embedded player to open popups without browser blocking.

**Validates: Requirements 2.1, 2.2, 2.3**

Property 2: Preservation - Security Constraints Maintained

_For any_ iframe element where the bug condition does NOT hold (sandbox attribute already includes `allow-popups`), the fixed code SHALL produce exactly the same behavior as the original code, preserving all existing security constraints including referrer policy, domain whitelisting, and other sandbox restrictions.

**Validates: Requirements 3.1, 3.2, 3.3, 3.4**

## Fix Implementation

### Changes Required

Assuming our root cause analysis is correct:

**File**: `src/features/vidsrc-streaming/components/VidsrcStreamingPlayer.tsx`

**Component**: `VidsrcStreamingPlayer`

**Specific Changes**:

1. **Update Sandbox Attribute**: Modify the iframe's sandbox attribute from `sandbox="allow-scripts allow-same-origin allow-presentation"` to `sandbox="allow-scripts allow-same-origin allow-popups allow-presentation"` to include the `allow-popups` permission.

2. **Maintain Referrer Policy**: Keep the referrer policy as `referrerPolicy="no-referrer"` to prevent referrer leakage to external domains.

3. **Preserve Other Attributes**: Ensure all other iframe attributes remain unchanged:
   - `allowFullScreen` attribute for fullscreen mode
   - `title` and `aria-label` for accessibility
   - CSS classes for styling and layout
   - Event handlers for load/error handling

4. **No Additional Permissions**: Do NOT add `allow-popups-to-escape-sandbox` at this time, as it is not required for basic popup functionality and adds additional security considerations.

## Testing Strategy

### Validation Approach

The testing strategy follows a two-phase approach: first, surface counterexamples that demonstrate the bug on unfixed code, then verify the fix works correctly and preserves existing behavior.

### Exploratory Bug Condition Checking

**Goal**: Surface counterexamples that demonstrate the bug BEFORE implementing the fix. Confirm or refute the root cause analysis. If we refute, we will need to re-hypothesize.

**Test Plan**: Write tests that verify the iframe's sandbox attribute contains or lacks `allow-popups`. Run these tests on the UNFIXED code to observe that `allow-popups` is missing, confirming the bug condition.

**Test Cases**:
1. **Sandbox Attribute Missing allow-popups**: Verify that the unfixed iframe's sandbox attribute does NOT include `allow-popups` (will pass on unfixed code, confirming the bug)
2. **Sandbox Attribute Has Required Permissions**: Verify that the unfixed iframe's sandbox attribute includes `allow-scripts`, `allow-same-origin`, and `allow-presentation` (will pass on unfixed code)
3. **Referrer Policy Set Correctly**: Verify that the unfixed iframe's referrer policy is `no-referrer` (will pass on unfixed code)
4. **URL Uses Whitelisted Domain**: Verify that the unfixed iframe's URL uses a whitelisted domain (will pass on unfixed code)

**Expected Counterexamples**:
- The sandbox attribute does not include `allow-popups`, confirming the bug condition
- Possible causes: The sandbox attribute was intentionally set without `allow-popups` for security reasons, but this prevents the player from functioning

### Fix Checking

**Goal**: Verify that for all inputs where the bug condition holds, the fixed function produces the expected behavior.

**Pseudocode:**
```
FOR ALL iframeElement WHERE isBugCondition(iframeElement) DO
  fixedIframe := VidsrcStreamingPlayer_fixed(iframeElement)
  ASSERT fixedIframe.sandbox.includes('allow-popups')
  ASSERT fixedIframe.sandbox.includes('allow-scripts')
  ASSERT fixedIframe.sandbox.includes('allow-same-origin')
  ASSERT fixedIframe.sandbox.includes('allow-presentation')
  ASSERT fixedIframe.referrerPolicy == 'no-referrer'
END FOR
```

### Preservation Checking

**Goal**: Verify that for all inputs where the bug condition does NOT hold, the fixed function produces the same result as the original function.

**Pseudocode:**
```
FOR ALL iframeElement WHERE NOT isBugCondition(iframeElement) DO
  ASSERT VidsrcStreamingPlayer_original(iframeElement) = VidsrcStreamingPlayer_fixed(iframeElement)
END FOR
```

**Testing Approach**: Property-based testing is recommended for preservation checking because:
- It generates many test cases automatically across the input domain
- It catches edge cases that manual unit tests might miss
- It provides strong guarantees that behavior is unchanged for all non-buggy inputs

**Test Plan**: Observe behavior on UNFIXED code first for non-popup functionality, then write property-based tests capturing that behavior.

**Test Cases**:
1. **Referrer Policy Preservation**: Verify that the referrer policy remains `no-referrer` after the fix
2. **Domain Whitelisting Preservation**: Verify that only whitelisted domains are used after the fix
3. **Other Sandbox Permissions Preservation**: Verify that `allow-scripts`, `allow-same-origin`, and `allow-presentation` remain in the sandbox attribute
4. **Security Restrictions Preservation**: Verify that `allow-top-navigation` and other dangerous permissions are NOT added
5. **URL Format Preservation**: Verify that HTTPS URLs with `/embed/` path and TMDB parameters continue to work

### Unit Tests

- Test that the iframe's sandbox attribute includes exactly the required permissions: `allow-scripts`, `allow-same-origin`, `allow-popups`, `allow-presentation`
- Test that the iframe's sandbox attribute does NOT include dangerous permissions like `allow-top-navigation`
- Test that the referrer policy is set to `no-referrer`
- Test that the iframe URL uses HTTPS protocol
- Test that the iframe URL uses a whitelisted domain
- Test that the iframe has the `allowFullScreen` attribute
- Test that the iframe has proper accessibility attributes (`title`, `aria-label`)

### Property-Based Tests

- Generate random iframe configurations and verify that the sandbox attribute always includes `allow-popups` when the bug is fixed
- Generate random domain configurations and verify that only whitelisted domains are used
- Generate random referrer policy configurations and verify that `no-referrer` is always used
- Test that all non-popup player functionality continues to work across many scenarios

### Integration Tests

- Test full video playback flow with the fixed iframe in each UI context (movie, TV show)
- Test that popup requests from the player are no longer blocked
- Test that domain fallback logic continues to work correctly
- Test that subtitle selection and persistence continue to work
- Test that fullscreen mode continues to work
- Test that error handling and retry logic continue to work
