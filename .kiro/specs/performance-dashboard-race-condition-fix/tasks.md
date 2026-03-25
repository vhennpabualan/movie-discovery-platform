# Implementation Plan

## Phase 1: Exploratory Testing

- [ ] 1. Write bug condition exploration test
  - **Property 1: Bug Condition** - Crash on Undefined Metrics During Initial Render
  - **CRITICAL**: This test MUST FAIL on unfixed code - failure confirms the bug exists
  - **DO NOT attempt to fix the test or the code when it fails**
  - **NOTE**: This test encodes the expected behavior - it will validate the fix when it passes after implementation
  - **GOAL**: Surface counterexamples that demonstrate the bug exists
  - **Scoped PBT Approach**: For deterministic bugs, scope the property to the concrete failing case(s) to ensure reproducibility
  - Test that PerformanceDashboard component crashes when rendering with undefined Web Vitals metrics
  - Simulate initial render before Performance Observer API collects metrics (webVitals = null)
  - Assert that unfixed code throws TypeError when calling `.toFixed()` on undefined metric values
  - Test cases:
    - Render with webVitals = null, expect TypeError on LCP display
    - Render with webVitals = null, expect TypeError on FID display
    - Render with webVitals = null, expect TypeError on CLS display
  - The test assertions should match the Expected Behavior Properties from design (safe display without crashing)
  - Run test on UNFIXED code
  - **EXPECTED OUTCOME**: Test FAILS (this is correct - it proves the bug exists)
  - Document counterexamples found to understand root cause (e.g., "TypeError: Cannot read property 'value' of undefined")
  - Mark task complete when test is written, run, and failure is documented
  - _Requirements: 1.1, 1.2, 1.3, 1.4_

- [ ] 2. Write preservation property tests (BEFORE implementing fix)
  - **Property 2: Preservation** - Metric Display After Collection
  - **IMPORTANT**: Follow observation-first methodology
  - Observe behavior on UNFIXED code for non-buggy inputs (when metrics ARE defined)
  - Write property-based tests capturing observed behavior patterns from Preservation Requirements
  - Property-based testing generates many test cases for stronger guarantees
  - Test cases:
    - Generate random metric values and verify display precision (0 decimals for LCP/FID, 4 decimals for CLS)
    - Generate random metric ratings and verify color coding (green for 'good', yellow for 'needs-improvement', red for 'poor')
    - Verify API metrics display continues to work correctly
    - Verify dashboard toggle functionality continues to work
    - Verify production environment behavior (returns null)
  - Run tests on UNFIXED code
  - **EXPECTED OUTCOME**: Tests PASS (this confirms baseline behavior to preserve)
  - Mark task complete when tests are written, run, and passing on unfixed code
  - _Requirements: 3.1, 3.2, 3.3, 3.4_

## Phase 2: Implementation

- [ ] 3. Fix race condition in PerformanceDashboard metric display

  - [ ] 3.1 Implement the fix
    - Update LCP display: Replace `{webVitals.lcp.value.toFixed(0)}ms` with `{webVitals?.lcp?.value?.toFixed(0) ?? '0.00'}ms`
    - Update FID display: Replace `{webVitals.fid.value.toFixed(0)}ms` with `{webVitals?.fid?.value?.toFixed(0) ?? '0.00'}ms`
    - Update CLS display: Replace `{webVitals.cls.value.toFixed(4)}` with `{webVitals?.cls?.value?.toFixed(4) ?? '0.00'}`
    - Use optional chaining (`?.`) to safely access nested properties
    - Use nullish coalescing (`??`) to provide fallback values when properties are undefined
    - Preserve existing conditional rendering checks (`{webVitals?.lcp && (...)}`), which prevent rendering metric blocks if metric is undefined
    - Preserve color coding logic based on metric ratings
    - File: `src/features/ui/components/PerformanceDashboard.tsx`
    - _Bug_Condition: isBugCondition(render) where webVitals is null or metric properties are undefined_
    - _Expected_Behavior: expectedBehavior(result) - safely display fallback values without crashing, then display actual values once collected_
    - _Preservation: Metric display precision, color coding based on ratings, API metrics display, production environment behavior_
    - _Requirements: 2.1, 2.2, 2.3, 2.4_

  - [ ] 3.2 Verify bug condition exploration test now passes
    - **Property 1: Expected Behavior** - Crash on Undefined Metrics During Initial Render
    - **IMPORTANT**: Re-run the SAME test from task 1 - do NOT write a new test
    - The test from task 1 encodes the expected behavior
    - When this test passes, it confirms the expected behavior is satisfied
    - Run bug condition exploration test from step 1
    - **EXPECTED OUTCOME**: Test PASSES (confirms bug is fixed)
    - Verify that component no longer crashes when rendering with undefined metrics
    - Verify that component displays fallback values ('0.00') when metrics are undefined
    - _Requirements: 2.1, 2.2, 2.3, 2.4_

  - [ ] 3.3 Verify preservation tests still pass
    - **Property 2: Preservation** - Metric Display After Collection
    - **IMPORTANT**: Re-run the SAME tests from task 2 - do NOT write new tests
    - Run preservation property tests from step 2
    - **EXPECTED OUTCOME**: Tests PASS (confirms no regressions)
    - Confirm all tests still pass after fix (no regressions)
    - Verify metric display precision is unchanged (0 decimals for LCP/FID, 4 decimals for CLS)
    - Verify color coding logic continues to work correctly
    - Verify API metrics display continues to work correctly
    - Verify dashboard toggle functionality continues to work
    - Verify production environment behavior is unchanged
    - _Requirements: 3.1, 3.2, 3.3, 3.4_

## Phase 3: Validation

- [ ] 4. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.
