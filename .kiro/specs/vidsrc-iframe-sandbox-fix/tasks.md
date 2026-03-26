# Implementation Tasks - Vidsrc iframe Sandbox Fix

## Task 1: Add allow-popups to iframe sandbox attribute
- [ ] 1.1 Open `src/features/vidsrc-streaming/components/VidsrcStreamingPlayer.tsx`
- [ ] 1.2 Locate the iframe element's sandbox attribute
- [ ] 1.3 Update sandbox from `"allow-scripts allow-same-origin allow-presentation"` to `"allow-scripts allow-same-origin allow-popups allow-presentation"`
- [ ] 1.4 Verify referrerPolicy remains `"no-referrer"`
- [ ] 1.5 Verify allowFullScreen attribute is present
- [ ] 1.6 Run tests to confirm fix works: `npm test -- VidsrcStreamingPlayer.test.tsx --run`

## Task 2: Verify security constraints are maintained
- [ ] 2.1 Confirm sandbox attribute does NOT include `allow-top-navigation`
- [ ] 2.2 Confirm sandbox attribute does NOT include `allow-same-origin-by-default`
- [ ] 2.3 Run security tests: `npm test -- VidsrcStreamingPlayer.security.test.tsx --run`
- [ ] 2.4 Verify all security tests pass

## Task 3: Verify preservation of existing functionality
- [ ] 3.1 Run all vidsrc-streaming component tests: `npm test -- src/features/vidsrc-streaming/components --run`
- [ ] 3.2 Confirm no regressions in other components
- [ ] 3.3 Verify domain whitelisting still works
- [ ] 3.4 Verify subtitle preferences still persist
